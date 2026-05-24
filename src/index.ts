import express from 'express';
import { config } from './config';
import { initDb, pool } from './database';
import { router as documentsRouter } from './routes/documents';
import { router as searchRouter } from './routes/search';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/search', searchRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

async function bootstrap() {
  await initDb();
  app.listen(config.port, () => {
    console.log(`SemanticVault running on port ${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('startup error:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
