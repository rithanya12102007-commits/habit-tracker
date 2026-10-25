import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleCoachRequest, handleLiveTokenRequest } from './src/server/coachApi';

function coachApiPlugin(): Plugin {
  return {
    name: 'coach-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/live/token') && req.method === 'POST') {
          const ip = req.socket.remoteAddress || 'unknown';
          handleLiveTokenRequest(req.headers.authorization, ip)
            .then((result) => {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = result.status;
              res.end(JSON.stringify(result.json));
            })
            .catch((err) => {
              console.error('Error handling /api/live/token:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to create live token' }));
            });
          return;
        }
        if (req.url?.startsWith('/api/coach/chat') && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          });
          req.on('end', async () => {
            try {
              const bodyStr = Buffer.concat(chunks).toString('utf8');
              const data = bodyStr ? JSON.parse(bodyStr) : {};
              const ip = req.socket.remoteAddress || 'unknown';
              const result = await handleCoachRequest(data, req.headers.authorization, ip);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = result.status;
              res.end(JSON.stringify(result.json));
            } catch (err) {
              console.error('Error handling /api/coach/chat:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to process AI request' }));
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
    plugins: [react(), tailwindcss(), coachApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
