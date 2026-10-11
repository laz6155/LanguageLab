// STAGING ONLY. Do not deploy until the data-controller notice, consent text
// and cross-border hosting are reviewed. Public endpoint by design; JWT off.
// Service-role credentials MUST remain in Supabase Edge Function environment.
// Browser clients never receive them.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = new Set(["https://laz6155.github.io"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPES = new Set(["student","educator"]);
const LEVELS = new Set(["Not sure","A1-A2","B1-B2","C1-C2"]);
const PROGRAMMES = new Set(["speaking","online","career","advanced","personal","studio"]);
const SPECIALTIES = new Set(["English","Other languages","Education technology"]);

function response(status:number, data:Record<string,unknown>, origin:string|null) {
  const headers:Record<string,string> = {
    "Content-Type":"application/json; charset=utf-8",
    "Cache-Control":"no-store",
    "Vary":"Origin",
    "X-Content-Type-Options":"nosniff"
  };
  if(origin && ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"]=origin;
  return new Response(JSON.stringify(data),{status,headers});
}
function parseText(value:unknown,max:number):string {
  if(typeof value!=="string") throw new Error("VALIDATION");
  const trimmed=value.trim();
  if(trimmed.length>max) throw new Error("VALIDATION");
  return trimmed;
}
async function hexHash(value:string):Promise<string>{
  const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function restRequest(
  url:string,serviceKey:string,method:"GET"|"POST",body?:Record<string,unknown>
):Promise<Response>{
  return await fetch(url,{
    method,
    headers:{
      apikey:serviceKey,
      Authorization:`Bearer ${serviceKey}`,
      "Content-Type":"application/json",
      ...(method==="POST"?{Prefer:"return=minimal"}:{})
    },
    ...(body?{body:JSON.stringify(body)}:{})
  });
}
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin");
  if(!origin||!ALLOWED_ORIGINS.has(origin))return response(403,{ok:false,error:"FORBIDDEN_ORIGIN"},origin);
  if(req.method==="OPTIONS"){
    return new Response(null,{status:204,headers:{
      "Access-Control-Allow-Origin":origin,
      "Access-Control-Allow-Methods":"POST, OPTIONS",
      "Access-Control-Allow-Headers":"content-type",
      "Access-Control-Max-Age":"3600",
      Vary:"Origin"
    }});
  }
  if(req.method!=="POST")return response(405,{ok:false,error:"METHOD_NOT_ALLOWED"},origin);
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const base=Deno.env.get("SUPABASE_URL");
  if(!serviceKey||!base)return response(503,{ok:false,error:"NOT_CONFIGURED"},origin);
  try{
    const text=await req.text();
    if(text.length>5500)return response(413,{ok:false,error:"PAYLOAD_TOO_LARGE"},origin);
    const input=JSON.parse(text);
    if(!input||Array.isArray(input)||typeof input!=="object")throw new Error("VALIDATION");
    // Non-interactive spam trap; do not store bot submissions.
    if(input.website)return response(202,{ok:true},origin);
    if(input.contact_consent!==true)throw new Error("CONSENT_REQUIRED");
    const request_type=parseText(input.request_type,12);
    const full_name=parseText(input.full_name,90);
    const email=parseText(input.email,200).toLowerCase();
    const message=parseText(input.message||"",1500);
    const level_group=request_type==="student"?parseText(input.level_group,30):null;
    const programme=request_type==="student"?parseText(input.programme,30):null;
    const specialty=request_type==="educator"?parseText(input.specialty,120):null;
    if(!TYPES.has(request_type)||full_name.length<2||!EMAIL_RE.test(email)||
       (request_type==="student"&&(!LEVELS.has(level_group!)||!PROGRAMMES.has(programme!)))||
       (request_type==="educator"&&(!specialty||!SPECIALTIES.has(specialty))))
       throw new Error("VALIDATION");
    const endpoint=base.replace(/\/$/,"")+"/rest/v1/academy_inquiries";
    // Daily, salted IP fingerprint avoids raw IP persistence, but is only
    // partial abuse mitigation, NOT a substitute for approved CAPTCHA/WAF.
    const ip=req.headers.get("x-real-ip")||req.headers.get("cf-connecting-ip")||"";
    const day=new Date().toISOString().slice(0,10);
    const ip_hash=ip?await hexHash(day+":"+ip+":"+serviceKey.slice(-24)):null;
    const fromHour=new Date(Date.now()-60*60*1000).toISOString();
    const fromDay=new Date(Date.now()-24*60*60*1000).toISOString();
    // Email throttling: max 1 inquiry from the same email each hour.
    const emailCheck=new URL(endpoint);
    emailCheck.searchParams.set("select","id");
    emailCheck.searchParams.set("email","eq."+email);
    emailCheck.searchParams.set("created_at","gte."+fromHour);
    emailCheck.searchParams.set("limit","1");
    const check=await restRequest(emailCheck.toString(),serviceKey,"GET");
    if(!check.ok)throw new Error("DB_ERROR");
    const seen=await check.json();
    if(Array.isArray(seen)&&seen.length)return response(429,{ok:false,error:"RECENT_DUPLICATE"},origin);
    if(ip_hash){
      const ipCheck=new URL(endpoint);
      ipCheck.searchParams.set("select","id");
      ipCheck.searchParams.set("ip_hash","eq."+ip_hash);
      ipCheck.searchParams.set("created_at","gte."+fromDay);
      ipCheck.searchParams.set("limit","4");
      const ipResponse=await restRequest(ipCheck.toString(),serviceKey,"GET");
      if(!ipResponse.ok)throw new Error("DB_ERROR");
      const attempts=await ipResponse.json();
      if(Array.isArray(attempts)&&attempts.length>=4)
        return response(429,{ok:false,error:"RATE_LIMIT"},origin);
    }
    const row={request_type,full_name,email,message,level_group,programme,specialty,
      contact_consent:true,consent_text_version:"draft-v1",source:"homepage",ip_hash};
    const inserted=await restRequest(endpoint,serviceKey,"POST",row);
    if(!inserted.ok){
      console.error("Academy lead insert error",inserted.status);
      throw new Error("DB_ERROR");
    }
    return response(201,{ok:true},origin);
  }catch(error){
    if(error instanceof SyntaxError||error?.message==="VALIDATION"||error?.message==="CONSENT_REQUIRED"){
      return response(400,{ok:false,error:error?.message==="CONSENT_REQUIRED"?"CONSENT_REQUIRED":"VALIDATION"},origin);
    }
    console.error("Academy inquiry submission failed",error?.message||"UNKNOWN");
    return response(503,{ok:false,error:"SERVICE_UNAVAILABLE"},origin);
  }
});
