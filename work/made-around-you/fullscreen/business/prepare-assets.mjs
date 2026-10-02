import { readFile, copyFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const manifestPath = path.join(root, 'work/made-around-you/fullscreen/business/prompts.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
for (const asset of manifest.assets) {
  const originalPath = path.join(root, asset.original);
  const publicPath = path.join(root, asset.publicPath);
  await copyFile(asset.generatedSource, originalPath);
  const info = await sharp(originalPath).webp({ quality: 86, effort: 6 }).toFile(publicPath);
  const originalInfo = await sharp(originalPath).metadata();
  asset.originalPixels = { width: originalInfo.width, height: originalInfo.height };
  asset.runtimePixels = { width: info.width, height: info.height };
  asset.runtimeBytes = (await stat(publicPath)).size;
  console.log(JSON.stringify({ path: asset.publicPath, width: info.width, height: info.height, bytes: asset.runtimeBytes }));
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
