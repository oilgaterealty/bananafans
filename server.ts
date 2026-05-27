import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// =====================================================================
// Shared visitor counter — file-backed persistent store
// =====================================================================
// Single source of truth for the live BananaFans visitor count. Stored
// in data/visitor-count.json so it survives process restarts (on hosts
// with persistent disk). Reads are O(1) from an in-memory cache; writes
// are serialised through a tiny promise queue to avoid file races.
// =====================================================================

const COUNT_FILE = path.join(process.cwd(), 'data', 'visitor-count.json');

// Initial baseline matches CONFIGURABLE_STARTING_NUMBER in src/App.tsx.
// Only used the first time the persistent file is created.
const COUNTER_BASELINE = -1;

let cachedCount: number | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function readCountFromDisk(): number {
  try {
    if (fs.existsSync(COUNT_FILE)) {
      const raw = fs.readFileSync(COUNT_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const n = Number(parsed?.count);
      if (Number.isFinite(n)) return n;
    }
  } catch (err) {
    console.warn('[visitor-counter] read failed, falling back to baseline:', err);
  }
  return COUNTER_BASELINE;
}

function persistCount(n: number): void {
  writeQueue = writeQueue.then(async () => {
    try {
      const dir = path.dirname(COUNT_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(
        COUNT_FILE,
        JSON.stringify({ count: n, updatedAt: new Date().toISOString() }, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.warn('[visitor-counter] write failed:', err);
    }
  });
}

function getCount(): number {
  if (cachedCount === null) {
    cachedCount = readCountFromDisk();
  }
  return cachedCount;
}

function incrementCount(): number {
  const next = getCount() + 1;
  cachedCount = next;
  persistCount(next);
  return next;
}

// Automatic watcher for uploaded video assets
function watchForUploadedVideos() {
  const rootDir = process.cwd();
  const targetDir = path.join(rootDir, 'public', 'videos');
  const targetFileName = 'bananafans-avatar-loop.mp4';
  const targetPath = path.join(targetDir, targetFileName);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  function scan(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
            continue;
          }
          scan(fullPath);
        } else if (entry.isFile()) {
          const lowerName = entry.name.toLowerCase();
          // Match any mp4 file that is not our final target file
          if (lowerName.endsWith('.mp4') && fullPath !== targetPath) {
            const stat = fs.statSync(fullPath);
            // Verify file is fully transferred and not a blank placeholder
            if (stat.size > 10000) {
              console.log(`[WATCHER] Detected custom video upload: ${entry.name} (${stat.size} bytes). Moving to permanent location...`);
              
              // Copy bytes to permanent public location
              fs.writeFileSync(targetPath, fs.readFileSync(fullPath));
              
              // Synced copy to production distribution
              const distVideosDir = path.join(rootDir, 'dist', 'videos');
              if (fs.existsSync(path.join(rootDir, 'dist'))) {
                if (!fs.existsSync(distVideosDir)) {
                  fs.mkdirSync(distVideosDir, { recursive: true });
                }
                fs.writeFileSync(path.join(distVideosDir, targetFileName), fs.readFileSync(fullPath));
              }

              // Delete original source to keep workspace dry, clean, and avoid duplicate loops
              fs.unlinkSync(fullPath);
              console.log(`[WATCHER] Successfully relocated video asset to permanent folder: ${targetPath}`);
            }
          }
        }
      }
    } catch (e: any) {
      // scan error grace
    }
  }

  scan(rootDir);
}

// Run immediately and scan every 3 seconds to intercept IDE drag-and-drop actions
setInterval(watchForUploadedVideos, 3000);
watchForUploadedVideos();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ---------------------------------------------------------------
  // Shared visitor counter endpoints
  // ---------------------------------------------------------------
  // Increment + return new count. Frontend calls this exactly once
  // per browser session (gated by sessionStorage).
  app.post('/api/visit', (_req, res) => {
    try {
      const count = incrementCount();
      res.json({ count });
    } catch (err: any) {
      console.error('[visitor-counter] increment failed:', err);
      res.status(500).json({ error: 'Failed to increment counter' });
    }
  });

  // Read-only count. Used by the admin page and by repeat sessions
  // that should not increment the counter.
  app.get('/api/visit-count', (_req, res) => {
    try {
      const count = getCount();
      res.json({ count });
    } catch (err: any) {
      console.error('[visitor-counter] read failed:', err);
      res.status(500).json({ error: 'Failed to read counter' });
    }
  });

  // Endpoint to handle the developer file upload
  app.post('/api/dev-upload', express.raw({ type: '*/*', limit: '100mb' }), (req, res) => {
    try {
      const publicVideosDir = path.join(process.cwd(), 'public', 'videos');
      if (!fs.existsSync(publicVideosDir)) {
        fs.mkdirSync(publicVideosDir, { recursive: true });
      }

      const targetPath = path.join(publicVideosDir, 'bananafans-avatar-loop.mp4');
      fs.writeFileSync(targetPath, req.body);
      
      // Also copy to dist/videos if it exists, to keep production build synced
      const distVideosDir = path.join(process.cwd(), 'dist', 'videos');
      if (fs.existsSync(distVideosDir)) {
        fs.writeFileSync(path.join(distVideosDir, 'bananafans-avatar-loop.mp4'), req.body);
      }

      console.log(`Developer uploaded custom video of size ${req.body.length} bytes`);
      res.json({ success: true, size: req.body.length });
    } catch (error: any) {
      console.error('Error in developer upload:', error);
      res.status(500).json({ error: error.message || 'Failed to save upload' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
