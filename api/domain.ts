import { z } from 'zod';
import { audit, Fault, get, permit, type Actor, type DB, type Entity } from './db.js';
const text = z.string().trim().max(2000);
const nullable = text.nullable().optional();
const uuid = z.string().uuid();
const ref = uuid.nullable().optional();
const name = text.min(1).max(250);
const date = z.string().date();
const schemas = {
  company: z.object({name,group_id:ref,industry:nullable,address:nullable,website:nullable}),
  company_group:z.object({name}),
  branch:z.object({name,company_id:uuid,address:nullable}),
  contact:z.object({name}),
  contact_company_role:z.object({company_id:uuid,contact_id:uuid,branch_id:ref,designation:nullable,normalized_role:nullable,department:nullable,valid_from:date.nullable().optional(),valid_to:date.nullable().optional()}),
  channel_endpoint:z.object({channel:z.enum(['Email','Phone','WhatsApp','Website','Social']),raw_value:text.min(1)}),
  endpoint_association:z.object({endpoint_id:uuid,company_id:uuid,contact_id:ref})
};
export const fields = Object.fromEntries(Object.entries(schemas).map(([k,v])=>[k,Object.keys(v.shape)]));
export type Origin = { id:string; sheet?:string; row?:number; raw?:Record<string,unknown> };
export async function manualSource(c: DB,a: Actor, reference: string) {
  if (!reference.trim()) throw new Fault(400,'তথ্যের উৎস/নোট দিন।');
  return (await c.query('INSERT INTO source(workspace_id,type,reference,actor_id) VALUES($1,$2,$3,$4) RETURNING id',[a.workspace_id,'Manual',reference.slice(0,2000),a.id])).rows[0].id;
}
export async function observe(c: DB,a: Actor,table: string,id: string,data: Record<string,unknown>,origin: Origin) {
  for (const [field,value] of Object.entries(data)) {
    await c.query('UPDATE field_observation SET selected=false WHERE workspace_id=$1 AND entity_type=$2 AND entity_id=$3 AND field=$4 AND selected',[a.workspace_id,table,id,field]);
    await c.query('INSERT INTO field_observation(workspace_id,entity_type,entity_id,field,raw_value,normalized_value,knowledge_status,source_id,sheet,row_number,actor_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[a.workspace_id,table,id,field,origin.raw?.[field]==null?(value==null?null:String(value)):String(origin.raw[field]),value==null?null:String(value),value==null?'UNKNOWN':'KNOWN',origin.id,origin.sheet,origin.row,a.id]);
  }
}
export function normalize(channel: string, raw: string) {
  if (channel==='Email') { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) throw new Fault(422,'ইমেইলের গঠন সঠিক নয়।'); return raw.trim().toLowerCase(); }
  if (channel==='Phone'||channel==='WhatsApp') { const v=raw.replace(/[\s().-]/g,''); if(!/^\+?\d{5,18}$/.test(v)) throw new Fault(422,'ফোনটি text হিসেবে সঠিকভাবে দিন।'); return v; }
  try { const u=new URL(raw); if(!['http:','https:'].includes(u.protocol)) throw 0; return u.href; } catch { throw new Fault(422,'একটি বৈধ http/https URL দিন।'); }
}
async function relations(c:DB,a:Actor,table:Entity,d:any) {
  if(d.group_id) await get(c,a,'company_group',d.group_id);
  if(d.company_id) await get(c,a,'company',d.company_id);
  if(d.contact_id) await get(c,a,'contact',d.contact_id);
  if(d.endpoint_id) await get(c,a,'channel_endpoint',d.endpoint_id);
  if(d.branch_id) { const b=await get(c,a,'branch',d.branch_id); if(b.company_id!==d.company_id) throw new Fault(422,'Branch এই কোম্পানির নয়।'); }
  if(d.valid_to && d.valid_from && d.valid_to<d.valid_from) throw new Fault(422,'Role end date শুরু হওয়ার আগের হতে পারে না।');
  if(table==='endpoint_association'&&d.contact_id && !(await c.query('SELECT 1 FROM contact_company_role WHERE workspace_id=$1 AND company_id=$2 AND contact_id=$3 AND active',[a.workspace_id,d.company_id,d.contact_id])).rowCount) throw new Fault(422,'এই company/contact relationship আগে যোগ করুন।');
}
export async function create(c:DB,a:Actor,table:Entity,input:any,origin:Origin) {
  const d: any=schemas[table].strict().parse(input);
  // Represent missing critical values explicitly as NULL, never invented strings.
  for(const f of fields[table]) if(d[f]===undefined) d[f]=null;
  await relations(c,a,table,d);
  if(table==='channel_endpoint') {
    d.normalized_value=normalize(d.channel,d.raw_value);
    await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[a.workspace_id+d.channel+d.normalized_value]);
    const exists=(await c.query('SELECT * FROM channel_endpoint WHERE workspace_id=$1 AND channel=$2 AND normalized_value=$3 FOR UPDATE',[a.workspace_id,d.channel,d.normalized_value])).rows[0];
    if(exists?.active) return {...exists,reused:true};
    if(exists) {
      const restored=(await c.query('UPDATE channel_endpoint SET active=true,version=version+1 WHERE id=$1 RETURNING *',[exists.id])).rows[0];
      await observe(c,a,table,exists.id,d,{...origin,raw:origin.raw||input});
      await audit(c,a,'Reactivate',table,exists.id,restored.version,{source_id:origin.id});
      return {...restored,before_value:exists};
    }
  }
  const keys=Object.keys(d); const vals=keys.map(k=>d[k]);
  const row=(await c.query(`INSERT INTO ${table}(workspace_id,${keys.join(',')}) VALUES($1,${keys.map((_,i)=>'$'+(i+2)).join(',')}) RETURNING *`,[a.workspace_id,...vals])).rows[0];
  await observe(c,a,table,row.id,d,{...origin,raw:origin.raw||input});
  await audit(c,a,'Create',table,row.id,row.version,{source_id:origin.id,fields:keys}); return row;
}
export async function update(c:DB,a:Actor,table:Entity,id:string,input:any,version:number,origin:Origin) {
  const current=await get(c,a,table,id,true);
  if (current.version!==version) {
    const conflict=(await c.query('INSERT INTO edit_conflict(workspace_id,entity_type,entity_id,current_value,proposed_value,actor_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[a.workspace_id,table,id,current,input,a.id])).rows[0];
    await audit(c,a,'EditConflict',table,id,current.version,{conflict_id:conflict.id},'Conflict');
    return {conflict:true,conflict_id:conflict.id,current,proposed:input};
  }
  const d:any=schemas[table].partial().strict().parse(input);
  if(!Object.keys(d).length) throw new Fault(422,'কোনো পরিবর্তন দেওয়া হয়নি।');
  // Move jobs by ending the old relationship and creating a new one.
  if(table==='contact_company_role' && ['company_id','contact_id','branch_id'].some(k=>k in d && d[k]!==current[k])) throw new Fault(422,'পুরোনো role end-date করুন এবং নতুন relationship যোগ করুন।');
  if(table==='endpoint_association') throw new Fault(422,'Endpoint association পরিবর্তনে নতুন relationship যোগ করুন।');
  if(table==='channel_endpoint' && ('channel' in d || 'raw_value' in d)) throw new Fault(422,'নতুন endpoint যোগ করুন; পুরোনো consent/history বদলাবে না।');
  await relations(c,a,table,{...current,valid_from:current.valid_from instanceof Date?current.valid_from.toISOString().slice(0,10):current.valid_from,...d});
  const keys=Object.keys(d);
  const row=(await c.query(`UPDATE ${table} SET ${keys.map((k,i)=>`${k}=$${i+3}`).join(',')}, version=version+1 WHERE id=$1 AND workspace_id=$2 RETURNING *`,[id,a.workspace_id,...keys.map(k=>d[k])])).rows[0];
  await observe(c,a,table,id,d,{...origin,raw:origin.raw||input}); await audit(c,a,'Update',table,id,row.version,{source_id:origin.id,fields:keys}); return row;
}
export async function verify(c:DB,a:Actor,id:string,status:string,evidence:string) {
  await permit(c,a,'review');
  if(!['Verified','Rejected'].includes(status)||!evidence?.trim()) throw new Fault(422,'Reviewer decision ও evidence প্রয়োজন।');
  const obs=(await c.query('SELECT o.* FROM field_observation o JOIN source s ON s.id=o.source_id AND s.workspace_id=o.workspace_id WHERE o.id=$1 AND o.workspace_id=$2 FOR UPDATE OF o',[id,a.workspace_id])).rows[0];
  if(!obs||obs.knowledge_status==='UNKNOWN') throw new Fault(422,'UNKNOWN বা উৎসহীন value verified করা যাবে না।');
  const decision=(await c.query('INSERT INTO verification_decision(workspace_id,observation_id,reviewer_id,evidence,decision) VALUES($1,$2,$3,$4,$5) RETURNING id',[a.workspace_id,id,a.id,evidence,status])).rows[0];
  await c.query('UPDATE field_observation SET verification=$2,last_checked=now() WHERE id=$1',[id,status]);
  await audit(c,a,'Verify','field_observation',id,undefined,{decision_id:decision.id}); return decision;
}
export async function consent(c:DB,a:Actor,input:any) {
  const d=z.object({endpoint_id:z.string().uuid(),contact_id:ref,purpose:name,status:z.enum(['Unknown','OptedIn','OptedOut']),evidence:text.min(1)}).strict().parse(input);
  await permit(c,a,d.status==='OptedIn'?'review':'withdraw');
  await get(c,a,'channel_endpoint',d.endpoint_id);
  if(d.contact_id) { await get(c,a,'contact',d.contact_id); if(!(await c.query('SELECT 1 FROM endpoint_association WHERE workspace_id=$1 AND endpoint_id=$2 AND contact_id=$3 AND active',[a.workspace_id,d.endpoint_id,d.contact_id])).rowCount) throw new Fault(422,'Contact এই endpoint-এর সাথে যুক্ত নয়।'); }
  await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[a.workspace_id+d.endpoint_id+d.purpose]);
  const event=(await c.query('INSERT INTO consent_event(workspace_id,endpoint_id,contact_id,purpose,status,evidence,actor_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[a.workspace_id,d.endpoint_id,d.contact_id,d.purpose,d.status,d.evidence,a.id])).rows[0];
  if(d.status==='OptedOut') await c.query('INSERT INTO suppression_rule(workspace_id,endpoint_id,purpose,event_id) VALUES($1,$2,$3,$4) ON CONFLICT(workspace_id,endpoint_id,purpose) DO UPDATE SET active=true,event_id=excluded.event_id',[a.workspace_id,d.endpoint_id,d.purpose,event.id]);
  // Regrant does not clear global suppression. A separate policy/review workflow is deferred.
  await audit(c,a,'Consent'+d.status,'channel_endpoint',d.endpoint_id,undefined,{consent_event_id:event.id}); return event;
}
export async function eligibility(c:DB,a:Actor,id:string,purpose:string,contact?:string) {
  const ep=await get(c,a,'channel_endpoint',id);
  if(contact) await get(c,a,'contact',contact);
  const suppressed=(await c.query('SELECT 1 FROM suppression_rule WHERE workspace_id=$1 AND endpoint_id=$2 AND active AND purpose IN ($3,\'*\')',[a.workspace_id,id,purpose])).rowCount;
  const event=(await c.query('SELECT * FROM consent_event WHERE workspace_id=$1 AND endpoint_id=$2 AND purpose=$3 AND contact_id IS NOT DISTINCT FROM $4::uuid ORDER BY created_at DESC,id DESC LIMIT 1',[a.workspace_id,id,purpose,contact||null])).rows[0];
  const verified=(await c.query("SELECT 1 FROM field_observation WHERE workspace_id=$1 AND entity_id=$2 AND field='raw_value' AND selected AND verification='Verified'",[a.workspace_id,id])).rowCount;
  const reasons=[]; if(suppressed) reasons.push('Suppressed'); if(event?.status!=='OptedIn') reasons.push(event?.status||'Unknown consent'); if(!verified) reasons.push('Endpoint not verified'); if(!['Email','WhatsApp'].includes(ep.channel)) reasons.push('Outbound channel unavailable');
  return {endpoint_id:id,channel:ep.channel,purpose,consent_status:event?.status||'Unknown',eligible:reasons.length===0,reasons,dispatch_enabled:false,dispatch_reason:'D3 outbound dispatch disabled'};
}
