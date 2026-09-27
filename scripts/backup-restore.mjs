import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import pg from 'pg';
import assert from 'node:assert/strict';
// Local synthetic database only. Creates a NEW restore database; never replaces or drops any database.
const url=new URL(process.env.MIGRATION_DATABASE_URL||'');
if(!['127.0.0.1','localhost'].includes(url.hostname)||url.pathname!=='/gm_d3')throw Error('This acceptance tool is restricted to local gm_d3');
const label='d3_restore_'+randomUUID().replaceAll('-','').slice(0,12),folder=path.resolve('.private/backups',label);
await fs.mkdir(folder,{recursive:true});
const bin=process.env.PG_BINDIR||path.resolve('.local-tools/postgres/pgsql/bin');
const command=(name,args)=>{const executable=path.join(bin,name+(process.platform==='win32'?'.exe':''));const result=spawnSync(executable,args,{env:{...process.env,PGPASSWORD:decodeURIComponent(url.password)},encoding:'utf8'});if(result.status!==0)throw Error(name+' failed: '+(result.error?.message||result.stderr));};
const args=['-h',url.hostname,'-p',url.port||'5432','-U',url.username];
const original=new pg.Client({connectionString:url.href});await original.connect();
const tables=['workspace','app_user','permission','company_group','company','branch','contact','contact_company_role','channel_endpoint','endpoint_association','source','field_observation','verification_decision','consent_event','suppression_rule','audit_event','edit_conflict','import_batch','import_row','import_effect','job','source_identity','mutation_key','schema_migration'];
async function fingerprints(client){const result={};for(const table of tables){const rows=(await client.query(`SELECT row_to_json(t)::text AS value FROM ${table} t ORDER BY row_to_json(t)::text`)).rows;result[table]={count:rows.length,sha256:createHash('sha256').update(rows.map(r=>r.value).join('\n')).digest('hex')};}return result;}
const before=await fingerprints(original);
const logical=process.argv.includes('--logical');
const data={};
if(logical){
 await original.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 for(const table of tables)data[table]=(await original.query(`SELECT row_to_json(t) AS value FROM ${table} t`)).rows.map(r=>r.value);
 await original.query('COMMIT');
 await fs.writeFile(path.join(folder,'database.json'),JSON.stringify(data));
}else command('pg_dump',[...args,'-Fc','--file',path.join(folder,'database.dump'),'gm_d3']);
const evidenceFiles=[];
for(const row of (await original.query('SELECT id,file_path FROM source WHERE file_path IS NOT NULL')).rows){for(const suffix of ['','.parsed.json']){const file=row.file_path+suffix,content=await fs.readFile(file),destination=path.join(folder,row.id+suffix);await fs.writeFile(destination,content);assert.equal(createHash('sha256').update(await fs.readFile(destination)).digest('hex'),createHash('sha256').update(content).digest('hex'));evidenceFiles.push({source_id:row.id,suffix,sha256:createHash('sha256').update(content).digest('hex')});}}
await original.query('CREATE DATABASE '+pg.escapeIdentifier(label));
const restoredUrl=new URL(url);restoredUrl.pathname='/'+label;const restored=new pg.Client({connectionString:restoredUrl.href});await restored.connect();
if(logical){
 await restored.query('BEGIN');
 for(const file of (await fs.readdir('api/migrations')).filter(f=>f.endsWith('.sql')).sort())await restored.query(await fs.readFile('api/migrations/'+file,'utf8'));
 await restored.query('CREATE TABLE schema_migration(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
 const saved=JSON.parse(await fs.readFile(path.join(folder,'database.json'),'utf8'));
 for(const table of tables){for(const row of saved[table]){const keys=Object.keys(row);await restored.query(`INSERT INTO ${table}(${keys.map(pg.escapeIdentifier).join(',')}) OVERRIDING SYSTEM VALUE VALUES(${keys.map((_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT DO NOTHING`,keys.map(k=>row[k]));}}
 await restored.query("SELECT setval(pg_get_serial_sequence('audit_event','id'),COALESCE((SELECT max(id) FROM audit_event),1))");
 await restored.query('COMMIT');
}else command('pg_restore',[...args,'--exit-on-error','--no-owner','-d',label,path.join(folder,'database.dump')]);
const after=await fingerprints(restored);assert.deepEqual(after,before);
await fs.writeFile(path.join(folder,'source-files.json'),JSON.stringify(evidenceFiles,null,2));
await fs.mkdir('test-results',{recursive:true});
const report={status:'passed',method:logical?'Driver-based logical JSON snapshot + migrations + transactional restore':'pg_dump/pg_restore',date:new Date().toISOString(),restore_database:label,tables:before,evidence_files:evidenceFiles.length,backup_folder:folder,notes:'All domain rows, provenance, consent and audit fingerprints match. Upload bytes and parsed evidence copied/hash-checked. Session table is intentionally excluded from comparison. No original DB overwritten. This is a local recovery acceptance exercise, not a production backup service.'};
await fs.writeFile('test-results/restore.json',JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,restore_database:label,tables:tables.length,evidence_files:report.evidence_files}));
await original.end();await restored.end();
