// One Express app per warm function instance; credentials stay in server environment.
process.env.TZ='UTC';
module.exports=require('./app.cjs').createApp();
