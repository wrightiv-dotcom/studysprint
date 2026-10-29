(() => {
const icon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.5"/><path d="M7 9h10M7 13h6" stroke="currentColor" stroke-width="1.5"/></svg>';
document.body.insertAdjacentHTML('beforeend',`<button id="bot-launch" class="bot-launch" aria-haspopup="dialog" aria-controls="bot-dialog">${icon}<span>Chat with SprintBot<small>Your study companion</small></span></button>
<dialog id="bot-dialog" class="bot-dialog" aria-labelledby="bot-title"><div class="bot-top"><div class="bot-avatar">${icon}</div><div><h2 id="bot-title">SprintBot</h2><span>Your study-planning chat</span></div><button type="button" id="bot-close" class="close" aria-label="Close SprintBot">&times;</button></div>
<div class="chat-settings"><label>Planning mode<select id="bot-mode"><option value="local">Local planner</option><option value="ai" disabled>AI (checking connection)</option></select></label><button id="bot-reset" class="text-button" type="button">New chat</button><span id="bot-status" class="bot-status">Checking AI availability...</span></div>
<div id="bot-messages" class="bot-messages" role="log" aria-label="Conversation with SprintBot" aria-live="polite" aria-relevant="additions"></div>
<form id="bot-form" class="chat-composer"><label for="bot-message">Message SprintBot</label><div class="chat-input-row"><textarea id="bot-message" rows="2" maxlength="5000" required placeholder="Type your reply..."></textarea><button id="bot-send" class="primary" type="submit">Send</button></div><p class="fine">Enter to send · Shift + Enter for a new line</p></form></dialog>`);
const modal=$('#bot-dialog'),messages=$('#bot-messages'),input=$('#bot-message'),mode=$('#bot-mode');
let step='title',values={},pending=null,busy=false,consent=false,controller=null;
const prompts={title:'Hi! Let’s make your next assignment manageable. What are you working on?',requirements:'What are the requirements? Paste the instructions or list the tasks, one per line.',deadline:'When is it due? Use YYYY-MM-DD, or say today, tomorrow, or in 7 days.',hours:'About how many hours will it take in total? Enter a number from 0.5 to 200.'};
function scroll(){messages.scrollTop=messages.scrollHeight}
function say(text,who='assistant'){const bubble=document.createElement('div');bubble.className='chat-message chat-'+who;const name=document.createElement('span');name.className='chat-speaker';name.textContent=who==='user'?'You':'SprintBot';const body=document.createElement('p');body.textContent=text;bubble.append(name,body);messages.append(bubble);scroll();return bubble}
function setBusy(value){busy=value;for(const id of ['bot-send','bot-reset','bot-mode','bot-message'])$('#'+id).disabled=value;messages.setAttribute('aria-busy',String(value));$('#bot-send').textContent=value?'Planning...':'Send';if(!value&&modal.open)input.focus()}
function reset(){if(busy)return;step='title';values={course:'',type:'auto'};pending=null;consent=false;messages.replaceChildren();input.value='';say(prompts.title);if(modal.open)input.focus()}
async function checkAI(){let available=false;try{const r=await fetch(new URL('api/config',document.baseURI),{signal:AbortSignal.timeout(5000)});if(r.ok)available=(await r.json()).aiAvailable===true}catch{}const option=mode.querySelector('[value=ai]');option.disabled=!available;option.textContent=available?'AI planner':'AI unavailable';$('#bot-status').textContent=available?'AI connected · local planning also available':'Local planning · AI is not connected';if(!available)mode.value='local'}
function open(){if(!modal.open)modal.showModal();input.focus();checkAI()}
$('#bot-launch').onclick=open;$('#bot-close').onclick=()=>modal.close();modal.addEventListener('close',()=>controller?.abort());$('#bot-reset').onclick=reset;
const quick=document.createElement('button');quick.type='button';quick.className='bot-hero';quick.innerHTML=icon+'<span>Chat with SprintBot</span>';quick.onclick=open;$('#hero-add').after(quick);
mode.onchange=()=>{consent=false;say(mode.value==='ai'?'AI planning selected. I’ll ask before sharing your assignment and schedule times.':'Local planning selected. Your assignment stays in this browser.');if(step==='consent'){step='retry';say('Reply retry to build your plan using the selected mode.')}};
async function build(){
 if(mode.value==='ai'&&!consent){step='consent';say('May I send this assignment, availability windows, and occupied session times to OpenAI to plan your study sessions? Reply yes to continue, or switch to local planning.');return}
 setBusy(true);const status=say(mode.value==='ai'?'Reading your requirements and checking your schedule...':'Building your milestones and checking your schedule...');let timeout;
 try{
  const local=SprintPlanner.plan(values);let result=local;
  if(mode.value==='ai'){
   controller=new AbortController();timeout=setTimeout(()=>controller.abort(),95000);
   const response=await fetch(new URL('api/plan',document.baseURI),{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({assignment:values,windows:state.windows,busy:state.assignments.filter(a=>a.approved).flatMap(a=>a.sessions.filter(s=>!s.done).map(s=>({date:s.date,start:s.start,end:s.end}))),timezoneOffset:new Date().getTimezoneOffset()})});
   const body=await response.json();if(!response.ok)throw Error(body.error||'The AI request failed.');if(!Array.isArray(body.milestones)||!body.milestones.length)throw Error('No verified plan was returned.');result=body;
  }
  if(!modal.open){step='retry';return}
  pending={id:crypto.randomUUID(),title:values.title,course:'Independent study',requirements:values.requirements,deadline:values.deadline,priority:'Normal',approved:false,sessions:[],milestones:result.milestones.map(m=>({title:m.title,hours:m.hours,done:false,id:crypto.randomUUID()}))};
  status.remove();const bubble=say((mode.value==='ai'?result.summary:'Here’s a draft using the local planning templates.')+' Review the steps and estimates before scheduling.');
  const list=document.createElement('ol');pending.milestones.forEach(m=>{const item=document.createElement('li');const title=document.createElement('span'),time=document.createElement('b');title.textContent=m.title;time.textContent=Math.round(m.hours*60)+' min';item.append(title,time);list.append(item)});bubble.append(list);
  const fit=schedule(pending),note=document.createElement('p');note.className=fit.shortfall?'bot-warning':'bot-success';note.textContent=fit.shortfall?`Your availability is short by ${(fit.shortfall/60).toFixed(1)} hours. Adjust the estimates or availability during review.`:`Fits in ${fit.sessions.length} study sessions with your current availability.`;bubble.append(note);
  const draft=pending,review=document.createElement('button');review.type='button';review.className='primary';review.textContent='Review milestones & schedule';review.onclick=()=>{if(busy)return;if(!state.assignments.some(a=>a.id===draft.id)){state.assignments.push(draft);save()}modal.close();openReview(draft.id,draft);reset();notify('Draft ready. Review and approve before scheduling.')};bubble.append(review);
  if(result.trace?.length){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='AI tool activity';details.append(summary);for(const event of result.trace){const line=document.createElement('p');line.textContent=event.tool+': '+event.status;details.append(line)}bubble.append(details)}
  step='refine';say('Send changes to the requirements to revise this draft, or choose New chat to plan another assignment.');
 }catch(error){status.remove();step='retry';say(error.name==='AbortError'?'Planning was cancelled or timed out. Reply retry to try again.':error.message+' Reply retry to try again.');}
 finally{clearTimeout(timeout);controller=null;setBusy(false);scroll()}
}
$('#bot-form').onsubmit=async event=>{
 event.preventDefault();if(busy)return;const text=input.value.trim();if(!text)return;input.value='';say(text,'user');
 if(step==='title'){if(text.length>100){say('Please keep the title to 100 characters.');return}values.title=text;step='requirements';say(prompts[step]);return}
 if(step==='requirements'){values.requirements=text;step='deadline';say(prompts[step]);return}
 if(step==='deadline'){
  let value=text.toLowerCase();const relative=value.match(/^in (\d+) days?$/);if(value==='today'||value==='tomorrow'||relative){const day=new Date();day.setDate(day.getDate()+(value==='tomorrow'?1:relative?Number(relative[1]):0));value=dateKey(day)}
  const parsed=new Date(value+'T23:59:59');if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(parsed.getTime())||dateKey(parsed)!==value||parsed<new Date()){say('Please enter today or a future date as YYYY-MM-DD, for example '+dateKey(new Date(Date.now()+7*86400000))+'.');return}values.deadline=value;step='hours';say(prompts[step]);return;
 }
 if(step==='hours'){const hours=Number(text.replace(/\s*(hours?|hrs?)$/i,''));if(!Number.isFinite(hours)||hours<.5||hours>200){say('Please enter a number from 0.5 to 200 hours.');return}values.hours=hours;}
 else if(step==='consent'){if(!/^(yes|send|agree)$/i.test(text)){say('Nothing was sent. Reply yes to share the assignment and schedule times, or switch to local planning.');return}consent=true;}
 else if(step==='refine'){const next=values.requirements+'\nRequested changes: '+text;if(next.length>5000){say('The requirements are too long. Start a new chat with a shorter description.');return}values.requirements=next;for(const button of messages.querySelectorAll('button'))button.disabled=true;}
 else if(step!=='retry')return;
 await build();
};
input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('#bot-form').requestSubmit()}});
reset();checkAI();
})();
