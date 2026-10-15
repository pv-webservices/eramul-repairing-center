// Rebuilds service card thumbnails from the client-supplied originals (originals untouched).
import sharp from 'sharp';
const map = { ac: 'Image-7.jpeg', compressor: 'air-compressor.jpeg', washing: 'Image-6.jpeg', inverter: 'compressor-1.jpeg', motor: 'high-pressure-washing-motor.jpeg', lift: '2-stand-lift.jpeg', fridge: 'commercial-freeze.jpeg', ice: 'ice-cube-machine.jpeg', chiller: 'chilled-plant.jpeg', vacuum: 'vacuum-clearner.jpeg' };
const W = 800, H = 600, PAD = 0.12, EDGE = 0.03; // EDGE drops thin frame lines in the supplied graphics
for (const [name, file] of Object.entries(map)) {
  const upright = await sharp(`public/${file}`).rotate().flatten({ background: '#fff' }).toBuffer({ resolveWithObject: true });
  const { width, height } = upright.info;
  const inset = Math.round(Math.min(width, height) * EDGE);
  const cropped = await sharp(upright.data).extract({ left: inset, top: inset, width: width - inset * 2, height: height - inset * 2 }).toBuffer();
  const trimmed = await sharp(cropped).trim({ background: '#ffffff', threshold: 28 }).toBuffer();
  const inner = await sharp(trimmed).resize({ width: Math.round(W * (1 - PAD * 2)), height: Math.round(H * (1 - PAD * 2)), fit: 'inside' }).toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } }).composite([{ input: inner, gravity: 'center' }]).webp({ quality: 82 }).toFile(`public/images/${name}.webp`);
  console.log('ok', name);
}
