import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=await sharp('data/logo.png').raw().toBuffer({resolveWithObject:true});
const result=await sharp('public/images/logo-transparent.png').raw().toBuffer({resolveWithObject:true});
const {crop,margin}=JSON.parse(await readFile('work/logo/crop.json','utf8'));
let visible=0,partial=0,transparent=0,mismatch=0,borderPixels=0;
for(let y=0;y<result.info.height;y++)for(let x=0;x<result.info.width;x++){
 const i=(y*result.info.width+x)*4,a=result.data[i+3];
 if(a===0){transparent++;continue;} visible++;if(a<255)partial++;
 if(x<margin||y<margin||x>=result.info.width-margin||y>=result.info.height-margin)borderPixels++;
 const j=((y-margin+crop.top)*source.info.width+x-margin+crop.left)*3;
 if([0,1,2].some(c=>result.data[i+c]!==source.data[j+c]))mismatch++;
}
const report={sourceSha256:createHash('sha256').update(await readFile('data/logo.png')).digest('hex'),sourceDimensions:[source.info.width,source.info.height],outputDimensions:[result.info.width,result.info.height],crop,transparentMargin:margin,transparent,partial,visible,visibleRgbMismatches:mismatch,visiblePixelsInMargin:borderPixels,lowestSourceRow:crop.top+crop.height-1};
await writeFile('work/logo/asset-verification.json',JSON.stringify(report,null,2));
console.log(report);
