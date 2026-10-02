import { copyFile, writeFile, stat, readFile } from "node:fs/promises";
import sharp from "sharp";
const asset = JSON.parse(await readFile("work/made-around-you/fullscreen/home/living-prompt.json","utf8"));
await copyFile(asset.generatedSource,asset.original);
await sharp(asset.original).webp({quality:86,effort:6}).toFile(asset.publicPath);
const meta=await sharp(asset.publicPath).metadata();
const output={path:asset.publicPath,width:meta.width,height:meta.height,bytes:(await stat(asset.publicPath)).size,format:meta.format};
await writeFile("work/made-around-you/fullscreen/home/living-metadata.json",JSON.stringify(output,null,2)+"\n");
console.log(JSON.stringify(output,null,2));
