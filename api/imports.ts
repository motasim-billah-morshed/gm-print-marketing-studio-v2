import {fork} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {z} from 'zod';
import {audit,Fault,get,hash,permit,type Actor,type DB,type Entity} from './db.js';
import {create,normalize,observe,type Origin} from './domain.js';
import type {Sheet} from './parser.js';
export const aliases:Record<string,string[]>={company:['company','company name','কোম্পানি','প্রতিষ্ঠান'],group:['group','group name','গ্রুপ'],branch:['branch','factory','শাখা'],source_id:['source id','external id'],canonical_id:['canonical id','company id'],contact:['contact','contact name','নাম','যোগাযোগ'],contact_id:['contact id','canonical contact id'],designation:['designation','পদবি'],department:['department','বিভাগ'],email:['email','ইমেইল'],phone:['phone','mobile','ফোন','মোবাইল'],website:['website','ওয়েবসাইট'],social:['social','social url'],address:['address','location','ঠিকানা'],industry:['industry','শিল্প'],reference:['source','source reference','উৎস'],consent:['consent','consent evidence','সম্মতি']};
export function parseBounded(file:string,kind:string):Promise<Sheet[]> {
 return new Promise((resolve,reject)=>{
  const child=fork(fileURLToPath(new URL('./parse-process.ts',import.meta.url)),[],{execArgv:['--import','tsx'],stdio:['ignore','ignore','ignore','ipc']});
  const timer=setTimeout(()=>{child.kill();reject(new Fault(422,'Parser time limit exceeded'));},30000);
  child.on('message',(m:any)=>{clearTimeout(timer);m.error?reject(new Fault(422,m.error)):resolve(m.sheets);});
  child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('exit',code=>{clearTimeout(timer);if(code)reject(new Fault(422,'Parser stopped'));});
  child.send({path:file,kind});
 });
}
export async function upload(c:DB,a:Actor,file:Express.Multer.File) {
 const kind=path.extname(file.originalname).slice(1).toLowerCase();
 let sheets:Sheet[];
 try{sheets=await parseBounded(file.path,kind);}catch(e){await fs.unlink(file.path);throw e;}
 const content=await fs.readFile(file.path),digest=hash(content.toString('base64'));
 const source=(await c.query('INSERT INTO source(workspace_id,type,reference,file_path,actor_id) VALUES($1,$2,$3,$4,$5) RETURNING id',[a.workspace_id,'Upload',path.basename(file.originalname),path.resolve(file.path),a.id])).rows[0];
 const batch=(await c.query('INSERT INTO import_batch(workspace_id,actor_id,source_id,file_hash) VALUES($1,$2,$3,$4) RETURNING *',[a.workspace_id,a.id,source.id,digest])).rows[0];
 await fs.writeFile(file.path+'.parsed.json',JSON.stringify(sheets));
 await audit(c,a,'Upload','import_batch',batch.id,1,{source_id:source.id});
 return {...batch,sheets:sheets.map(s=>({name:s.name,headers:s.headers,row_count:s.rows.length})),aliases};
}
export async function batchGet(c:DB,a:Actor,id:string,lock=false) {
 const r=(await c.query(`SELECT b.*,s.file_path,s.reference FROM import_batch b JOIN source s ON s.id=b.source_id WHERE b.id=$1 AND b.workspace_id=$2 ${lock?'FOR UPDATE OF b':''}`,[id,a.workspace_id])).rows[0];
 if(!r)throw new Fault(404,'Import পাওয়া যায়নি।');return r;
}
const previewSchema=z.object({sheet:z.string(),mapping:z.record(z.string(),z.string()),namespace:z.string().trim().min(1).max(100),version:z.number().int().nonnegative()}).strict();
export async function preview(c:DB,a:Actor,id:string,input:any) {
 const d=previewSchema.parse(input),b=await batchGet(c,a,id,true);
 if(!['Uploaded','Preview'].includes(b.state))throw new Fault(409,'এই batch আর remap করা যাবে না।');
 if(d.version!==b.mapping_version)throw new Fault(409,'Mapping পরিবর্তিত হয়েছে; reload করুন।');
 if(Object.keys(d.mapping).some(k=>!(k in aliases)))throw new Fault(422,'Unknown mapping field');
 const sheets:Sheet[]=JSON.parse(await fs.readFile(b.file_path+'.parsed.json','utf8'));const s=sheets.find(s=>s.name===d.sheet);
 if(!s||!d.mapping.company||Object.values(d.mapping).some(v=>!s.headers.includes(v)))throw new Fault(422,'সঠিক sheet এবং company mapping প্রয়োজন।');
 const fingerprint=hash({file:b.file_hash,sheet:d.sheet,mapping:d.mapping,namespace:d.namespace});
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[a.workspace_id+fingerprint]);
 const existing=(await c.query('SELECT id,state FROM import_batch WHERE workspace_id=$1 AND fingerprint=$2 AND id<>$3',[a.workspace_id,fingerprint,id])).rows[0];
 if(existing)return {duplicate_batch:existing.id,state:existing.state,message:'একই file/mapping আগেই আছে; original batch ব্যবহার করুন।'};
 await c.query('DELETE FROM import_row WHERE batch_id=$1',[id]);
 const mapped=s.rows.map(raw=>Object.fromEntries(Object.entries(d.mapping).map(([key,col])=>[key,(raw[col]||'').trim()])));
 const names=new Map<string,number>();for(const row of mapped)names.set(row.company.toLowerCase(),(names.get(row.company.toLowerCase())||0)+1);
 const rowHashes=new Set<string>();const counts:Record<string,number>={accepted:0,rejected:0,duplicate:0,'needs-review':0,ignored:0,input_rows:mapped.length};
 for(let i=0;i<mapped.length;i++) {
  const row=mapped[i],number=i+2;let status='accepted',reason='',companyId:string|null=null;
  if(!Object.values(row).some(Boolean))status='ignored';
  else if(!row.company){status='rejected';reason='Company name প্রয়োজন';}
  else if(Object.values(row).some(v=>v.length>2000)){status='rejected';reason='Field length exceeds 2000';}
  else {
   try {if(row.email)normalize('Email',row.email);if(row.phone)normalize('Phone',row.phone);if(row.website)normalize('Website',row.website);if(row.social)normalize('Social',row.social);}catch(e){status='rejected';reason=(e as Error).message;}
   if(row.canonical_id) {try{z.string().uuid().parse(row.canonical_id);await get(c,a,'company',row.canonical_id);companyId=row.canonical_id;}catch{status='rejected';reason='Canonical company ID invalid';}}
   else if(row.source_id) {
    companyId=(await c.query('SELECT company_id FROM source_identity WHERE workspace_id=$1 AND namespace=$2 AND source_key=$3',[a.workspace_id,d.namespace,row.source_id])).rows[0]?.company_id||null;
    const variants=new Set(mapped.filter(r=>r.source_id===row.source_id).map(r=>r.company.toLowerCase()));
    if(variants.size>1){status='needs-review';reason='Source ID has conflicting company names';}
   } else if(status==='accepted' && ((names.get(row.company.toLowerCase())||0)>1 || (await c.query('SELECT 1 FROM company WHERE workspace_id=$1 AND lower(name)=lower($2) AND active',[a.workspace_id,row.company])).rowCount)) {status='needs-review';reason='Ambiguous company identity; select canonical company or reviewer-confirm new identity';}
   if(row.contact_id){try{z.string().uuid().parse(row.contact_id);await get(c,a,'contact',row.contact_id);}catch{status='rejected';reason='Canonical contact ID invalid';}}
   if(status==='accepted'&&row.contact&&!row.contact_id){
    const existing=companyId&&(await c.query('SELECT 1 FROM contact co JOIN contact_company_role rel ON rel.contact_id=co.id WHERE co.workspace_id=$1 AND rel.company_id=$2 AND co.active AND rel.active AND lower(co.name)=lower($3)',[a.workspace_id,companyId,row.contact])).rowCount;
    const repeats=mapped.filter(x=>x.contact?.toLowerCase()===row.contact.toLowerCase()&&(x.canonical_id||x.source_id||x.company)===(row.canonical_id||row.source_id||row.company)).length>1;
    if(existing||repeats){status='needs-review';reason='Ambiguous contact identity; select contact ID or reviewer-confirm distinct new contact';}
   }
   if(row.designation&&!row.contact){status='needs-review';reason='Designation without contact; review mapping';}
   if(s.warnings[number]){status=s.warnings[number].includes('Formula')?'rejected':'needs-review';reason=s.warnings[number];}
  }
  const rowhash=hash(row);if(rowHashes.has(rowhash)){status='duplicate';reason='Exact duplicate row in this batch';}rowHashes.add(rowhash);
  await c.query('INSERT INTO import_row(batch_id,row_number,data,raw_data,status,reason,company_id) VALUES($1,$2,$3,$4,$5,$6,$7)',[id,number,row,s.rows[i],status,reason,companyId]);counts[status]++;
 }
 await c.query("UPDATE import_batch SET sheet=$2,mapping=$3,mapping_version=mapping_version+1,state='Preview',fingerprint=$4,counts=$5 WHERE id=$1",[id,d.sheet,{columns:d.mapping,namespace:d.namespace},fingerprint,counts]);
 await audit(c,a,'Preview','import_batch',id,b.mapping_version+1,{counts});return {id,counts,mapping_version:b.mapping_version+1};
}
export async function resolveRow(c:DB,a:Actor,batchId:string,rowId:string,input:any) {
 await permit(c,a,'review');const b=await batchGet(c,a,batchId,true);
 if(b.state!=='Preview')throw new Fault(409,'Review requires preview state');
 const d=z.object({company_id:z.string().uuid().optional(),new_identity:z.string().min(1).max(100).optional(),contact_id:z.string().uuid().optional(),new_contact:z.boolean().optional(),evidence:z.string().trim().min(1).max(2000),version:z.number().int()}).strict().parse(input);
 if(d.version!==b.mapping_version)throw new Fault(409,'Review changed; reload batch');
 if(!!d.company_id===!!d.new_identity)throw new Fault(422,'একটি canonical ID অথবা new source identity দিন।');
 const row=(await c.query('SELECT * FROM import_row WHERE id=$1 AND batch_id=$2',[rowId,batchId])).rows[0];
 if(!row||row.status!=='needs-review')throw new Fault(422,'Row is not awaiting review');
 if(row.reason?.includes('Designation without contact'))throw new Fault(422,'Mapping সংশোধন করে পুনরায় preview করুন।');
 if(d.company_id)await get(c,a,'company',d.company_id);
 if(row.reason?.includes('contact identity')&&!d.contact_id&&!d.new_contact)throw new Fault(422,'Contact ID অথবা distinct new contact confirmation প্রয়োজন।');
 const data={...row.data,review_evidence:d.evidence};if(d.new_identity)data.source_id=d.new_identity;
 if(d.contact_id){await get(c,a,'contact',d.contact_id);data.contact_id=d.contact_id;}
 await c.query("UPDATE import_row SET company_id=$2,data=$3,status='accepted',reason='Reviewer resolved' WHERE id=$1",[rowId,d.company_id||null,data]);
 await c.query('UPDATE import_batch SET mapping_version=mapping_version+1 WHERE id=$1',[batchId]);
 await audit(c,a,'IdentityReview','import_row',rowId,b.mapping_version+1,{batch_id:batchId});return {id:rowId,mapping_version:b.mapping_version+1};
}
export async function enqueue(c:DB,a:Actor,id:string,kind:string,version:number) {
 const b=await batchGet(c,a,id,true);
 const active=(await c.query("SELECT * FROM job WHERE batch_id=$1 AND kind=$2 AND state IN ('Queued','Running','Completed') ORDER BY created_at DESC LIMIT 1",[id,kind])).rows[0];
 if(active)return active;
 if(version!==b.mapping_version)throw new Fault(409,'Mapping version changed');
 if(kind==='commit') {
  if(b.state!=='Preview')throw new Fault(409,'Preview required');
  if((await c.query("SELECT 1 FROM import_row WHERE batch_id=$1 AND status='needs-review'",[id])).rowCount)throw new Fault(422,'Needs-review rows আগে resolve করুন।');
 }else if(!['Committed','RollbackConflict'].includes(b.state))throw new Fault(409,'Committed import required');
 const job=(await c.query('INSERT INTO job(workspace_id,batch_id,kind) VALUES($1,$2,$3) RETURNING *',[a.workspace_id,id,kind])).rows[0];
 await c.query('UPDATE import_batch SET actor_id=$2,state=$3 WHERE id=$1',[id,a.id,kind==='commit'?'CommitQueued':'RollbackQueued']);
 await audit(c,a,'Enqueue'+kind,'import_batch',id,version,{job_id:job.id});return job;
}
async function effect(c:DB,b:any,rowId:string,table:Entity,data:any) {
 if(data.reused)return;
 await c.query('INSERT INTO import_effect(batch_id,row_id,entity_type,entity_id,version,before_value,after_value) VALUES($1,$2,$3,$4,$5,$6,$7)',[b.id,rowId,table,data.id,data.version,data.before_value||null,data]);
}
export async function commit(c:DB,a:Actor,b:any) {
 const rows=(await c.query("SELECT * FROM import_row WHERE batch_id=$1 ORDER BY row_number",[b.id])).rows;
 const groups=new Map<string,string>(),branches=new Map<string,string>();
 let companies=0,contacts=0,effects=0;
 for(const row of rows) {
  if(row.status!=='accepted')continue;const d=row.data;
  const o:Origin={id:b.source_id,sheet:b.sheet,row:row.row_number};
  const make=async(table:Entity,input:any)=>{
   const raw={...input};
   for(const key of Object.keys(input)) {const mapped=key==='name'?({company:'company',company_group:'group',branch:'branch',contact:'contact'} as any)[table]:key==='raw_value'?({Email:'email',Phone:'phone',Website:'website',Social:'social'} as any)[input.channel]:key;const col=b.mapping.columns[mapped];if(col)raw[key]=row.raw_data[col];}
   const record=await create(c,a,table,input,{...o,raw});await effect(c,b,row.id,table,record);if(!record.reused)effects++;return record;
  };
  let companyId=row.company_id;
  if(d.source_id) {
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[a.workspace_id+b.mapping.namespace+d.source_id]);
   const known=(await c.query('SELECT company_id FROM source_identity WHERE workspace_id=$1 AND namespace=$2 AND source_key=$3',[a.workspace_id,b.mapping.namespace,d.source_id])).rows[0]?.company_id;
   if(companyId&&known&&companyId!==known)throw new Fault(409,'Source identity conflicts with canonical selection');
   companyId=companyId||known;
  }
  if(companyId){await get(c,a,'company',companyId);await observe(c,a,'company',companyId,{import_reference:b.id},o);}
  if(!companyId) {
   let groupId=groups.get(d.group);
   if(d.group&&!groupId){groupId=(await make('company_group',{name:d.group})).id;groups.set(d.group,groupId!);}
   companyId=(await make('company',{name:d.company,group_id:groupId||null,industry:d.industry||null,address:d.address||null,website:d.website||null})).id;companies++;
   if(d.source_id)await c.query('INSERT INTO source_identity VALUES($1,$2,$3,$4)',[a.workspace_id,b.mapping.namespace,d.source_id,companyId]);
  }
  let branchId:string|undefined;
  if(d.branch){const key=companyId+d.branch;branchId=branches.get(key);if(!branchId){branchId=(await make('branch',{company_id:companyId,name:d.branch,address:d.address||null})).id;branches.set(key,branchId!);}}
  let contactId:string|undefined;
  if(d.contact) {
   if(d.contact_id){contactId=(await get(c,a,'contact',d.contact_id)).id;}else{contactId=(await make('contact',{name:d.contact})).id;contacts++;}
   await make('contact_company_role',{company_id:companyId,contact_id:contactId,branch_id:branchId||null,designation:d.designation||null,department:d.department||null,normalized_role:null});
  }
  for(const [field,channel] of [['email','Email'],['phone','Phone'],['website','Website'],['social','Social']]) if(d[field]) {
   const ep=await make('channel_endpoint',{channel,raw_value:d[field]});
   const exists=(await c.query('SELECT 1 FROM endpoint_association WHERE endpoint_id=$1 AND company_id=$2 AND contact_id IS NOT DISTINCT FROM $3::uuid AND active',[ep.id,companyId,contactId||null])).rowCount;
   if(!exists)await make('endpoint_association',{endpoint_id:ep.id,company_id:companyId,contact_id:contactId||null});
   if(d.consent)await observe(c,a,'channel_endpoint',ep.id,{supplied_consent_claim:d.consent},o);
  }
  if(d.reference)await observe(c,a,'company',companyId,{supplied_source_reference:d.reference},o);
  await c.query('UPDATE import_row SET company_id=$2 WHERE id=$1',[row.id,companyId]);
 }
 const statusCounts=Object.fromEntries((await c.query('SELECT status,count(*)::int AS count FROM import_row WHERE batch_id=$1 GROUP BY status',[b.id])).rows.map(r=>[r.status,r.count]));
 const counts={...statusCounts,input_rows:rows.length,created_companies:companies,created_contacts:contacts,updated_records:0,entity_effects:effects};
 await c.query("UPDATE import_batch SET state='Committed',counts=$2 WHERE id=$1",[b.id,counts]);
 await audit(c,a,'ImportCommit','import_batch',b.id,b.mapping_version,{counts});return counts;
}
export async function rollback(c:DB,a:Actor,b:any) {
 // Descending FK order; tombstones preserve evidence/history. Subsequent activity blocks deletion.
 const order=['endpoint_association','contact_company_role','branch','contact','channel_endpoint','company','company_group'];
 const effects=(await c.query('SELECT * FROM import_effect WHERE batch_id=$1 AND NOT undone',[b.id])).rows.sort((a,b)=>order.indexOf(a.entity_type)-order.indexOf(b.entity_type));
 let undone=0,conflicts=0;
 for(const e of effects) {
  const table=e.entity_type as Entity,r=await get(c,a,table,e.entity_id,true);let why='';
  if(r.version!==e.version)why='Later edit/version';
  if((await c.query('SELECT 1 FROM field_observation WHERE entity_id=$1 AND source_id<>$2',[r.id,b.source_id])).rowCount)why='Later source/reference';
  if((await c.query('SELECT 1 FROM consent_event WHERE endpoint_id=$1 OR contact_id=$1',[r.id])).rowCount)why='Consent history must survive';
  if(table==='company'&&(await c.query('SELECT 1 FROM branch WHERE company_id=$1 AND active UNION ALL SELECT 1 FROM contact_company_role WHERE company_id=$1 AND active UNION ALL SELECT 1 FROM endpoint_association WHERE company_id=$1 AND active',[r.id])).rowCount)why='Active dependent records';
  if(table==='company'&&(await c.query("SELECT 1 FROM import_row r JOIN import_batch b ON b.id=r.batch_id WHERE r.company_id=$1 AND b.id<>$2 AND b.state IN ('Committed','RollbackConflict')",[r.id,b.id])).rowCount)why='Later import reference';
  if(table==='contact'&&(await c.query('SELECT 1 FROM contact_company_role WHERE contact_id=$1 AND active UNION ALL SELECT 1 FROM endpoint_association WHERE contact_id=$1 AND active',[r.id])).rowCount)why='Active contact relationships';
  if(table==='branch'&&(await c.query('SELECT 1 FROM contact_company_role WHERE branch_id=$1 AND active',[r.id])).rowCount)why='Active branch relationship';
  if(table==='channel_endpoint'&&(await c.query('SELECT 1 FROM endpoint_association WHERE endpoint_id=$1 AND active',[r.id])).rowCount)why='Shared endpoint still referenced';
  if(table==='company_group'&&(await c.query('SELECT 1 FROM company WHERE group_id=$1 AND active',[r.id])).rowCount)why='Active group member';
  if(table==='endpoint_association'&&(await c.query('SELECT 1 FROM consent_event WHERE endpoint_id=$1',[r.endpoint_id])).rowCount)why='Consent endpoint association retained';
  if(why){conflicts++;await c.query('UPDATE import_effect SET conflict=$2 WHERE id=$1',[e.id,why]);}
  else {await c.query(`UPDATE ${table} SET active=false,version=version+1 WHERE id=$1`,[r.id]);await c.query('UPDATE import_effect SET undone=true,conflict=NULL WHERE id=$1',[e.id]);undone++;}
 }
 const state=conflicts?'RollbackConflict':'RolledBack';
 await c.query('UPDATE import_batch SET state=$2 WHERE id=$1',[b.id,state]);await audit(c,a,'ImportRollback','import_batch',b.id,b.mapping_version,{undone,conflicts});return{undone,conflicts};
}
export const csvSafe=(value:unknown)=>{const s=String(value??'');return '"'+(/^[\s]*[=+@\-\t\r]/.test(s)?"'"+s:s).replace(/"/g,'""')+'"';};
