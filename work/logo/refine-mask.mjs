import sharp from 'sharp';
const source=await sharp('data/logo.png').raw().toBuffer({resolveWithObject:true});
const draft=await sharp('work/logo/edge-draft.png').raw().toBuffer({resolveWithObject:true});
const W=draft.info.width,H=draft.info.height,N=W*H;
const alpha=new Uint8Array(N);for(let i=0;i<N;i++)alpha[i]=draft.data[i*4+3];
const tileFaces=[[982,24,1008,52],[885,42,914,75],[947,49,973,77],[1020,55,1045,82],[977,80,1002,104],[947,103,968,127],[1006,110,1022,127],[969,134,993,159],[942,178,964,201],[909,196,929,217],[910,233,931,253],[862,257,890,288],[836,287,862,314],[815,332,834,356],[891,81,945,144]];
// Exact source artwork, including ivory faces too similar to the wall for colour keying.
for(const [l,t,r,b] of tileFaces){
 if(l>=942||t<80)for(let y=t-3;y<b+4;y++)for(let x=l-3;x<r+4;x++)if(y>=0&&y<H&&x>=0&&x<W)alpha[y*W+x]=0;
 for(let y=t;y<b;y++)for(let x=l;x<r;x++)alpha[y*W+x]=255;
}
// Remove detached single-pixel edge noise without touching any intentional small square.
const seen=new Uint8Array(N),q=new Int32Array(N);
for(let start=0;start<N;start++)if(alpha[start]&&!seen[start]){let h=0,t=1;q[0]=start;seen[start]=1;while(h<t){const p=q[h++],x=p%W;for(const n of [p-W,p+W,x>0?p-1:-1,x<W-1?p+1:-1])if(n>=0&&n<N&&alpha[n]&&!seen[n]){seen[n]=1;q[t++]=n;}}if(t<18)for(let k=0;k<t;k++)alpha[q[k]]=0;}
const edge=alpha.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let min=255;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)min=Math.min(min,alpha[(y+dy)*W+x+dx]);edge[y*W+x]=min;}
const feather=await sharp(edge,{raw:{width:W,height:H,channels:1}}).blur(.6).toColourspace('b-w').raw().toBuffer();
const rgba=Buffer.alloc(N*4);for(let i=0;i<N;i++){rgba[i*4]=feather[i]?source.data[i*3]:0;rgba[i*4+1]=feather[i]?source.data[i*3+1]:0;rgba[i*4+2]=feather[i]?source.data[i*3+2]:0;rgba[i*4+3]=feather[i];}
await sharp(rgba,{raw:{width:W,height:H,channels:4}}).png().toFile('work/logo/refined.png');
for(const [name,color]of [['forest','#303c32'],['paper','#eae4da'],['stone','#d0c6ba']])await sharp(rgba,{raw:{width:W,height:H,channels:4}}).flatten({background:color}).png().toFile(`work/logo/refined-${name}.png`);


