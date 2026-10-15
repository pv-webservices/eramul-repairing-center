// Server-side image generation. Run: node --env-file=.env scripts/generate-images.mjs [assetId ...] [--force] [--premium]
// Never import this from site code; the key must stay out of the browser bundle.
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { imageConfig, assets, routeModel } from './image-gen.config.mjs';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set. Add it to .env (never commit it).');
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const forcePremium = args.includes('--premium'); // re-run an asset on Sunburst if Flare output was insufficient
const ids = args.filter((a) => !a.startsWith('--'));
const selected = ids.length ? assets.filter((a) => ids.includes(a.id)) : assets;

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

async function generate(asset) {
  const route = routeModel(asset);
  if (forcePremium) route.model = imageConfig.models.sunburst;
  const res = await fetch(imageConfig.endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: route.model, prompt: asset.prompt, size: route.size, quality: route.quality, n: 1 }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${json?.error?.message || res.statusText}`);
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image data in response');
  return { buffer: Buffer.from(b64, 'base64'), route };
}

async function writeVariants(asset, buffer) {
  const dir = imageConfig.output.dir;
  await mkdir(dir, { recursive: true });
  await mkdir('output/gen-sources', { recursive: true });
  await writeFile(path.join('output/gen-sources', `${asset.id}.source.png`), buffer); // originals kept outside public/
  const widths = imageConfig.output.widths[asset.orientation];
  for (const [i, width] of widths.entries()) {
    const suffix = i === 0 ? '' : `-${width}`;
    await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: imageConfig.output.webpQuality }).toFile(path.join(dir, `${asset.id}${suffix}.webp`));
  }
}

for (const asset of selected) {
  const target = path.join(imageConfig.output.dir, `${asset.id}.webp`);
  if (!force && (await exists(target))) { console.log(`skip ${asset.id} (exists)`); continue; }
  try {
    const { buffer, route } = await generate(asset);
    await writeVariants(asset, buffer);
    console.log(`ok   ${asset.id} → ${route.model} / ${route.quality} / ${route.size}`);
  } catch (err) {
    console.error(`fail ${asset.id}: ${err.message}`);
    process.exitCode = 1;
  }
}
