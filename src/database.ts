import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function initDb(): Promise<void> {
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id          BIGSERIAL PRIMARY KEY,
      title       VARCHAR(500) NOT NULL,
      content     TEXT NOT NULL,
      source      VARCHAR(500),
      embedding   vector(${config.embeddingDimensions}),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_documents_embedding
    ON documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 10)
  `);
}
