import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const {data,info}=await sharp('work/logo/refined.png').raw().toBuffer({resolveWithObject:true});
let left=info.width,top=info.height,right=0,bottom=0,partial=0;
for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){let a=data[(y*info.width+x)*4+3];if(a){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}if(a>0&&a<255)partial++;}
const crop={left,top,width:right-left+1,height:bottom-top+1};
await sharp('work/logo/refined.png').extract(crop).extend({top:14,bottom:14,left:14,right:14,background:{r:0,g:0,b:0,alpha:0}}).png({compressionLevel:9}).toFile('public/images/logo-transparent.png');
await writeFile('work/logo/crop.json',JSON.stringify({crop,margin:14,partial},null,2));
for(const [name,color]of [['forest','#303c32'],['paper','#eae4da'],['stone','#d0c6ba']])await sharp('public/images/logo-transparent.png').flatten({background:color}).png().toFile(`work/logo/final-${name}.png`);
console.log({crop,partial,metadata:await sharp('public/images/logo-transparent.png').metadata()});
