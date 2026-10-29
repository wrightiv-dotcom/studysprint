const test=require('node:test');
const assert=require('node:assert/strict');
const {validateContext,runAgent,checkProposal,validateMilestones}=require('../server/agent.cjs');
process.env.TZ='UTC';
const deadline=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
const payload=()=>({assignment:{title:'Research renewable energy',requirements:'Compare solar and wind energy with sources.',hours:2,deadline},windows:Array.from({length:7},()=>({start:'09:00',end:'18:00'})),busy:[],timezoneOffset:0});
function scripted(outputs){const requests=[];return{requests,fetchImpl:async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');requests.push(JSON.parse(options.body));assert(outputs.length,'Unexpected model request');return{ok:true,json:async()=>({status:'completed',output:outputs.shift()})}}}}
const call=(name,args={},id=name)=>[{type:'function_call',name,call_id:id,arguments:JSON.stringify(args)}];
const proposal={milestones:[{title:'Collect and compare credible sources',minutes:60},{title:'Outline, draft, and review the response',minutes:60}]};
const final=[{type:'message',content:[{type:'output_text',text:'Review this proposed study plan.'}]}];
test('Agent reads context, checks its proposed schedule, and returns an unapproved draft',async()=>{
 const mock=scripted([call('read_assignment'),call('get_availability'),call('check_schedule',proposal),final]);
 const context=validateContext(payload()),before=JSON.stringify(context);const result=await runAgent(context,{...mock,apiKey:'test-only-not-a-real-key'});
 assert.equal(result.mode,'ai');assert.equal(result.shortfall,0);assert.equal(result.milestones.length,2);assert.equal(result.trace.length,3);assert.equal(JSON.stringify(context),before);assert(!('approved' in result));assert.equal(mock.requests[0].store,false);
 assert(mock.requests[3].input.some(x=>x.type==='function_call_output'&&JSON.parse(x.output).approvalRequired));
});
test('The agent can revise a rejected estimate after receiving tool feedback',async()=>{
 const mock=scripted([call('read_assignment'),call('get_availability'),call('check_schedule',{milestones:[{title:'Bad estimate',minutes:4}]}),call('check_schedule',proposal,'revision'),final]);
 const result=await runAgent(validateContext(payload()),{...mock,apiKey:'test-only-not-a-real-key'});assert(result.trace.some(x=>x.status==='needs_revision'));assert.equal(result.milestones.reduce((n,m)=>n+m.hours,0),2);
});
test('An impossible workload remains a shortfall, not a fabricated success',async()=>{
 const body=payload();body.windows=body.windows.map(()=>({start:'09:00',end:'09:00'}));
 const mock=scripted([call('read_assignment'),call('get_availability'),call('check_schedule',proposal),final]);
 const result=await runAgent(validateContext(body),{...mock,apiKey:'test-only-not-a-real-key'});assert.equal(result.shortfall,120);assert.equal(result.sessionCount,0);
});
test('The agent cannot finish without using its tools and stops at its bound',async()=>{
 const mock=scripted(Array.from({length:6},()=>final));await assert.rejects(runAgent(validateContext(payload()),{...mock,apiKey:'test-only-not-a-real-key'}),/AI_TOOL_LIMIT/);assert.equal(mock.requests.length,6);
});
test('Tool validation rejects over-budget effort and unsupported request data',()=>{
 assert.throws(()=>validateMilestones([{title:'One',minutes:60},{title:'Two',minutes:70}],2));
 for(const body of [{}, {...payload(),windows:[]},{...payload(),busy:[{date:deadline,start:60,end:20}]},{...payload(),timezoneOffset:2000}])assert.throws(()=>validateContext(body));
});
test('Schedule checks honor the visitor’s local calendar across UTC midnight',()=>{
 const context=validateContext(payload());context.timezoneOffset=300;context.assignment.deadline='2030-01-01';context.windows=context.windows.map(()=>({start:'20:00',end:'22:00'}));
 const result=checkProposal(context,validateMilestones(proposal.milestones,2),new Date('2030-01-02T00:00:00Z'));assert.equal(result.shortfall,0);assert(result.sessions.every(s=>s.date==='2030-01-01'));
});
