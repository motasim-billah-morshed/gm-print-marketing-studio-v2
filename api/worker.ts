import {pathToFileURL} from 'node:url';
import {tx,pool,audit,permit} from './db.js';
import {batchGet,commit,rollback} from './imports.js';
export async function runOne():Promise<boolean> {
 let failed:any;
 try{return await tx(async c=>{
  const job=(await c.query("SELECT * FROM job WHERE state='Queued' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1")).rows[0];if(!job)return false;failed=job;
  const b=(await c.query('SELECT * FROM import_batch WHERE id=$1 FOR UPDATE',[job.batch_id])).rows[0];
  const actor=(await c.query('SELECT * FROM app_user WHERE id=$1 AND active',[b.actor_id])).rows[0];if(!actor)throw Error('Actor inactive');
  await permit(c,actor,'import');
  await c.query("UPDATE job SET state='Running',attempts=attempts+1 WHERE id=$1",[job.id]);
  if(job.kind==='commit')await commit(c,actor,b);else await rollback(c,actor,b);
  await c.query("UPDATE job SET state='Completed',finished_at=now(),error=NULL WHERE id=$1",[job.id]);return true;
 });}catch(e){
  if(!failed)throw e;
  await tx(async c=>{
   await c.query("UPDATE job SET state='Failed',attempts=attempts+1,error=$2,finished_at=now() WHERE id=$1",[failed.id,e instanceof Error?e.message:'Import failed']);
   await c.query('UPDATE import_batch SET state=$2 WHERE id=$1',[failed.batch_id,failed.kind==='commit'?'Preview':'Committed']);
   const a=(await c.query('SELECT u.* FROM app_user u JOIN import_batch b ON b.actor_id=u.id WHERE b.id=$1',[failed.batch_id])).rows[0];
   await audit(c,a,'JobFailed','job',failed.id,undefined,{batch_id:failed.batch_id},'Failed');
  });return true;
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 let stopping=false;process.on('SIGTERM',()=>stopping=true);process.on('SIGINT',()=>stopping=true);
 console.log('D3 import worker ready; database queue, transactional claims');
 while(!stopping){try{if(!await runOne())await new Promise(r=>setTimeout(r,1500));}catch(e){console.error('Worker database unavailable');await new Promise(r=>setTimeout(r,3000));}}
 await pool.end();
}
