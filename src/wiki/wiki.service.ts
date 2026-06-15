import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WikiDocument } from './wiki.entity';
import { EmbeddingService } from './embedding.service';
import { OpenCodeService } from '../opencode/opencode.service';

@Injectable()
export class WikiService {
  private readonly logger = new Logger(WikiService.name);

  constructor(
    @InjectRepository(WikiDocument)
    private readonly wikiRepository: Repository<WikiDocument>,
    private readonly embeddingService: EmbeddingService,
    private readonly openCodeService: OpenCodeService,
  ) {}

  async indexDocument(title: string, rawText: string): Promise<WikiDocument> {
    this.logger.log(`Starting indexing for document: ${title}`);
    
    // 1. Send to OpenCode SDK to structure and extract entities
    const structuredResponse = await this.openCodeService.runIndexing(rawText);
    
    // Parse the structured markdown if possible, for now we will just save the whole markdown as content
    // In a real scenario, we might parse "Entities: ..." out of the text.
    // Let's do a basic regex to extract entities if they are listed as bullet points under "Entities"
    const entities = this.extractEntities(structuredResponse);

    // 2. Generate Embedding
    const embedding = await this.embeddingService.getEmbedding(structuredResponse);

    // 3. Save to DB
    const doc = this.wikiRepository.create({
      title,
      content: structuredResponse,
      entities,
      embedding,
    });

    return this.wikiRepository.save(doc);
  }

  private extractEntities(text: string): string[] {
    const entities: string[] = [];
    const entitySectionMatch = text.match(/##\s*Entities\n([\s\S]*?)(?=##|$)/i);
    if (entitySectionMatch) {
      const lines = entitySectionMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^[-\*\s]+/, '').trim();
        if (cleaned) {
          entities.push(cleaned);
        }
      }
    }
    return entities;
  }

  async searchSimilarDocuments(query: string, limit = 4): Promise<WikiDocument[]> {
    const queryEmbedding = await this.embeddingService.getEmbedding(query);
    const vectorString = `[${queryEmbedding.join(',')}]`;
    
    // Uses pgvector's L2 distance operator `<->`
    const docs = await this.wikiRepository
      .createQueryBuilder('wiki')
      .orderBy(`wiki.embedding <-> '${vectorString}'`, 'ASC')
      .limit(limit)
      .getMany();
      
    return docs;
  }
}
