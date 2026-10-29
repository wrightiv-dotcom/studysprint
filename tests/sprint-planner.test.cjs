const test=require('node:test');
const assert=require('node:assert/strict');
const {schedule}=require('../dist/scheduler.js');
const {plan}=require('../dist/sprint-planner.js');
const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const base={title:'History research paper',requirements:'Research the topic and write a cited essay.',hours:4,deadline:dateKey(new Date(Date.now()+7*86400000))};
test('Research, coding, exam, and presentation assignments get relevant milestones',()=>{
 for(const [title,type] of [['Research paper','writing'],['Programming assignment','coding'],['Midterm exam','exam'],['Slide presentation','presentation']]){
  const result=plan({...base,title,requirements:'Complete the assignment described by the title.'});
  assert.equal(result.type,type);assert.equal(result.milestones.length,4);
 }
});
test('Explicit task lines preserve the student’s requirements',()=>{
 const result=plan({...base,requirements:'1. Read chapters 3 and 4\n2. Compare the two arguments\n3. Write a conclusion',hours:1.5});
 assert.equal(result.custom,true);assert.deepEqual(result.milestones.map(m=>m.title),['Read chapters 3 and 4','Compare the two arguments','Write a conclusion']);
});
test('Even a small estimate is distributed without zero-length tasks or lost minutes',()=>{
 const result=plan({...base,hours:.5,requirements:'Read the rubric\nCollect source notes\nOutline the response\nDraft the response\nRevise the response\nSubmit the assignment\nCheck the receipt'});
 assert.equal(result.milestones.reduce((n,m)=>n+Math.round(m.hours*60),0),30);
 assert(result.milestones.every(m=>m.hours>0));
});
test('Invalid and past-due requests cannot create a proposal',()=>{
 for(const change of [{hours:0},{hours:Infinity},{hours:201},{title:' '},{requirements:''},{deadline:'2020-01-01'},{deadline:'invalid'},{type:'unsupported'}])assert.throws(()=>plan({...base,...change}));
});
function scheduler(){
 const context={state:{assignments:[],windows:Array.from({length:7},()=>({start:'00:00',end:'23:59'}))}};
 context.schedule=a=>schedule(a,{windows:context.state.windows,busy:context.state.assignments.filter(x=>x.id!==a.id&&x.approved).flatMap(x=>x.sessions.filter(s=>!s.done))});return context;
}
test('SprintBot proposals fit without overlapping an approved assignment',()=>{
 const ctx=scheduler();const proposal={...base,id:'proposal',sessions:[],milestones:plan(base).milestones.map((m,i)=>({...m,id:String(i)}))};
 const first=ctx.schedule({...proposal,id:'existing'});ctx.state.assignments=[{id:'existing',approved:true,sessions:first.sessions}];
 const snapshot=JSON.stringify(ctx.state);const next=ctx.schedule(proposal);assert.equal(next.shortfall,0);
 for(const a of first.sessions)for(const b of next.sessions)assert(!(a.date===b.date&&a.start<b.end&&b.start<a.end));
 assert.equal(JSON.stringify(ctx.state),snapshot,'Preview must not change approved work');
});
test('A workload that cannot fit is reported as a shortfall',()=>{
 const ctx=scheduler();ctx.state.windows=Array.from({length:7},()=>({start:'17:00',end:'17:00'}));
 const result=ctx.schedule({...base,id:'proposal',sessions:[],milestones:plan(base).milestones.map((m,i)=>({...m,id:String(i)}))});
 assert.equal(result.sessions.length,0);assert.equal(result.shortfall,240);
});
