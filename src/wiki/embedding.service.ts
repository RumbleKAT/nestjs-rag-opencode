import { Injectable, Logger } from '@nestjs/common';
import { pipeline } from '@xenova/transformers';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private embedder: any = null;
  private readonly modelName = 'Xenova/bge-m3';

  constructor() {
    this.initEmbedder();
  }

  private async initEmbedder() {
    try {
      this.embedder = await pipeline('feature-extraction', this.modelName);
      this.logger.log(`Embedder loaded: ${this.modelName}`);
    } catch (error) {
      this.logger.error(`Failed to load embedder: ${error}`);
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (!this.embedder) {
      await this.initEmbedder();
    }
    const output = await this.embedder(text, { pooling: 'cls', normalize: true });
    return Array.from(output.data as Float32Array);
  }
}
