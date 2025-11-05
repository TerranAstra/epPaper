import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const __dirname2 = path.dirname(fileURLToPath(import.meta.url));
    const baseDir = path.resolve(__dirname2, 'user-files');

    // ensure base directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const safeJoin = (base: string, target: string) => {
      const targetPath = path.resolve(base, target.replace(/^\/+/, ''));
      if (!targetPath.startsWith(base)) {
        throw new Error('Path traversal is not allowed');
      }
      return targetPath;
    };

    const fileApiPlugin = () => ({
      name: 'local-file-api',
      configureServer(server: any) {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          if (!req.url?.startsWith('/api/fs/')) return next();
          try {
            const chunks: Buffer[] = [];
            for await (const ch of req) chunks.push(ch as Buffer);
            const bodyStr = Buffer.concat(chunks).toString('utf8') || '{}';
            const body = JSON.parse(bodyStr);

            const send = (status: number, data: any) => {
              res.statusCode = status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };

            if (req.url === '/api/fs/list' && req.method === 'POST') {
              const dir = body.dir || '.';
              const dirPath = safeJoin(baseDir, dir);
              const entries = await fsp.readdir(dirPath, { withFileTypes: true });
              const result = await Promise.all(entries.map(async (ent) => {
                const p = path.join(dirPath, ent.name);
                const stat = await fsp.stat(p);
                return {
                  name: ent.name,
                  type: ent.isDirectory() ? 'directory' : 'file',
                  size: stat.size,
                  mtimeMs: stat.mtimeMs,
                };
              }));
              return send(200, { baseDir: 'user-files', dir, entries: result });
            }

            if (req.url === '/api/fs/read' && req.method === 'POST') {
              const p = safeJoin(baseDir, body.path || '');
              const content = await fsp.readFile(p, 'utf8');
              return send(200, { path: body.path, content });
            }

            if (req.url === '/api/fs/write' && req.method === 'POST') {
              const p = safeJoin(baseDir, body.path || '');
              await fsp.mkdir(path.dirname(p), { recursive: true });
              await fsp.writeFile(p, body.content ?? '', 'utf8');
              return send(200, { ok: true });
            }

            if (req.url === '/api/fs/mkdir' && req.method === 'POST') {
              const p = safeJoin(baseDir, body.path || '');
              await fsp.mkdir(p, { recursive: true });
              return send(200, { ok: true });
            }

            if (req.url === '/api/fs/delete' && req.method === 'POST') {
              const p = safeJoin(baseDir, body.path || '');
              await fsp.rm(p, { recursive: !!body.recursive, force: true });
              return send(200, { ok: true });
            }

            return send(404, { error: 'Not found' });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || String(err) }));
          }
        });
      },
    });
    return {
      server: {
        port: 3095,
        host: '0.0.0.0',
      },
      plugins: [react(), fileApiPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
