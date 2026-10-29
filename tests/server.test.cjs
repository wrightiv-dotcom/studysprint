const test=require('node:test');
const assert=require('node:assert/strict');
const request=require('supertest');
const {createApp}=require('../server/app.cjs');
const fake='test-only-not-a-real-key';
test('Express health is available and configuration never exposes the server key',async()=>{
 const app=createApp({env:{OPENAI_API_KEY:fake}});const health=await request(app).get('/api/health').expect(200);assert.equal(health.body.framework,'Express');
 const config=await request(app).get('/api/config').expect(200);assert.equal(config.body.aiAvailable,true);assert(!config.text.includes(fake));
 for(const file of ['/.env','/server/app.cjs','/package.json'])await request(app).get(file).expect(404);
});
test('An unconfigured server explicitly refuses AI instead of returning local templates',async()=>{
 const app=createApp({env:{}});const response=await request(app).post('/api/plan').send({}).expect(503);assert(response.body.error.includes('not configured'));
});
test('Malformed input and cross-origin AI requests are blocked',async()=>{
 const app=createApp({env:{OPENAI_API_KEY:fake}});await request(app).post('/api/plan').send({}).expect(400);await request(app).post('/api/plan').set('Origin','https://unrelated.example').send({}).expect(403);
});
test('API failure messages never expose upstream details or secret credentials',async()=>{
 const app=createApp({env:{OPENAI_API_KEY:fake},agent:async()=>{throw Error(fake)}});const deadline=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
 const res=await request(app).post('/api/plan').send({assignment:{title:'Essay',requirements:'Write about ecology',hours:2,deadline},windows:Array.from({length:7},()=>({start:'09:00',end:'17:00'})),busy:[],timezoneOffset:0}).expect(502);assert(!res.text.includes(fake));
});
