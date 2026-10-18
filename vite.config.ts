import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import fs from 'fs';
import JSZip from 'jszip';
import { proofreadWithGemini } from './server/proofreadService';

function proofreadApiPlugin(): Plugin {
  return {
    name: 'proofread-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/download-app' || req.url === '/api/download-project-zip') {
          try {
            const zip = new JSZip();
            const rootDir = process.cwd();

            const addDirToZip = (currentDir: string, relativePath = '') => {
              const entries = fs.readdirSync(currentDir, { withFileTypes: true });
              for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

                // Skip heavy, generated or sensitive directories
                if (
                  entry.name === 'node_modules' ||
                  entry.name === '.git' ||
                  entry.name === '.aistudio' ||
                  entry.name === 'dist' ||
                  entry.name === '.env'
                ) {
                  continue;
                }

                if (entry.isDirectory()) {
                  addDirToZip(fullPath, rel);
                } else if (entry.isFile()) {
                  const data = fs.readFileSync(fullPath);
                  zip.file(rel, data);
                }
              }
            };

            addDirToZip(rootDir);

            const zipBuffer = await zip.generateAsync({
              type: 'nodebuffer',
              compression: 'DEFLATE',
              compressionOptions: { level: 6 }
            });

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="word-excel-pro-app.zip"');
            res.end(zipBuffer);
          } catch (err: any) {
            console.error('Error creating app zip:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to create zip' }));
          }
          return;
        }

        if (req.url === '/api/proofread' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const result = await proofreadWithGemini(data.text || '');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Error processing proofread' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), proofreadApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
