import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
import {once} from 'node:events';
import type {Server} from 'node:http';
import ExcelJS from 'exceljs';
import {app} from '../api/server.js';
import {pool,tx} from '../api/db.js';
import {runOne} from '../api/worker.js';
import {csvSafe,parseBounded} from '../api/imports.js';
const suffix=randomUUID().slice(0,8);let server:Server,base:string,admin:Client,operator:Client,reviewer:Client,reader:Client,company:any,contact1:any,contact2:any,phone:any,other:any,committed:any;
class Client {
 cookie='';csrf='';
 async request(url:string,method='GET',body?:any,key=randomUUID(),status=200){
  const headers:any={Cookie:this.cookie};if(method!=='GET'){headers['X-CSRF-Token']=this.csrf;headers['Idempotency-Key']=key;if(!(body instanceof FormData))headers['Content-Type']='application/json';}
  const res=await fetch(base+'/api/v1'+url,{method,headers,body:method==='GET'?undefined:body instanceof FormData?body:JSON.stringify(body||{})});
  const cookie=res.headers.get('set-cookie');if(cookie)this.cookie=cookie.split(';')[0];
  const data=await res.json();assert.equal(res.status,status,JSON.stringify(data));if(data.csrf)this.csrf=data.csrf;return data;
 }
 async login(username:string){await this.request('/session');await this.request('/login','POST',{username,password:process.env.SEED_PASSWORD});return this;}
 async create(type:string,data:any){return this.request('/entities/'+type,'POST',{data,source:'Synthetic D3 test '+suffix});}
}
before(async()=>{assert.ok(process.env.SEED_PASSWORD,'Use private test seed password');server=app().listen(0,'127.0.0.1');await once(server,'listening');base='http://127.0.0.1:'+(server.address() as any).port;admin=await new Client().login('admin');operator=await new Client().login('operator');reviewer=await new Client().login('reviewer');reader=await new Client().login('reader');});
after(async()=>{await new Promise<void>(r=>server.close(()=>r()));await pool.end();});
const csvUpload=async(text:string)=>{const form=new FormData();form.set('file',new Blob([text],{type:'text/csv'}),'synthetic.csv');return operator.request('/imports','POST',form);};
const map={company:'Company',source_id:'Source ID',contact:'Contact',designation:'Designation',phone:'Phone',email:'Email'};
test('D3-01 preserved source IDs and Bengali requirements',async()=>{const data=JSON.parse(await fs.readFile('requirements.json','utf8'));assert.equal(data.length,16);assert.equal(data.flatMap((m:any)=>m.subs).length,64);assert.equal(data.flatMap((m:any)=>m.subs.flatMap((s:any)=>s.phases)).length,192);assert.match(data[0].title,/[\u0980-\u09ff]/);});
test('D3-02 real company ID, logout/login, API restart persistence',async()=>{
 company=await operator.create('company',{name:'D3 নমুনা '+suffix,address:'ঢাকা'});assert.match(company.id,/^[a-f0-9-]{36}$/);
 await operator.request('/logout','POST');operator=await new Client().login('operator');assert.equal((await operator.request('/companies/'+company.id)).company.name,company.name);
 await new Promise<void>(r=>server.close(()=>r()));server=app().listen(0,'127.0.0.1');await once(server,'listening');base='http://127.0.0.1:'+(server.address() as any).port;
 assert.equal((await operator.request('/companies/'+company.id)).company.id,company.id);
});
test('D3-03 two contacts in one company; second authorized session sees same records',async()=>{
 contact1=await operator.create('contact',{name:'নমুনা ব্যক্তি এক '+suffix});contact2=await operator.create('contact',{name:'নমুনা ব্যক্তি দুই '+suffix});
 for(const contact of [contact1,contact2])await operator.create('contact_company_role',{company_id:company.id,contact_id:contact.id,designation:'Merchandiser',valid_from:'2025-01-01'});
 const p=await reader.request('/companies/'+company.id);assert.equal(p.contacts.length,2);assert.equal((await reader.request('/companies?q='+encodeURIComponent(company.name))).total,1);
 assert.ok((await reader.request('/contacts?q='+encodeURIComponent(contact1.name))).rows.some((r:any)=>r.id===contact1.id&&r.relationships.some((rel:any)=>rel.company_id===company.id)));
 const atomic=await operator.create('company',{name:'Atomic contact '+suffix});
 await operator.request('/companies/'+atomic.id+'/contacts','POST',{name:'Atomic person '+suffix,designation:'Buyer',source:'Synthetic atomic contact'});
 const atomicProfile=await reader.request('/companies/'+atomic.id);assert.equal(atomicProfile.contacts.length,1);assert.equal(atomicProfile.contacts[0].valid_from,null);
});
test('D3-04 shared business endpoints do not merge distinct companies; ambiguous names await review',async()=>{
 other=await operator.create('company',{name:company.name});phone=await operator.create('channel_endpoint',{channel:'Phone',raw_value:'01700'+suffix.replace(/\D/g,'0').slice(0,6)});
 for(const c of [company,other])await operator.create('endpoint_association',{company_id:c.id,endpoint_id:phone.id});
 const mail=await operator.create('channel_endpoint',{channel:'Email',raw_value:suffix+'@example.invalid'});for(const c of [company,other])await operator.create('endpoint_association',{company_id:c.id,endpoint_id:mail.id});
 assert.equal((await reader.request('/companies?q='+encodeURIComponent(company.name))).total,2);
 const b=await csvUpload(`Company\n${company.name}`);const p=await operator.request(`/imports/${b.id}/preview`,'POST',{sheet:'CSV',mapping:{company:'Company'},namespace:suffix,version:0});assert.equal(p.counts['needs-review'],1);
 await operator.request(`/imports/${b.id}/commit`,'POST',{version:1},randomUUID(),422);
 const row=(await reviewer.request('/imports/'+b.id)).rows[0];await reviewer.request(`/imports/${b.id}/rows/${row.id}/resolve`,'POST',{company_id:company.id,evidence:'Synthetic reviewer canonical selection',version:1});
 const ambiguous=await csvUpload(`Company,Canonical,Contact\n${company.name},${company.id},${contact1.name}`);
 const amb=await operator.request(`/imports/${ambiguous.id}/preview`,'POST',{sheet:'CSV',mapping:{company:'Company',canonical_id:'Canonical',contact:'Contact'},namespace:suffix,version:0});assert.equal(amb.counts['needs-review'],1);
 const ambRow=(await reviewer.request('/imports/'+ambiguous.id)).rows[0];
 await reviewer.request(`/imports/${ambiguous.id}/rows/${ambRow.id}/resolve`,'POST',{company_id:company.id,contact_id:contact1.id,evidence:'Reviewer confirms same person',version:1});
});
test('D3-05 company-only manual/import record without fabricated contact or consent',async()=>{
 const alone=await operator.create('company',{name:'No email '+suffix});const p=await reader.request('/companies/'+alone.id);assert.equal(p.contacts.length,0);assert.equal(p.channels.length,0);assert.equal(p.company.website,null);
 const b=await csvUpload('Company\nEmail unknown '+suffix);await operator.request(`/imports/${b.id}/preview`,'POST',{sheet:'CSV',mapping:{company:'Company'},namespace:suffix,version:0});await operator.request(`/imports/${b.id}/commit`,'POST',{version:1});await runOne();const report=await operator.request('/imports/'+b.id);assert.equal(report.state,'Committed');assert.equal(report.counts.created_contacts,0);
});
test('D3-06 CSV quoted newline/BOM/Bengali and XLSX text phone preserve provenance',async()=>{
 const text='\uFEFFCompany,Source ID,Contact,Designation,Phone,Email\r\n"Import, নমুনা '+suffix+'",'+suffix+'-co,"ব্যক্তি\nএক","Senior ""Buyer""",01701234567,\r\n"Import, নমুনা '+suffix+'",'+suffix+'-co,ব্যক্তি দুই,Procurement,01801234567,\r\n';
 committed=await csvUpload(text);committed.csv=text;await operator.request(`/imports/${committed.id}/preview`,'POST',{sheet:'CSV',mapping:map,namespace:suffix,version:0});
 const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('বাংলা');sheet.addRow(['কোম্পানি','নাম','পদবি','ফোন']);sheet.addRow(['XLSX নমুনা '+suffix,'কন্টাক্ট','ম্যানেজার','01700123456']);
 const file=new FormData();file.set('file',new Blob([await book.xlsx.writeBuffer() as any]),'synthetic.xlsx');const b=await operator.request('/imports','POST',file);await operator.request(`/imports/${b.id}/preview`,'POST',{sheet:'বাংলা',mapping:{company:'কোম্পানি',contact:'নাম',designation:'পদবি',phone:'ফোন'},namespace:suffix,version:0});await operator.request(`/imports/${b.id}/commit`,'POST',{version:1});await runOne();
 const report=await operator.request('/imports/'+b.id),p=await reader.request('/companies/'+report.rows[0].company_id);assert.equal(p.channels[0].raw_value,'01700123456');assert.equal(p.contacts[0].designation,'ম্যানেজার');assert.ok(p.observations.some((o:any)=>o.sheet==='বাংলা'&&o.row_number===2&&o.source_type==='Upload'));
 const utf16=Buffer.concat([Buffer.from([255,254]),Buffer.from('Company\r\nবাংলা UTF16 '+suffix,'utf16le')]);const f=new FormData();f.set('file',new Blob([utf16]),'unicode.csv');assert.ok((await operator.request('/imports','POST',f)).id);
 const numeric=new ExcelJS.Workbook();const ns=numeric.addWorksheet('Nums');ns.addRow(['Company','Phone']);ns.addRow(['Numeric '+suffix,1700123456]);ns.addRow(['Formula '+suffix,{formula:'1+1',result:2}]);const nf=new FormData();nf.set('file',new Blob([await numeric.xlsx.writeBuffer() as any]),'numeric.xlsx');const nb=await operator.request('/imports','POST',nf);const np=await operator.request(`/imports/${nb.id}/preview`,'POST',{sheet:'Nums',mapping:{company:'Company',phone:'Phone'},namespace:suffix,version:0});assert.equal(np.counts['needs-review'],1);assert.equal(np.counts.rejected,1);
});
test('D3-07 duplicate/concurrent commits and repeated file remain idempotent; counts match effects',async()=>{
 const key=randomUUID();const results=await Promise.all([operator.request(`/imports/${committed.id}/commit`,'POST',{version:1},key),operator.request(`/imports/${committed.id}/commit`,'POST',{version:1},key)]);assert.equal(results[0].id,results[1].id);await Promise.all([runOne(),runOne()]);
 const report=await operator.request('/imports/'+committed.id);assert.equal(report.state,'Committed');assert.equal(report.counts.input_rows,2);assert.equal(report.counts.created_companies,1);assert.equal(report.counts.created_contacts,2);assert.equal(report.counts.entity_effects,report.effects.length);
 const profile=await reader.request('/companies/'+report.rows[0].company_id);assert.equal(profile.contacts.length,2);assert.ok(profile.contacts.some((r:any)=>r.designation==='Senior "Buyer"'));assert.ok(profile.contacts.some((r:any)=>r.name==='ব্যক্তি\nএক'));
 const repeat=await csvUpload(committed.csv);const preview=await operator.request(`/imports/${repeat.id}/preview`,'POST',{sheet:'CSV',mapping:map,namespace:suffix,version:0});assert.equal(preview.duplicate_batch,committed.id);
 await operator.request(`/imports/${committed.id}/commit`,'POST',{version:2},key,409);
 committed.company_id=report.rows[0].company_id;
});
test('D3-08 historical roles and invalid branch/company mismatch',async()=>{
 const profile=await reader.request('/companies/'+company.id),role=profile.contacts.find((r:any)=>r.contact_id===contact1.id);
 await operator.request('/entities/contact_company_role/'+role.id,'PATCH',{version:role.version,source:'Synthetic job change',data:{valid_to:'2026-01-01'}});
 await operator.create('contact_company_role',{company_id:other.id,contact_id:contact1.id,designation:'New role',valid_from:'2026-01-02'});
 assert.equal((await reader.request('/companies/'+company.id)).contacts.find((r:any)=>r.id===role.id).valid_to,'2026-01-01');
 const branch=await operator.create('branch',{company_id:company.id,name:'Factory'});await operator.request('/entities/contact_company_role','POST',{source:'Test',data:{company_id:other.id,contact_id:contact1.id,branch_id:branch.id}},randomUUID(),422);
});
test('D3-09 rollback respects later edits and withdrawal; reimport cannot revive permission',async()=>{
 let p=await operator.request('/companies/'+committed.company_id);const endpoint=p.channels.find((x:any)=>x.channel==='Phone');
 await operator.request('/entities/company/'+p.company.id,'PATCH',{version:1,source:'Later valid correction',data:{address:'Later address must survive'}});
 await operator.request('/consent','POST',{endpoint_id:endpoint.id,contact_id:endpoint.contact_id,purpose:'marketing',status:'OptedOut',evidence:'Synthetic withdrawal'});
 await operator.request(`/imports/${committed.id}/rollback`,'POST',{version:1});await runOne();
 const b=await operator.request('/imports/'+committed.id);assert.equal(b.state,'RollbackConflict');assert.ok(b.effects.some((x:any)=>x.undone));assert.ok(b.effects.some((x:any)=>x.conflict));
 p=await reader.request('/companies/'+p.company.id);assert.equal(p.company.address,'Later address must survive');
 assert.ok((await reader.request(`/endpoints/${endpoint.id}/eligibility?purpose=marketing&contact_id=${endpoint.contact_id}`)).reasons.includes('Suppressed'));
 const repeat=await csvUpload(committed.csv);assert.equal((await operator.request(`/imports/${repeat.id}/preview`,'POST',{sheet:'CSV',mapping:map,namespace:suffix,version:0})).duplicate_batch,committed.id);
});
test('D3-10 authorized source review; phone is not WhatsApp consent',async()=>{
 const obs=(await reader.request('/observations?entity_id='+phone.id)).rows.find((o:any)=>o.field==='raw_value');assert.equal(obs.verification,'Unverified');
 await admin.request('/observations/'+obs.id+'/review','POST',{status:'Verified',evidence:''},randomUUID(),422);
 await operator.request('/observations/'+obs.id+'/review','POST',{status:'Verified',evidence:'Operator cannot verify'},randomUUID(),403);
 await operator.request('/consent','POST',{endpoint_id:phone.id,purpose:'marketing',status:'OptedIn',evidence:'Unauthorized grant'},randomUUID(),403);
 await reviewer.request('/observations/'+obs.id+'/review','POST',{status:'Verified',evidence:'Synthetic documented check'});
 const eligible=await reader.request('/endpoints/'+phone.id+'/eligibility?purpose=marketing');assert.equal(eligible.eligible,false);assert.equal(eligible.consent_status,'Unknown');assert.equal(eligible.dispatch_enabled,false);
 const whatsapp=await operator.create('channel_endpoint',{channel:'WhatsApp',raw_value:phone.raw_value});assert.notEqual(whatsapp.id,phone.id);assert.equal((await reader.request('/endpoints/'+whatsapp.id+'/eligibility')).consent_status,'Unknown');
});
test('D3-11 direct API permission, CSRF/origin and revoked session negatives',async()=>{
 await reader.request('/entities/company','POST',{source:'Test',data:{name:'Denied'}},randomUUID(),403);
 await reader.request('/entities/company/'+company.id,'PATCH',{version:1,source:'Test',data:{name:'Denied'}},randomUUID(),403);
 await reader.request('/imports','POST',new FormData(),randomUUID(),403);
 await reader.request('/observations/'+randomUUID()+'/review','POST',{status:'Verified',evidence:'Denied'},randomUUID(),403);
 const exp=await fetch(base+'/api/v1/companies.csv',{headers:{Cookie:operator.cookie}});assert.equal(exp.status,403);
 const noauth=await new Client().request('/companies','GET',undefined,randomUUID(),401);assert.ok(noauth.error);
 const csrf=await fetch(base+'/api/v1/entities/company',{method:'POST',headers:{Cookie:admin.cookie,'Content-Type':'application/json'},body:'{}'});assert.equal(csrf.status,403);
 const badOrigin=await fetch(base+'/api/v1/session',{headers:{Origin:'https://evil.invalid'}});assert.equal(badOrigin.status,403);
 const revoked=await new Client().login('reader'),who=await revoked.request('/session');await admin.request('/admin/users/'+who.user.id+'/revoke','POST');await revoked.request('/companies','GET',undefined,randomUUID(),401);reader=await new Client().login('reader');
});
test('D3-12 conflict retains current and proposed; DB failure fails closed',async()=>{
 const p=await operator.request('/companies/'+company.id);await operator.request('/entities/company/'+company.id,'PATCH',{version:p.company.version,source:'First user',data:{industry:'Textiles'}});
 const conflict=await reviewer.request('/entities/company/'+company.id,'PATCH',{version:p.company.version,source:'Second user',data:{industry:'Retail'}},randomUUID(),409);assert.equal(conflict.current.industry,'Textiles');assert.equal(conflict.proposed.industry,'Retail');assert.ok(conflict.conflict_id);
 const persisted=await pool.query('SELECT * FROM edit_conflict WHERE id=$1',[conflict.conflict_id]);assert.equal(persisted.rowCount,1);
 // An aborted transaction proves no false success or partial canonical write.
 const marker=randomUUID();await assert.rejects(tx(async c=>{await c.query('INSERT INTO company(workspace_id,name) SELECT workspace_id,$1 FROM app_user LIMIT 1',[marker]);throw Error('synthetic transaction failure');}));assert.equal((await pool.query('SELECT 1 FROM company WHERE name=$1',[marker])).rowCount,0);
});
test('D3-13 persisted audit fields, application role cannot update/delete',async()=>{
 const rows=(await reader.request('/audit?limit=100')).rows;assert.ok(rows.some((r:any)=>r.actor&&r.created_at&&r.resource_id));assert.ok(!JSON.stringify(rows).includes(process.env.SEED_PASSWORD!));
 await assert.rejects(pool.query('UPDATE audit_event SET action=$1 WHERE id=$2',['Tampered',rows[0].id]));await assert.rejects(pool.query('DELETE FROM audit_event WHERE id=$1',[rows[0].id]));
 const n=await pool.query('SELECT count(*) FROM audit_event');assert.ok(Number(n.rows[0].count)>30);
});
test('D3-14 private paths denied; export formula safe; cross-workspace denied',async()=>{
 for(const url of ['/.env','/.private/pg-password','/api/migrations/001-foundation.sql','/backup.dump','/ARCHITECTURE-REVIEW.md'])assert.ok([401,404].includes((await fetch(base+url)).status),url);
 assert.equal(csvSafe('=HYPERLINK("bad")'),'"\'=HYPERLINK(""bad"")"');assert.match(csvSafe(' +123'),/^"'/);
 await reader.request('/companies/'+randomUUID(),'GET',undefined,randomUUID(),404);
 await operator.request('/entities/company','POST',{source:'Test',data:{name:'Invalid scope',group_id:randomUUID()}},randomUUID(),404);
 const foreignWorkspace=(await pool.query('INSERT INTO workspace(name) VALUES($1) RETURNING id',['Synthetic isolated scope '+suffix])).rows[0];
 const foreignCompany=(await pool.query('INSERT INTO company(workspace_id,name) VALUES($1,$2) RETURNING id',[foreignWorkspace.id,'Private other scope'])).rows[0];
 await admin.request('/companies/'+foreignCompany.id,'GET',undefined,randomUUID(),404);
});
test('D3-15 demo namespace separated; no fixture fallback or secret in public files',async()=>{
 const demo=await fs.readFile('app.js','utf8'),ui=await fs.readFile('ui/workspace.js','utf8');assert.ok(!demo.includes("'gm-studio-v1'"));assert.ok(demo.includes('gm-print:v2:public-demo:2026'));assert.ok(!ui.includes('demo.js'));assert.ok(!ui.includes('sessionStorage'));assert.match(ui,/সার্ভারের সাথে যোগাযোগ নেই/);
 for(const file of ['.public/bundle.js','.public/workspace/workspace.js'])assert.ok(!(await fs.readFile(file,'utf8')).includes(process.env.SESSION_SECRET!));
});
test('D3-16 setup artifacts and committed schema version; backup restore separate command',async()=>{assert.match((await pool.query('SELECT current_database() AS db')).rows[0].db,/^gm_d3(?:_clean_[a-z0-9]+)?$/);for(const f of ['.env.example','scripts/local-db.ps1','api/setup.ts','api/migrations/001-foundation.sql','package-lock.json'])assert.ok((await fs.stat(f)).size>0);});
