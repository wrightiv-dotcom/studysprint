const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(ai=false){
 class Element {
  constructor(){this.children=[];this.value='';this.open=false;this.disabled=false;this.listeners={};this.scrollHeight=100;}
  append(...children){for(const child of children){child.parent=this;this.children.push(child)}}
  replaceChildren(){this.children=[]}
  setAttribute(){} focus(){} after(){}
  addEventListener(name,fn){this.listeners[name]=fn}
  showModal(){this.open=true}
  close(){this.open=false;this.listeners.close?.()}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}
  querySelector(){return new Element()}
  querySelectorAll(selector){return this.children.flatMap(c=>[...(selector==='button'&&c.tag==='button'?[c]:[]),...c.querySelectorAll(selector)])}
 }
 const elements={};const $=id=>elements[id]??=new Element();$('#bot-mode').value='local';
 const assignments=[];let reviews=0,calls=0;
 const context={document:{baseURI:'http://localhost/',body:{insertAdjacentHTML(){}},createElement(tag){const e=new Element();e.tag=tag;return e}},$,state:{assignments,windows:[]},dateKey:d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'),SprintPlanner:require('../dist/sprint-planner.js'),schedule:()=>({shortfall:0,sessions:[{}]}),save(){},openReview(){reviews++},notify(){},crypto:require('node:crypto').webcrypto,AbortSignal,AbortController,URL,setTimeout,clearTimeout,fetch:async url=>{calls++;return {ok:true,json:async()=>({aiAvailable:ai})}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../dist/sprintbot.js'),'utf8'),context);
 const send=async text=>{$('#bot-message').value=text;await $('#bot-form').onsubmit({preventDefault(){}})};
 const text=()=>{const walk=e=>[e.textContent||'',...e.children.map(walk)].join(' ');return walk($('#bot-messages'))};
 return {$,send,text,assignments,get reviews(){return reviews},get calls(){return calls}};
}
test('Chat collects details, rejects invalid replies, revises drafts, and requires review',async()=>{
 const chat=setup();chat.$('#bot-launch').onclick();await chat.send('History paper');await chat.send('Research and write about ancient Rome');await chat.send('yesterday');assert.match(chat.text(),/future date/);await chat.send('in 7 days');await chat.send('zero');assert.match(chat.text(),/number from 0.5/);await chat.send('4 hours');assert.match(chat.text(),/Review milestones/);assert.equal(chat.assignments.length,0);
 await chat.send('Include time to check citations');const buttons=chat.$('#bot-messages').querySelectorAll('button');assert.equal(buttons.length,2);assert.equal(buttons[0].disabled,true);buttons[1].onclick();assert.equal(chat.assignments.length,1);assert.equal(chat.assignments[0].approved,false);assert.equal(chat.reviews,1);assert.match(chat.text(),/What are you working on/);
});
test('AI chat asks consent and does not transmit a plan when declined',async()=>{
 const chat=setup(true);await Promise.resolve();await Promise.resolve();chat.$('#bot-launch').onclick();chat.$('#bot-mode').value='ai';await chat.send('Biology exam');await chat.send('Review chapters one through five');await chat.send('tomorrow');await chat.send('2');assert.match(chat.text(),/May I send/);const before=chat.calls;await chat.send('no');assert.equal(chat.calls,before);assert.match(chat.text(),/Nothing was sent/);chat.$('#bot-mode').value='local';chat.$('#bot-mode').onchange();await chat.send('retry');assert.match(chat.text(),/Review milestones/);
});
