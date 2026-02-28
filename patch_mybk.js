const fs=require('fs');
let src=fs.readFileSync('js/app.min.js','utf8');

const old1='const myBk=Array.isArray(calData._bookings)&&calData._bookings.find(b=>b.user===loggedInUser&&(b.status==="pending"||b.status==="approved"));';
const new1='const _mpNow=new Date(),_mpH=_mpNow.getHours(),_mpM=_mpNow.getMinutes(),_mpNowMin=_mpH<10?(_mpH+24)*60+_mpM:_mpH*60+_mpM,_mpToday=_mpNow.toISOString().slice(0,10);const myBk=(Array.isArray(calData._bookings)&&calData._bookings.filter(b=>b.user===loggedInUser&&(b.status==="pending"||b.status==="approved")&&(b.date>_mpToday||(b.date===_mpToday&&b.endMin>_mpNowMin))).sort((a,b)=>a.date!==b.date?a.date.localeCompare(b.date):a.startMin-b.startMin)[0])||null;';

if(!src.includes(old1)){console.error('NOT FOUND');process.exit(1);}
src=src.replace(old1,new1);
console.log('OK');
fs.writeFileSync('js/app.min.js',src);
console.log('Saved');
