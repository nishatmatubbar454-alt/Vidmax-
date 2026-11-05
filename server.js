import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Ensure dist exists; if not built yet (e.g. Render only ran install), build it
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('Production build not found. Building now...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.error('Build error:', err);
  }
}

// 1. Direct APK Download Stream with proper Android MIME type
app.get(['/api/download-apk', '/CineStreamBD_v2.1.0.apk'], (req, res) => {
  const distApk = path.join(distDir, 'CineStreamBD_v2.1.0.apk');
  const pubApk = path.resolve(__dirname, 'public/CineStreamBD_v2.1.0.apk');
  const apkPath = fs.existsSync(distApk) ? distApk : pubApk;

  if (fs.existsSync(apkPath)) {
    const stat = fs.statSync(apkPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="CineStreamBD_v2.1.0.apk"',
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    const stream = fs.createReadStream(apkPath);
    stream.pipe(res);
  } else {
    res.redirect('https://github.com/nishatmatubbar454-alt/Vidmax-/releases');
  }
});

// 2. Serve static dist files
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // Single Page App fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.use(express.static(path.resolve(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Vidmax web service running on http://0.0.0.0:${port}`);
});
