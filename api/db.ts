import pg from 'pg';
import { createHash } from 'node:crypto';
// SQL DATE has no timezone. Preserve the calendar value across Dhaka/UTC clients.
pg.types.setTypeParser(1082, value => value);
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 3000 });
pool.on('error', () => console.error('Database connection unavailable; requests fail closed until recovery'));
export type DB = pg.PoolClient;
export type Actor = { id: string; workspace_id: string; role: string; username: string; session_version: number };
export class Fault extends Error { constructor(public status: number, message: string, public detail: unknown = undefined) { super(message); } }
export async function tx<T>(fn: (c: DB) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try { await c.query('BEGIN'); const value = await fn(c); await c.query('COMMIT'); return value; }
  catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}
export async function audit(c: DB, a: Actor, action: string, type: string, id: string, version?: number, refs: object = {}, result = 'Success') {
  await c.query('INSERT INTO audit_event(workspace_id,actor_id,action,resource_type,resource_id,resource_version,change_ref,result) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [a.workspace_id,a.id,action,type,id,version,refs,result]);
}
export async function permit(c: DB, a: Actor, action: string) {
  if (!(await c.query('SELECT 1 FROM permission WHERE role=$1 AND action=$2', [a.role,action])).rowCount) throw new Fault(403,'এই কাজের অনুমতি নেই।');
}
export const tables = ['company','company_group','branch','contact','contact_company_role','channel_endpoint','endpoint_association'] as const;
export type Entity = typeof tables[number];
export function entity(s: string): Entity { if (!(tables as readonly string[]).includes(s)) throw new Fault(400,'Invalid entity'); return s as Entity; }
export async function get(c: DB, a: Actor, table: Entity, id: string, lock = false) {
  const r = await c.query(`SELECT * FROM ${table} WHERE id=$1 AND workspace_id=$2 AND active ${lock?'FOR UPDATE':''}`, [id,a.workspace_id]);
  if (!r.rowCount) throw new Fault(404,'রেকর্ড পাওয়া যায়নি।'); return r.rows[0];
}
export const hash = (v: unknown) => createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
export async function mutation(c: DB, a: Actor, key: string | undefined, payload: unknown, fn: () => Promise<any>) {
  if (!key || key.length>160) throw new Fault(400,'Idempotency-Key প্রয়োজন (সর্বোচ্চ 160 অক্ষর)।');
  await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[a.workspace_id+key]);
  const found = (await c.query('SELECT * FROM mutation_key WHERE workspace_id=$1 AND key=$2',[a.workspace_id,key])).rows[0];
  const digest = hash(payload);
  if (found) { if (found.hash!==digest) throw new Fault(409,'একই request key দিয়ে ভিন্ন তথ্য পাঠানো হয়েছে।'); return found.response; }
  const response = await fn();
  await c.query('INSERT INTO mutation_key VALUES($1,$2,$3,$4)',[a.workspace_id,key,digest,response]); return response;
}
