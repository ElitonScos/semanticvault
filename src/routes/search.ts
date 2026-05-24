import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../database';
import { embed, vectorLiteral } from '../embeddings';

export const router = Router();

const SearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(5),
  threshold: z.number().min(0).max(1).default(0.7),
});

router.post('/', async (req: Request, res: Response) => {
  const parse = SearchSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(422).json({ error: parse.error.flatten() });
    return;
  }
  const { query, limit, threshold } = parse.data;

  const embedding = await embed(query);
  const vector = vectorLiteral(embedding);

  const result = await pool.query(
    `SELECT
       id,
       title,
       content,
       source,
       created_at,
       1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     WHERE 1 - (embedding <=> $1::vector) >= $2
     ORDER BY similarity DESC
     LIMIT $3`,
    [vector, threshold, limit],
  );

  res.json({
    query,
    results: result.rows,
    count: result.rowCount,
  });
});
