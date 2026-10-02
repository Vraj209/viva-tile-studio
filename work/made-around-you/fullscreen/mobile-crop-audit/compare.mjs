import sharp from "sharp";
const items=[["workspace-meeting",14],["workspace-meeting",92],["workspace-lounge",28],["workspace-lounge",20]];
const width=300,height=Math.round(300*844/390),label=30,gap=12,layers=[];
for(let i=0;i<items.length;i++){
 const [name,pos]=items[i],source="public/images/worlds/"+name+".webp",meta=await sharp(source).metadata(),cropWidth=Math.round(meta.height*390/844),left=Math.round((meta.width-cropWidth)*pos/100);
 const crop=await sharp(source).extract({left,top:0,width:cropWidth,height:meta.height}).resize(width,height).png().toBuffer();
 layers.push({input:crop,left:i*(width+gap),top:label});
 layers.push({input:Buffer.from('<svg width="'+width+'" height="'+label+'"><rect width="100%" height="100%" fill="#fff"/><text x="4" y="20" font-size="14">'+name+' '+pos+'%</text></svg>'),left:i*(width+gap),top:0});
}
await sharp({create:{width:4*width+3*gap,height:height+label,channels:3,background:"#fff"}}).composite(layers).png().toFile("work/made-around-you/fullscreen/mobile-crop-audit/office-comparison.png");
