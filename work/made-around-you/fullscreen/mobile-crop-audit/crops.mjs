import sharp from "sharp";
import { mkdir } from "node:fs/promises";
const folder="work/made-around-you/fullscreen/mobile-crop-audit";
await mkdir(folder,{recursive:true});
const items=[["home-living",82],["home-bathroom",82],["home-dining",18],["home-bedroom",76],["workspace",90],["workspace-meeting",14],["workspace-executive",42],["workspace-lounge",28]];
const width=260,height=Math.round(260*844/390),gap=12,label=30;
const layers=[];
for(let i=0;i<items.length;i++){
 const [name,pos]=items[i],source="public/images/worlds/"+name+".webp";
 const meta=await sharp(source).metadata();
 const cropWidth=Math.round(meta.height*390/844);
 const left=Math.round((meta.width-cropWidth)*pos/100);
 const output=await sharp(source).extract({left,top:0,width:cropWidth,height:meta.height}).resize(width,height).png().toBuffer();
 const x=(i%4)*(width+gap),y=Math.floor(i/4)*(height+label+gap);
 layers.push({input:output,left:x,top:y+label});
 const svg=Buffer.from('<svg width="'+width+'" height="'+label+'"><rect width="100%" height="100%" fill="#ffffff"/><text x="4" y="20" font-size="14" fill="#111111">'+name+' '+pos+'%</text></svg>');
 layers.push({input:svg,left:x,top:y});
 await sharp(output).toFile(folder+"/"+name+"-"+pos+".png");
}
await sharp({create:{width:4*width+3*gap,height:2*(height+label)+gap,channels:3,background:"#ffffff"}}).composite(layers).png().toFile(folder+"/recommendations.png");
console.log(folder+"/recommendations.png");

