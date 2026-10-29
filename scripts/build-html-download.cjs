const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const origin='https://wrightiv-dotcom.github.io/studysprint/';
let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,file)=>{
 const css=fs.readFileSync(path.join(dist,file),'utf8').replace(/url\(['"]?assets\/clouds-night-sky\.gif['"]?\)/g,`url('${origin}assets/clouds-night-sky.gif')`);
 return '<style>\n'+css+'\n</style>';
});
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,file)=>{
 let js=fs.readFileSync(path.join(dist,file),'utf8');
 if(file==='sprintbot.js')js=js.replace('async function checkAI(){','async function checkAI(){if(location.protocol===\'file:\'){mode.querySelector(\'[value=ai]\').textContent=\'AI unavailable offline\';$(\'#bot-status\').textContent=\'Local planning · saved HTML edition\';return}');
 return '<script>\n'+js.replace(/<\/script/gi,'<\\/script')+'\n</script>';
});
html=html.replace(/href="report\//g,`href="${origin}report/`).replace(/href="studysprint\.html"/g,`href="${origin}studysprint.html"`);
fs.writeFileSync(path.join(dist,'studysprint.html'),html);
console.log('Created downloadable HTML with embedded styles and scripts.');
