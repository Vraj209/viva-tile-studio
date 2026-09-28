import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const {data,info}=await sharp('data/logo.png').raw().toBuffer({resolveWithObject:true});
const W=info.width,H=1030,N=W*H;
const mask=new Uint8Array(N);
for(let y=10;y<1025;y++)for(let x=180;x<1080;x++){
 const i=y*W+x,[r,g,b]=data.subarray(i*3,i*3+3);
 mask[i]= (Math.max(r,g,b)<105 || (r-b>48&&r-g>20) || (g-r>0&&g-b>5&&g<200))?1:0;
}
// Close only one-pixel gaps in the original edge information.
const closed=mask.slice();
for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(!mask[i]&&((mask[i-1]&&mask[i+1])||(mask[i-W]&&mask[i+W])))closed[i]=1;}
const seen=new Uint8Array(N), queue=new Int32Array(N);let head=0,tail=0;
function seed(x,y){const i=y*W+x;if(!closed[i]&&!seen[i]){seen[i]=1;queue[tail++]=i;}}
seed(0,0);
// Preserve the deliberate open counters, rather than filling the A, D or O.
seed(562,790); seed(864,970); seed(1002,974);
while(head<tail){let i=queue[head++],x=i%W,y=(i-x)/W;if(x>0)seed(x-1,y);if(x<W-1)seed(x+1,y);if(y>0)seed(x,y-1);if(y<H-1)seed(x,y+1);}
const rgba=Buffer.alloc(N*4);
for(let i=0;i<N;i++){rgba[i*4]=data[i*3];rgba[i*4+1]=data[i*3+1];rgba[i*4+2]=data[i*3+2];rgba[i*4+3]=seen[i]?0:255;}
await sharp(rgba,{raw:{width:W,height:H,channels:4}}).png().toFile('work/logo/source-pixel-draft.png');
for(const [name,bg] of [['paper','#eae4da'],['forest','#303c32']]) await sharp(rgba,{raw:{width:W,height:H,channels:4}}).flatten({background:bg}).png().toFile(`work/logo/draft-${name}.png`);
console.log({foreground:N-tail});

