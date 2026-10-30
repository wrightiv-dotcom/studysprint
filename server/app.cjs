const path=require('node:path');
const express=require('express');
const helmet=require('helmet');
const {rateLimit}=require('express-rate-limit');
const {validateContext,runAgent}=require('./agent.cjs');
function createApp({env=process.env,agent=runAgent}={}){
 const app=express();app.disable('x-powered-by');app.set('trust proxy',1);
 app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:'],connectSrc:["'self'"],upgradeInsecureRequests:env.NODE_ENV==='production'?[]:null}},referrerPolicy:{policy:'strict-origin-when-cross-origin'}}));
 app.use(express.json({limit:'48kb'}));
 const configured=()=>Boolean(env.OPENAI_API_KEY)&&env.AI_ENABLED!=='false';
 app.get('/api/health',(_req,res)=>res.json({ok:true,framework:'Express'}));
 app.get('/api/config',(_req,res)=>res.set('Cache-Control','no-store').json({aiAvailable:configured(),provider:'OpenAI',framework:'Express'}));
 const globalLimit=rateLimit({windowMs:3600000,limit:30,keyGenerator:()=> 'all',standardHeaders:'draft-8',legacyHeaders:false,message:{error:'The shared AI hourly limit has been reached. Use the local planner or try later.'}});
 const perVisitor=rateLimit({windowMs:3600000,limit:5,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Your AI hourly limit has been reached. Use the local planner or try later.'}});
 let active=0;
 app.post('/api/plan',perVisitor,globalLimit,async(req,res)=>{
  res.set('Cache-Control','no-store');
  const origin=req.get('origin');if(origin&&origin!==`${req.protocol}://${req.get('host')}`)return res.status(403).json({error:'Open the app on its own hosting domain to use the agent.'});
  if(!configured())return res.status(503).json({error:'Live AI is not configured. Use the local planner; the site owner must set OPENAI_API_KEY privately in the hosting environment.'});
  let context;try{context=validateContext(req.body)}catch(error){return res.status(400).json({error:error.message})}
  if(active>=2)return res.status(429).json({error:'SprintBot is helping other students. Please try again shortly.'});active++;
  try{const result=await agent(context,{apiKey:env.OPENAI_API_KEY,model:env.OPENAI_MODEL||'gpt-5-mini',signal:AbortSignal.timeout(90000)});res.json(result)}
  catch(error){const timeout=error.name==='TimeoutError'||error.name==='AbortError';res.status(timeout?504:502).json({error:timeout?'The AI request timed out. Try again or choose the local planner.':'The AI service could not complete a verified plan. Check the server’s model access and API billing, or use the local planner.'})}
  finally{active--}
 });
 app.use('/api',(_req,res)=>res.status(404).json({error:'Unknown API route.'}));
 app.use(express.static(path.join(__dirname,'../dist'),{dotfiles:'deny'}));
 app.use((error,_req,res,_next)=>res.status(error.status===413?413:400).json({error:error.status===413?'The request is too large.':'Invalid request.'}));
 return app;
}
if(require.main===module){process.env.TZ='UTC';const port=Number(process.env.PORT)||3000;createApp().listen(port,'0.0.0.0',()=>console.log(`StudySprint Express server listening on port ${port}`))}
module.exports={createApp};
