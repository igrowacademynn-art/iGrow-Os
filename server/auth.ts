import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import type {Request,Response,NextFunction} from 'express';
import {pool} from './db.ts';
export type User={id:string;name:string;email:string;role:string;family_id:string|null};
declare global {namespace Express {interface Request {user?:User}}}
export const hash=(v:string)=>createHash('sha256').update(v).digest('hex');
export function passwordHash(password:string){if(password.length<12||password.length>128)throw new Error('Use a password between 12 and 128 characters');const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');}
export function verifyPassword(password:string,stored:string){try{const [salt,encoded]=stored.split(':');return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(encoded,'hex'));}catch{return false;}}
export function secretMatches(a:string,b:string){return !!b&&timingSafeEqual(Buffer.from(hash(a)),Buffer.from(hash(b)));}
export async function session(req:Request,res:Response,next:NextFunction){try{const token=req.cookies?.igrow_session;if(token){req.user=(await pool.query('SELECT u.id,u.name,u.email,u.role,u.family_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active=true',[hash(token)])).rows[0];}next();}catch{res.status(503).json({error:'Database unavailable. Please retry.'});}}
export function authenticated(req:Request,res:Response,next:NextFunction){if(!req.user)return void res.status(401).json({error:'Sign in required'});next();}
export function role(req:Request,roles:string[]){if(!req.user||!roles.includes(req.user.role))throw Object.assign(new Error('Access denied'),{status:403});}
export async function createSession(res:Response,userId:string){const token=randomBytes(32).toString('base64url');await pool.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval \'12 hours\')',[hash(token),userId]);res.cookie('igrow_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:12*3600000,path:'/'});}
