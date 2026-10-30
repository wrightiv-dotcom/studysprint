const {test}=require('node:test');
const assert=require('node:assert/strict');
const request=require('supertest');
test('Vercel entries serve API JSON and keep unconfigured planning disabled',async()=>{
 const health=await request(require('../api/health.js')).get('/api/health').expect(200).expect('Content-Type',/json/);assert.equal(health.body.framework,'Express');
 const config=await request(require('../api/config.js')).get('/api/config').expect(200).expect('Content-Type',/json/);assert.equal(typeof config.body.aiAvailable,'boolean');assert(!('OPENAI_API_KEY' in config.body));
 if(!config.body.aiAvailable)await request(require('../api/plan.js')).post('/api/plan').send({}).expect(503);
});
