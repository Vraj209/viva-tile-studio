import { copyFile, writeFile, stat, readFile } from "node:fs/promises";
import sharp from "sharp";
const manifest = JSON.parse(await readFile("work/made-around-you/fullscreen/home/prompts.json","utf8"));
const metadata=[];
for (const asset of manifest.outputs) {
 await copyFile(asset.generatedSource, asset.original);
 await sharp(asset.original).webp({quality:86,effort:6}).toFile(asset.publicPath);
 const meta=await sharp(asset.publicPath).metadata();
 metadata.push({path:asset.publicPath,width:meta.width,height:meta.height,bytes:(await stat(asset.publicPath)).size,format:meta.format});
}
await writeFile("work/made-around-you/fullscreen/home/metadata.json", JSON.stringify(metadata,null,2)+"\n");
console.log(JSON.stringify(metadata,null,2));

