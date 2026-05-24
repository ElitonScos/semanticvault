import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing environment variable: ${key}`);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: required('DATABASE_URL'),
  embeddingModel: process.env.EMBEDDING_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
  embeddingDimensions: parseInt(process.env.EMBEDDING_DIMENSIONS ?? '384', 10),
};
