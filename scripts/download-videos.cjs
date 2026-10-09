// Requires FFmpeg and network access at build time only. No runtime dependencies.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) {
  console.error('FFmpeg is required to download and optimise the licensed clips. Install FFmpeg, then run this script again. Existing image backgrounds are unchanged.');
  process.exit(1);
}
const sources = [
  ['domestic', 'https://cdn.pixabay.com/video/2023/09/20/181376-866506956_large.mp4'],
  ['international', 'https://cdn.pixabay.com/video/2019/02/19/21528-318978038_large.mp4']
];
const directory = path.join(root, 'assets', 'videos');
fs.mkdirSync(directory, { recursive: true });
for (const [route, url] of sources) {
  const target = path.join(directory, `${route}-journey.mp4`);
  const temporary = path.join(directory, `${route}-journey.pending.mp4`);
  console.log(`Downloading and optimising ${route} footage...`);
  const result = spawnSync('ffmpeg', ['-y', '-rw_timeout', '20000000', '-i', url, '-t', '18', '-an', '-vf', 'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24', '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', temporary], { stdio: 'inherit', timeout: 300000 });
  if (result.status !== 0) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    console.error(`${route}: download failed; the existing background is unchanged.`);
    process.exitCode = 1;
    continue;
  }
  fs.renameSync(temporary, target);
  console.log(`Saved ${path.relative(root, target)}. Run node scripts/build.cjs to include it.`);
}
