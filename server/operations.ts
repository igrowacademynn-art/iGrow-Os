import type {Express} from 'express';
import {z} from 'zod';
import {pool,transaction,list,insert,get,replace} from './db.ts';
import {role} from './auth.ts';
import {today} from '../shared/schema.ts';

const operators=['admin','frontdesk','teacher','helper'];
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v,'Invalid date');
const short=z.string().trim().min(1).max(300);
const note=z.string().trim().max(3000);
const optionalNote=note.optional().default('');
const eventSchema=z.object({
 channel:z.enum(['call','whatsapp','in-person','internal','task','other']),
 direction:z.enum(['incoming','outgoing','internal']),
 contact:short,
 purpose:short,
 summary:z.string().trim().min(3).max(3000),
 reply:optionalNote,
 status:z.enum(['completed','no-answer','waiting','follow-up','escalated']),
 nextAction:optionalNote,
 followupDate:date.optional(),
 workMode:z.enum(['at-centre','remote']).default('at-centre')
}).strict().superRefine((v,ctx)=>{
 if(v.status!=='completed'&&!v.nextAction)ctx.addIssue({code:'custom',path:['nextAction'],message:'Record the next step for unfinished interactions'});
 if(['waiting','follow-up','no-answer'].includes(v.status)&&!v.followupDate)ctx.addIssue({code:'custom',path:['followupDate'],message:'Set the next follow-up date'});
});
const taskSchema=z.object({title:short,description:optionalNote,assigneeId:z.uuid(),dueDate:date,priority:z.enum(['normal','urgent']).default('normal')}).strict();
const taskUpdate=z.object({status:z.enum(['open','in-progress','blocked','submitted','verified']),note:optionalNote,version:z.number().int().positive()}).strict();

export function attachOperations(app:Express){
 app.get('/api/operations',async(req,res)=>{
  role(req,operators);const user=req.user!;
  const rows=await transaction(db=>list(db));
  const shifts=rows.filter(r=>r.kind==='ops_shifts'&&(user.role==='admin'||r.data.actorId===user.id)).slice(0,300);
  const events=rows.filter(r=>r.kind==='ops_events'&&(user.role==='admin'||r.data.actorId===user.id)).slice(0,500);
  const tasks=rows.filter(r=>r.kind==='ops_tasks'&&(user.role==='admin'||r.data.assigneeId===user.id)).slice(0,300);
  const users=user.role==='admin'?(await pool.query("SELECT id,name,role FROM users WHERE active=true AND role IN ('admin','frontdesk','teacher','helper') ORDER BY name")).rows:[{id:user.id,name:user.name,role:user.role}];
  res.json({shifts,events,tasks,users,asOf:new Date().toISOString(),timezone:'Asia/Kolkata'});
 });
 app.post('/api/operations/shifts/check-in',async(req,res)=>{
  role(req,operators);z.object({}).strict().parse(req.body);
  const u=req.user!;
  const result=await transaction(async db=>{
   const rows=await list(db,'ops_shifts');
   if(rows.some(r=>r.data.actorId===u.id&&!r.data.exitAt))throw new Error('You are already checked in. Check out before beginning another shift.');
   return insert(db,'ops_shifts',{actorId:u.id,actorName:u.name,date:today(),entryAt:new Date().toISOString(),exitAt:null,summary:'',issues:'',handover:''},u.id);
  });
  res.status(201).json(result);
 });
 app.post('/api/operations/shifts/check-out',async(req,res)=>{
  role(req,operators);
  const d=z.object({summary:z.string().trim().min(5).max(3000),issues:optionalNote,handover:optionalNote}).strict().parse(req.body);
  const u=req.user!;
  const result=await transaction(async db=>{
   const rows=await list(db,'ops_shifts');
   const open=rows.find(r=>r.data.actorId===u.id&&!r.data.exitAt);
   if(!open)throw new Error('No open shift to check out.');
   return replace(db,open,{...open.data,exitAt:new Date().toISOString(),summary:d.summary,issues:d.issues,handover:d.handover},u.id,'Staff-reported end-of-shift summary');
  });
  res.json(result);
 });
 app.post('/api/operations/events',async(req,res)=>{
  role(req,operators);const d=eventSchema.parse(req.body);const u=req.user!;
  const result=await transaction(db=>insert(db,'ops_events',{...d,actorId:u.id,actorName:u.name,date:today(),recordedAt:new Date().toISOString()},u.id));
  res.status(201).json(result);
 });
 app.post('/api/operations/tasks',async(req,res)=>{
  role(req,['admin']);const d=taskSchema.parse(req.body);const u=req.user!;
  const assignee=(await pool.query("SELECT id,name FROM users WHERE id=$1 AND active=true AND role IN ('admin','frontdesk','teacher','helper')",[d.assigneeId])).rows[0];
  if(!assignee)throw new Error('Select an active team member.');
  const result=await transaction(db=>insert(db,'ops_tasks',{...d,assigneeName:assignee.name,createdBy:u.id,status:'open',createdAt:new Date().toISOString(),lastNote:'',reviewedBy:null},u.id));
  res.status(201).json(result);
 });
 app.post('/api/operations/tasks/:id/status',async(req,res)=>{
  role(req,operators);const d=taskUpdate.parse(req.body),u=req.user!;
  const result=await transaction(async db=>{
   const t=await get(db,z.uuid().parse(req.params.id),'ops_tasks');
   if(t.version!==d.version)throw new Error('This task changed. Refresh and try again.');
   const admin=u.role==='admin';
   if(!admin&&t.data.assigneeId!==u.id)throw new Error('This task is not assigned to you.');
   if(d.status==='verified'&&!admin)throw new Error('Only the owner can verify completion.');
   if(d.status==='verified'&&t.data.status!=='submitted')throw new Error('Staff must submit the task before verification.');
   if(!admin&&['open','verified'].includes(d.status))throw new Error('Only the owner can reopen or verify tasks.');
   if(d.status==='blocked'||d.status==='submitted')if(d.note.length<3)throw new Error('Explain what happened before changing this status.');
   return replace(db,t,{...t.data,status:d.status,lastNote:d.note,statusAt:new Date().toISOString(),updatedBy:u.id,reviewedBy:d.status==='verified'?u.id:null},u.id,'Task status: '+d.status);
  });
  res.json(result);
 });
}
