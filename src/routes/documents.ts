import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../database';
import { embed, vectorLiteral } from '../embeddings';

export const router = Router();

const CreateDocSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  source: z.string().optional(),
});

router.post('/', async (req: Request, res: Response) => {
  const parse = CreateDocSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(422).json({ error: parse.error.flatten() });
    return;
  }
  const { title, content, source } = parse.data;

  const embedding = await embed(`${title}\n${content}`);
  const vector = vectorLiteral(embedding);

  const result = await pool.query(
    `INSERT INTO documents (title, content, source, embedding)
     VALUES ($1, $2, $3, $4::vector)
     RETURNING id, title, source, created_at`,
    [title, content, source ?? null, vector],
  );

  res.status(201).json(result.rows[0]);
});

router.get('/', async (_req: Request, res: Response) => {
  const limit = Math.min(parseInt(String(_req.query.limit ?? '20'), 10), 100);
  const offset = parseInt(String(_req.query.offset ?? '0'), 10);

  const countResult = await pool.query('SELECT COUNT(*) FROM documents');
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    'SELECT id, title, source, created_at FROM documents ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset],
  );

  res.json({ data: result.rows, total, limit, offset });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { rowCount } = await pool.query('DELETE FROM documents WHERE id=$1', [req.params.id]);
  if (!rowCount) {
    res.status(404).json({ error: 'document not found' });
    return;
  }
  res.status(204).send();
});
