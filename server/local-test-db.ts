// Isolated PostgreSQL WASM adapter, strictly for test runs. Never selected in production.
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite(process.env.PGLITE_PATH||'memory://');
export const testPool={
 async query(sql:string,values?:any[]){if(!values?.length&&sql.split(';').filter(s=>s.trim()).length>1){const results=await db.exec(sql);const r=results.at(-1);return {rows:r?.rows||[],rowCount:r?.affectedRows||0};}const r=await db.query(sql,values);return {rows:r.rows,rowCount:r.affectedRows||r.rows.length};},
 async connect(){await db.waitReady;return {...testPool,release(){}};},
 async end(){await db.close();}
};
