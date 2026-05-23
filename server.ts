import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

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
