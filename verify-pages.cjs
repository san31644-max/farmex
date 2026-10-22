const fs=require('fs');
const pages=['index','about','tea','estates','agriculture','careers','contact'];
const errors=[];
for(const page of pages){
 const html=fs.readFileSync(page+'.html','utf8');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const path=match[1].split(/[?#]/)[0];
  if(!path||/^(https?:|tel:)/.test(path))continue;
  if(!fs.existsSync(path))errors.push(page+': '+path);
 }
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(page+': heading count');
}
if(errors.length){console.error(errors);process.exit(1)}
console.log('Seven pages passed: local links, image assets, and primary headings.');
