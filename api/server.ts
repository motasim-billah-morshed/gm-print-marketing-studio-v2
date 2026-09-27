import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import multer from 'multer';
import {randomBytes} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {z,ZodError} from 'zod';
import {pool,tx,audit,Fault,permit,entity,get,mutation,type Actor,type DB} from './db.js';
import {create,update,manualSource,verify,consent,eligibility} from './domain.js';
import {upload,preview,batchGet,resolveRow,enqueue,csvSafe} from './imports.js';
declare module 'express-session' {interface SessionData {userId?:string;version?:number;csrf?:string;}}
declare global {namespace Express {interface Request {actor?:Actor;}}}
const uuid=z.string().uuid();
function id(v:unknown){return uuid.parse(v);}
function page(q:any){return {limit:Math.min(100,Math.max(1,Number(q.limit)||25)),offset:Math.max(0,Number(q.offset)||0)};}
export function app() {
 if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)throw Error('SESSION_SECRET must contain at least 32 random characters');
 const app=express(),origin=process.env.APP_ORIGIN||'http://127.0.0.1:4183';
 app.disable('x-powered-by');
 app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'",'data:'],upgradeInsecureRequests:null}}}));
 app.use(express.json({limit:'256kb'}));
 app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');if(req.headers.origin&&req.headers.origin!==origin)return res.status(403).json({error:'Origin অনুমোদিত নয়।'});next();});
 const Store=connectPg(session);
 app.use('/api',session({name:'gm_d3_sid',store:new Store({pool,tableName:'session',createTableIfMissing:false}),secret:process.env.SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',maxAge:8*3600*1000}}));
 app.get('/api/v1/session',async(req,res)=>{
  if(!req.session.csrf)req.session.csrf=randomBytes(32).toString('hex');
  let user=null;
  if(req.session.userId)user=(await pool.query('SELECT id,username,role,workspace_id,session_version FROM app_user WHERE id=$1 AND active AND session_version=$2',[req.session.userId,req.session.version])).rows[0]||null;
  const permissions=user?(await pool.query('SELECT action FROM permission WHERE role=$1',[user.role])).rows.map(r=>r.action):[];
  res.json({user,permissions,csrf:req.session.csrf,mode:'persistent-local',outbound_enabled:false,erp:'Not connected'});
 });
 app.use('/api',(req,res,next)=>{if(!['GET','HEAD','OPTIONS'].includes(req.method)&&(!req.session.csrf||req.headers['x-csrf-token']!==req.session.csrf))return res.status(403).json({error:'Session/CSRF token অনুপস্থিত। পেজ reload করুন।'});next();});
 app.post('/api/v1/login',rateLimit({windowMs:15*60000,limit:20,standardHeaders:'draft-8',legacyHeaders:false}),async(req,res)=>{
  const data=z.object({username:z.string().max(100),password:z.string().max(200)}).parse(req.body);
  const user=(await pool.query('SELECT * FROM app_user WHERE username=$1 AND active',[data.username])).rows[0];
  if(!user||!await bcrypt.compare(data.password,user.password_hash))return res.status(401).json({error:'Username বা password সঠিক নয়।'});
  await new Promise<void>((resolve,reject)=>req.session.regenerate(e=>e?reject(e):resolve()));
  req.session.userId=user.id;req.session.version=user.session_version;req.session.csrf=randomBytes(32).toString('hex');
  await tx(c=>audit(c,user,'Login','app_user',user.id));res.json({csrf:req.session.csrf});
 });
 app.use('/api',async(req,res,next)=>{
  if(!req.session.userId)return res.status(401).json({error:'প্রথমে login করুন।'});
  const user=(await pool.query('SELECT id,workspace_id,username,role,session_version FROM app_user WHERE id=$1 AND active AND session_version=$2',[req.session.userId,req.session.version])).rows[0];
  if(!user)return res.status(401).json({error:'Session revoked/expired. আবার login করুন।'});req.actor=user;next();
 });
 app.post('/api/v1/logout',async(req,res)=>{await tx(c=>audit(c,req.actor!,'Logout','app_user',req.actor!.id));await new Promise<void>((resolve,reject)=>req.session.destroy(e=>e?reject(e):resolve()));res.clearCookie('gm_d3_sid');res.json({ok:true});});
 const route=(method:'get'|'post'|'patch',url:string,action:string,fn:(c:DB,a:Actor,req:express.Request)=>Promise<any>,mutating=false)=>{
  app[method]('/api/v1'+url,async(req,res)=>{
   const result=await tx(async c=>{await permit(c,req.actor!,action);return mutating?mutation(c,req.actor!,req.get('Idempotency-Key'),{method,url:req.originalUrl,body:req.body},()=>fn(c,req.actor!,req)):fn(c,req.actor!,req);});
   res.status(result?.conflict?409:200).json(result);
  });
 };
 route('post','/admin/users/:id/revoke','admin',async(c,a,r)=>{const target=(await c.query('UPDATE app_user SET session_version=session_version+1 WHERE id=$1 AND workspace_id=$2 RETURNING id',[id(r.params.id),a.workspace_id])).rows[0];if(!target)throw new Fault(404,'User not found');await audit(c,a,'Revoke','app_user',target.id);return target;},true);
 route('get','/companies','read',async(c,a,r)=>{
  const {limit,offset}=page(r.query),search=String(r.query.q||'').slice(0,250),industry=String(r.query.industry||'');
  const where="workspace_id=$1 AND active AND name ILIKE '%'||$2||'%' AND ($3='' OR industry=$3)";
  const total=(await c.query(`SELECT count(*)::int AS n FROM company WHERE ${where}`,[a.workspace_id,search,industry])).rows[0].n;
  const rows=(await c.query(`SELECT * FROM company WHERE ${where} ORDER BY name,id LIMIT $4 OFFSET $5`,[a.workspace_id,search,industry,limit,offset])).rows;return{rows,total,limit,offset};
 });
 route('get','/entities/:type','read',async(c,a,r)=>{const table=entity(String(r.params.type)),{limit,offset}=page(r.query),q=String(r.query.q||'').slice(0,250),search=['company','company_group','branch','contact'].includes(table)?"AND name ILIKE '%'||$4||'%'":'';return{rows:(await c.query(`SELECT * FROM ${table} WHERE workspace_id=$1 AND active ${search} ORDER BY id LIMIT $2 OFFSET $3`,[a.workspace_id,limit,offset,...(search?[q]:[])])).rows};});
 route('get','/contacts','read',async(c,a,r)=>{const {limit,offset}=page(r.query),q=String(r.query.q||'').slice(0,250);return {rows:(await c.query("SELECT c.*,COALESCE((SELECT json_agg(json_build_object('company_id',co.id,'company_name',co.name,'designation',rel.designation,'valid_to',rel.valid_to)) FROM contact_company_role rel JOIN company co ON co.id=rel.company_id WHERE rel.contact_id=c.id AND rel.active AND co.active),'[]') AS relationships FROM contact c WHERE c.workspace_id=$1 AND c.active AND c.name ILIKE '%'||$2||'%' ORDER BY c.name,c.id LIMIT $3 OFFSET $4",[a.workspace_id,q,limit,offset])).rows};});
 route('post','/entities/:type','create',async(c,a,r)=>{const d=z.object({data:z.record(z.string(),z.unknown()),source:z.string().min(1).max(2000)}).strict().parse(r.body);return create(c,a,entity(String(r.params.type)),d.data,{id:await manualSource(c,a,d.source)});},true);
 route('patch','/entities/:type/:id','edit',async(c,a,r)=>{const d=z.object({data:z.record(z.string(),z.unknown()),source:z.string().min(1).max(2000),version:z.number().int().positive()}).strict().parse(r.body);return update(c,a,entity(String(r.params.type)),id(r.params.id),d.data,d.version,{id:await manualSource(c,a,d.source)});},true);
 route('post','/companies/:id/contacts','create',async(c,a,r)=>{
  await get(c,a,'company',id(r.params.id));
  const d=z.object({name:z.string().min(1),designation:z.string().nullable().optional(),department:z.string().nullable().optional(),source:z.string().min(1)}).strict().parse(r.body);
  const origin={id:await manualSource(c,a,d.source)},contact=await create(c,a,'contact',{name:d.name},origin);
  await create(c,a,'contact_company_role',{company_id:r.params.id,contact_id:contact.id,designation:d.designation||null,department:d.department||null},origin);return contact;
 },true);
 route('get','/companies/:id','read',async(c,a,r)=>{
  const company=await get(c,a,'company',id(r.params.id));
  const group=company.group_id?await get(c,a,'company_group',company.group_id):null;
  const branches=(await c.query('SELECT * FROM branch WHERE company_id=$1 AND workspace_id=$2 AND active ORDER BY name',[company.id,a.workspace_id])).rows;
  const contacts=(await c.query('SELECT r.*,c.name,c.version AS contact_version FROM contact_company_role r JOIN contact c ON c.id=r.contact_id WHERE r.company_id=$1 AND r.workspace_id=$2 AND r.active AND c.active ORDER BY r.valid_from DESC',[company.id,a.workspace_id])).rows;
  const channels=(await c.query('SELECT e.*,s.id AS association_id,s.contact_id FROM endpoint_association s JOIN channel_endpoint e ON e.id=s.endpoint_id WHERE s.company_id=$1 AND s.workspace_id=$2 AND s.active AND e.active ORDER BY e.channel',[company.id,a.workspace_id])).rows;
  const ids=[company.id,...branches.map(b=>b.id),...contacts.flatMap(c=>[c.id,c.contact_id]),...channels.flatMap(e=>[e.id,e.association_id]),...(group?[group.id]:[])];
  const observations=(await c.query('SELECT o.*,(SELECT json_agg(review) FROM (SELECT d.decision,d.evidence,d.created_at,ru.username AS reviewer FROM verification_decision d JOIN app_user ru ON ru.id=d.reviewer_id WHERE d.observation_id=o.id AND d.workspace_id=o.workspace_id ORDER BY d.created_at DESC) review) AS reviews,s.type AS source_type,s.reference,u.username AS actor FROM field_observation o JOIN source s ON s.id=o.source_id JOIN app_user u ON u.id=o.actor_id WHERE o.workspace_id=$1 AND o.entity_id=ANY($2::uuid[]) ORDER BY o.collected_at DESC LIMIT 200',[a.workspace_id,ids])).rows;
  const events=(await c.query('SELECT e.* FROM consent_event e WHERE e.workspace_id=$1 AND e.endpoint_id=ANY($2::uuid[]) ORDER BY e.created_at DESC',[a.workspace_id,channels.map(e=>e.id)])).rows;
  const activity=(await c.query('SELECT e.*,u.username AS actor FROM audit_event e LEFT JOIN app_user u ON u.id=e.actor_id WHERE e.workspace_id=$1 AND e.resource_id=ANY($2::text[]) ORDER BY e.id DESC LIMIT 50',[a.workspace_id,ids])).rows;
  return{company,group,branches,contacts,channels,observations,consent:events,activity,erp:{status:'Not connected',reference:null}};
 });
 route('get','/observations','read',async(c,a,r)=>{const {limit,offset}=page(r.query);return{rows:(await c.query('SELECT o.*,(SELECT json_agg(review) FROM (SELECT d.decision,d.evidence,d.created_at,ru.username AS reviewer FROM verification_decision d JOIN app_user ru ON ru.id=d.reviewer_id WHERE d.observation_id=o.id AND d.workspace_id=o.workspace_id ORDER BY d.created_at DESC) review) AS reviews,s.type AS source_type,s.reference FROM field_observation o JOIN source s ON s.id=o.source_id WHERE o.workspace_id=$1 AND ($2::uuid IS NULL OR o.entity_id=$2) ORDER BY o.collected_at DESC,o.id LIMIT $3 OFFSET $4',[a.workspace_id,r.query.entity_id?id(r.query.entity_id):null,limit,offset])).rows};});
 route('post','/observations/:id/review','review',async(c,a,r)=>verify(c,a,id(r.params.id),r.body.status,r.body.evidence),true);
 route('post','/consent','withdraw',async(c,a,r)=>consent(c,a,r.body),true);
 route('get','/endpoints/:id/eligibility','read',async(c,a,r)=>eligibility(c,a,id(r.params.id),String(r.query.purpose||'marketing'),r.query.contact_id?id(r.query.contact_id):undefined));
 route('get','/audit','read',async(c,a,r)=>{const {limit,offset}=page(r.query);return{rows:(await c.query('SELECT e.*,u.username AS actor FROM audit_event e LEFT JOIN app_user u ON u.id=e.actor_id WHERE e.workspace_id=$1 ORDER BY e.id DESC LIMIT $2 OFFSET $3',[a.workspace_id,limit,offset])).rows,limit,offset};});
 const privateDir=path.resolve(process.env.PRIVATE_DIR||'.private/uploads');if(privateDir.startsWith(path.resolve('.public')))throw Error('Upload storage cannot be public');fs.mkdirSync(privateDir,{recursive:true});
 const receive=multer({dest:privateDir,limits:{fileSize:5*1024*1024,files:1,fields:2},fileFilter:(_req,file,cb)=>{if(!/\.(csv|xlsx)$/i.test(file.originalname))return cb(new Fault(422,'CSV/XLSX file দিন।'));cb(null,true);}}).single('file');
 app.post('/api/v1/imports',async(req,res,next)=>{try{await tx(c=>permit(c,req.actor!,'import'));receive(req,res,e=>{if(e)return next(e);next();});}catch(e){next(e);}},async(req,res)=>{if(!req.file)throw new Fault(422,'File প্রয়োজন');const file=req.file;const value=await tx(c=>upload(c,req.actor!,file));res.json(value);});
 route('get','/imports','read',async(c,a,r)=>{const{limit,offset}=page(r.query);return{rows:(await c.query('SELECT id,state,counts,mapping_version,created_at FROM import_batch WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',[a.workspace_id,limit,offset])).rows};});
 route('get','/imports/:id','read',async(c,a,r)=>{const b=await batchGet(c,a,id(r.params.id));const{limit,offset}=page(r.query);const sheets=JSON.parse(await fs.promises.readFile(b.file_path+'.parsed.json','utf8')).map((s:any)=>({name:s.name,headers:s.headers,row_count:s.rows.length}));delete b.file_path;return{...b,sheets,rows:(await c.query('SELECT * FROM import_row WHERE batch_id=$1 ORDER BY row_number LIMIT $2 OFFSET $3',[b.id,limit,offset])).rows,jobs:(await c.query('SELECT * FROM job WHERE batch_id=$1 ORDER BY created_at DESC',[b.id])).rows,effects:(await c.query('SELECT * FROM import_effect WHERE batch_id=$1 LIMIT 100',[b.id])).rows};});
 route('post','/imports/:id/preview','import',async(c,a,r)=>preview(c,a,id(r.params.id),r.body),true);
 route('post','/imports/:id/rows/:rowId/resolve','review',async(c,a,r)=>resolveRow(c,a,id(r.params.id),id(r.params.rowId),r.body),true);
 route('post','/imports/:id/:operation','import',async(c,a,r)=>{const op=z.enum(['commit','rollback']).parse(r.params.operation);return enqueue(c,a,id(r.params.id),op,z.number().int().nonnegative().parse(r.body.version));},true);
 app.get('/api/v1/imports/:id/errors.csv',async(req,res)=>{const csv=await tx(async c=>{await permit(c,req.actor!,'export');const b=await batchGet(c,req.actor!,id(req.params.id));const rows=(await c.query("SELECT row_number,status,reason,data FROM import_row WHERE batch_id=$1 AND status<>'accepted' ORDER BY row_number",[b.id])).rows;await audit(c,req.actor!,'ExportErrors','import_batch',b.id);return ['row,status,reason,data',...rows.map(r=>[r.row_number,r.status,r.reason,JSON.stringify(r.data)].map(csvSafe).join(','))].join('\r\n');});res.type('text/csv').attachment('import-errors.csv').send('\uFEFF'+csv);});
 app.get('/api/v1/companies.csv',async(req,res)=>{const csv=await tx(async c=>{await permit(c,req.actor!,'export');const rows=(await c.query('SELECT id,name,industry,address FROM company WHERE workspace_id=$1 AND active ORDER BY id LIMIT 10000',[req.actor!.workspace_id])).rows;await audit(c,req.actor!,'Export','company','bounded-10000');return ['id,name,industry,address',...rows.map(r=>Object.values(r).map(csvSafe).join(','))].join('\r\n');});res.type('text/csv').attachment('companies.csv').send('\uFEFF'+csv);});
 app.use('/api',(_req,res)=>res.status(404).json({error:'API endpoint নেই।'}));
 app.use(express.static(path.resolve('.public'),{dotfiles:'deny',index:'index.html',fallthrough:true}));
 app.use((_req,res)=>res.status(404).send('Not found'));
 app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
  if(err instanceof ZodError)return res.status(422).json({error:'তথ্য যাচাই করুন।',fields:err.issues.map(i=>({field:i.path.join('.'),message:i.message}))});
  if(err instanceof Fault)return res.status(err.status).json({error:err.message,detail:err.detail});
  if(err instanceof multer.MulterError)return res.status(422).json({error:'Upload সীমা অতিক্রম করেছে।'});
  if(['23505','23503','23514','22P02'].includes(err.code))return res.status(409).json({error:'রেকর্ড conflict বা relationship অবৈধ। পুনরায় যাচাই করুন।'});
  console.error('Request failure',err.code||err.name);res.status(503).json({error:'সার্ভার/ডেটাবেজে কাজটি সম্পন্ন করা যায়নি। তথ্য হারানো এড়াতে একই request key দিয়ে retry করুন।',retryable:true});
 });return app;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)app().listen(Number(process.env.PORT||4183),'127.0.0.1',()=>console.log('D3 local application: '+process.env.APP_ORIGIN+'/workspace/'));
