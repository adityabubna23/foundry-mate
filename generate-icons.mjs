import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgBuffer = readFileSync(resolve(__dirname, 'public/icon.svg'));

async function generate() {
  // 192x192
  await sharp(svgBuffer, { density: 300 })
    .resize(192, 192)
    .png()
    .toFile(resolve(__dirname, 'public/icon-192.png'));
  console.log('✓ icon-192.png');

  // 512x512
  await sharp(svgBuffer, { density: 300 })
    .resize(512, 512)
    .png()
    .toFile(resolve(__dirname, 'public/icon-512.png'));
  console.log('✓ icon-512.png');

  // 512x512 maskable (with padding for safe area)
  const maskable = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 10, g: 14, b: 23, alpha: 1 }, // #0a0e17
    },
  })
    .composite([
      {
        input: await sharp(svgBuffer, { density: 300 })
          .resize(384, 384)
          .png()
          .toBuffer(),
        gravity: 'centre',
      },
    ])
    .png()
    .toFile(resolve(__dirname, 'public/icon-maskable-512.png'));
  console.log('✓ icon-maskable-512.png');
}

generate().catch(console.error);
