(function(root){
function schedule(a,{windows,busy=[],now=new Date(),uuid=()=>globalThis.crypto.randomUUID()}){
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const min=t=>Number(t.split(':')[0])*60+Number(t.split(':')[1]);
 const result=[],end=new Date(a.deadline+'T23:59:59'),date=new Date(now);date.setHours(0,0,0,0);
 const jobs=a.milestones.filter(m=>!m.done).map(m=>({...m,left:Math.max(0,Math.round(m.hours*60)-(a.sessions||[]).filter(s=>s.done&&s.milestone===m.id).reduce((n,s)=>n+s.end-s.start,0))}));
 for(let day=0;date<=end&&day<730&&jobs.some(m=>m.left>0);day++,date.setDate(date.getDate()+1)){
  const dateString=key(date),w=windows[date.getDay()];let start=min(w.start),stop=min(w.end);
  if(dateString===key(now))start=Math.max(start,Math.ceil((now.getHours()*60+now.getMinutes())/15)*15);
  for(const m of jobs)while(m.left>0&&start<stop){
   const collision=busy.find(s=>s.date===dateString&&s.start<=start&&s.end>start);if(collision){start=collision.end;continue}
   const next=busy.filter(s=>s.date===dateString&&s.start>start).sort((a,b)=>a.start-b.start)[0];
   const amount=Math.min(60,m.left,stop-start,next?next.start-start:Infinity);if(amount<=0)break;
   result.push({id:uuid(),milestone:m.id,title:m.title,date:dateString,start,end:start+amount,done:false});start+=amount;m.left-=amount;
  }
 }
 return{sessions:result,shortfall:jobs.reduce((n,m)=>n+m.left,0)};
}
root.SprintScheduler={schedule};if(typeof module!=='undefined'&&module.exports)module.exports=root.SprintScheduler;
})(globalThis);
