(function(root){
  const templates={
    writing:['Read the rubric and gather sources','Build an outline and main argument','Write the first draft','Revise, check citations, and submit'],
    coding:['Review requirements and design the solution','Implement the main features','Test and fix issues','Review deliverables and prepare submission'],
    exam:['List topics and check understanding','Review concepts and make recall notes','Practice questions and correct mistakes','Review weak areas and do a timed recap'],
    presentation:['Research the topic and choose key points','Build the story and slide outline','Create slides and supporting visuals','Rehearse, revise, and check submission'],
    general:['Review the requirements and define deliverables','Gather materials and work through examples','Complete the main assignment','Check the rubric and prepare submission']
  };
  function plan(input){
    const title=String(input.title||'').trim(),requirements=String(input.requirements||'').trim(),hours=Number(input.hours);
    if(!title||!requirements)throw Error('Add an assignment title and its requirements.');
    if(!Number.isFinite(hours)||hours<0.5||hours>200)throw Error('Choose an estimate between 0.5 and 200 hours.');
    const deadline=new Date(input.deadline+'T23:59:59');
    if(!Number.isFinite(deadline.getTime())||deadline<new Date())throw Error('Choose today or a future deadline.');
    let type=input.type||'auto';const text=(title+' '+requirements).toLowerCase();
    if(type==='auto')type=/code|programming|software|debug|application/.test(text)?'coding':/exam|quiz|test prep|midterm|final exam/.test(text)?'exam':/presentation|slides|present\b/.test(text)?'presentation':/essay|paper|research|report/.test(text)?'writing':'general';
    if(!templates[type])throw Error('Choose a supported assignment type.');
    const explicit=requirements.split(/\n+/).map(s=>s.trim().replace(/^(?:[-*•]|\d+[.)])\s*/,'' )).filter(s=>s.length>=5);
    const custom=explicit.length>=2&&explicit.length<=8;
    const titles=custom?explicit:templates[type];const total=Math.round(hours*60),base=Math.floor(total/titles.length),extra=total%titles.length;
    return {type,custom,totalMinutes:total,milestones:titles.map((title,i)=>({title,hours:(base+(i<extra?1:0))/60,done:false}))};
  }
  root.SprintPlanner={plan};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.SprintPlanner;
})(typeof globalThis==='undefined'?this:globalThis);
