import sharp from 'sharp';
const {data,info}=await sharp('data/logo.png').raw().toBuffer({resolveWithObject:true});
const W=info.width,H=1030,N=W*H;
const mask=new Uint8Array(N);
for(let y=10;y<1025;y++)for(let x=180;x<1080;x++){
 let max=0;for(let c=0;c<3;c++)max=Math.max(max,Math.abs(data[((y)*W+x-1)*3+c]-data[((y)*W+x+1)*3+c]),Math.abs(data[((y-1)*W+x)*3+c]-data[((y+1)*W+x)*3+c]));
 mask[y*W+x]=max>33?1:0;
}
const dilated=mask.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let i=y*W+x;if(mask[i])for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)dilated[i+dy*W+dx]=1;}
const closed=mask.slice();for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){let i=y*W+x;let ok=true;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(!dilated[i+dy*W+dx])ok=false;closed[i]=ok?1:0;}
const seen=new Uint8Array(N),queue=new Int32Array(N);let head=0,tail=0;
function seed(x,y){const i=y*W+x;if(!closed[i]&&!seen[i]){seen[i]=1;queue[tail++]=i;}}
seed(0,0);seed(562,790);seed(864,970);seed(1020,975);
while(head<tail){let i=queue[head++],x=i%W,y=(i-x)/W;if(x>0)seed(x-1,y);if(x<W-1)seed(x+1,y);if(y>0)seed(x,y-1);if(y<H-1)seed(x,y+1);}
const rgba=Buffer.alloc(N*4);for(let i=0;i<N;i++){rgba[i*4]=data[i*3];rgba[i*4+1]=data[i*3+1];rgba[i*4+2]=data[i*3+2];rgba[i*4+3]=seen[i]?0:255;}
await sharp(rgba,{raw:{width:W,height:H,channels:4}}).png().toFile('work/logo/edge-draft.png');
await sharp(rgba,{raw:{width:W,height:H,channels:4}}).flatten({background:'#303c32'}).png().toFile('work/logo/edge-forest.png');
