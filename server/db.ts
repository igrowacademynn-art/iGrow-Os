import 'dotenv/config';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import type {Row} from '../shared/schema.ts';
if(process.env.PGLITE_PATH&&process.env.NODE_ENV!=='test')throw new Error('PGLite is permitted only for isolated test runs');
export const pool:pg.Pool=process.env.NODE_ENV==='test'&&process.env.PGLITE_PATH?(await import('./local-test-db.ts')).testPool as unknown as pg.Pool:new pg.Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:15000,statement_timeout:20000});
export type DB=pg.PoolClient;
let tail=Promise.resolve();
export async function transaction<T>(fn:(db:DB)=>Promise<T>):Promise<T>{if(process.env.PGLITE_PATH){let release!:()=>void;const previous=tail;tail=new Promise<void>(r=>release=r);await previous;try{return await executeTransaction(fn);}finally{release();}}return executeTransaction(fn);}
async function executeTransaction<T>(fn:(db:DB)=>Promise<T>):Promise<T>{const db=await pool.connect();try{await db.query('BEGIN');await db.query("SELECT pg_advisory_xact_lock(47839120)");const r=await fn(db);await db.query('COMMIT');return r;}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}}
export async function list(db:DB,kind?:string):Promise<Row[]>{return (await db.query('SELECT * FROM records'+(kind?' WHERE kind=$1':'')+' ORDER BY created_at DESC',kind?[kind]:[])).rows;}
export async function get(db:DB,id:string,kind?:string):Promise<Row>{const r=(await db.query('SELECT * FROM records WHERE id=$1',[id])).rows[0];if(!r||kind&&r.kind!==kind)throw new Error('Record not found');return r;}
export async function audit(db:DB,actor:string|null,action:string,id:string|null,before:unknown,after:unknown,reason=''){await db.query('INSERT INTO audit(actor_id,action,record_id,before_data,after_data,reason) VALUES($1,$2,$3,$4,$5,$6)',[actor,action,id,JSON.stringify(before),JSON.stringify(after),reason]);}
export async function insert(db:DB,kind:string,data:Record<string,any>,actor:string|null):Promise<Row>{const id=randomUUID();const r=(await db.query('INSERT INTO records(id,kind,data) VALUES($1,$2,$3) RETURNING *',[id,kind,JSON.stringify(data)])).rows[0];await audit(db,actor,'create:'+kind,id,null,data);return r;}
export async function replace(db:DB,row:Row,data:Record<string,any>,actor:string,reason=''):Promise<Row>{const r=(await db.query('UPDATE records SET data=$1,version=version+1,updated_at=now() WHERE id=$2 AND version=$3 RETURNING *',[JSON.stringify(data),row.id,row.version])).rows[0];if(!r)throw new Error('Record changed. Refresh and try again.');await audit(db,actor,'update:'+row.kind,row.id,row.data,data,reason);return r;}
