import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 3000;

app.use(express.static(distDir, { index: false }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'bookingmanager-admin' });
});

// SPA fallback: all non-file routes return index.html.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
