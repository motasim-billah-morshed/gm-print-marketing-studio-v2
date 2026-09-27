import fs from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import pg from 'pg';
import bcrypt from 'bcryptjs';
const db=new pg.Client({connectionString:process.env.MIGRATION_DATABASE_URL});
await db.connect();
try {
 if(process.argv[2]==='migrate') {
  await db.query('CREATE TABLE IF NOT EXISTS schema_migration(name text PRIMARY KEY,checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
  for(const name of (await fs.readdir('api/migrations')).filter(s=>s.endsWith('.sql')).sort()) {
   const sql=await fs.readFile('api/migrations/'+name,'utf8'), checksum=createHash('sha256').update(sql).digest('hex');
   const old=(await db.query('SELECT checksum FROM schema_migration WHERE name=$1',[name])).rows[0];
   if(old) {if(old.checksum!==checksum) throw Error('Applied migration changed: '+name);continue;}
   await db.query('BEGIN'); await db.query(sql);await db.query('INSERT INTO schema_migration(name,checksum) VALUES($1,$2)',[name,checksum]);await db.query('COMMIT');console.log('Applied',name);
  }
  const role=new URL(process.env.DATABASE_URL!).username;
  if(!/^[a-z][a-z0-9_]*$/.test(role)||role==='postgres')throw Error('Use a non-owner application role');
  await db.query(`GRANT CONNECT ON DATABASE ${pg.escapeIdentifier(new URL(process.env.DATABASE_URL!).pathname.slice(1))} TO ${role}`);
  await db.query(`GRANT USAGE ON SCHEMA public TO ${role}; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO ${role}; GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO ${role}; REVOKE UPDATE,DELETE,TRUNCATE ON audit_event FROM ${role}; REVOKE ALL ON schema_migration FROM ${role}; REVOKE INSERT,UPDATE,DELETE ON permission FROM ${role}`);
 } else if(process.argv[2]==='seed') {
  const password=process.env.SEED_PASSWORD;
  if(!password||password.length<16)throw Error('Set SEED_PASSWORD to a private random value of at least 16 characters. Existing users are never overwritten.');
  await db.query('BEGIN');
  let workspace=(await db.query('SELECT id FROM workspace LIMIT 1')).rows[0];
  if(!workspace)workspace=(await db.query("INSERT INTO workspace(name) VALUES('GM Print Solution · Local development') RETURNING id")).rows[0];
  for(const role of ['admin','operator','reviewer','reader']) await db.query('INSERT INTO app_user(workspace_id,username,password_hash,role) VALUES($1,$2,$3,$2) ON CONFLICT(username) DO NOTHING',[workspace.id,role,await bcrypt.hash(password,12)]);
  await db.query('COMMIT');console.log('Local accounts ready: admin, operator, reviewer, reader. Password supplied privately through SEED_PASSWORD.');
 } else throw Error('Use migrate or seed');
} finally {await db.end();}
