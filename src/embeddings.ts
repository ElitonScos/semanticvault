import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
import { config } from './config';

let extractor: FeatureExtractionPipeline | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    console.log(`Loading embedding model: ${config.embeddingModel}`);
    extractor = await pipeline('feature-extraction', config.embeddingModel, {
      quantized: true,
    });
    console.log('Embedding model ready');
  }
  return extractor;
}

export async function embed(text: string): Promise<number[]> {
  const ext = await getExtractor();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}

export function vectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}
