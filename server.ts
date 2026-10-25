import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleCoachRequest, handleLiveTokenRequest } from './src/server/coachApi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Needed on Cloud Run so req.ip is the real visitor IP (used for rate limiting)
app.set('trust proxy', 1);
app.use(express.json({ limit: '50kb' }));

app.post('/api/coach/chat', async (req, res) => {
  try {
    const result = await handleCoachRequest(req.body, req.headers.authorization, req.ip || 'unknown');
    res.status(result.status).json(result.json);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/live/token', async (req, res) => {
  try {
    const result = await handleLiveTokenRequest(req.headers.authorization, req.ip || 'unknown');
    res.status(result.status).json(result.json);
  } catch (error) {
    console.error('Live token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend build in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ritho AI production server listening on port ${PORT}`);
});
