import { Injectable, Logger, Inject } from '@nestjs/common';
import Piscina from 'piscina';
import * as fs from 'fs';
import * as path from 'path';
import { PISCINA_POOL } from '../pool/pool.module';

@Injectable()
export class OpenCodeService {
  private readonly logger = new Logger(OpenCodeService.name);

  constructor(@Inject(PISCINA_POOL) private readonly pool: Piscina) {}

  private getSkillPrompt(skillName: string): string {
    try {
      const skillPath = path.resolve(__dirname, `skills/${skillName}.md`);
      return fs.readFileSync(skillPath, 'utf8');
    } catch (e) {
      this.logger.warn(`Failed to load skill: ${skillName}`);
      return '';
    }
  }

  async runIndexing(text: string): Promise<string> {
    const systemPrompt = this.getSkillPrompt('indexing-skill');
    return this.generateText(systemPrompt, `Extract entities and summarize the following text:\n\n${text}`);
  }

  async runServing(query: string, context: string): Promise<string> {
    const systemPrompt = this.getSkillPrompt('serving-skill');
    return this.generateText(systemPrompt, `Context:\n${context}\n\nQuestion: ${query}`);
  }

  private async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      this.logger.log('Delegating OpenCode SDK Request to Thread Pool Worker');
      const result = await this.pool.run({
        systemPrompt,
        userPrompt,
      });
      return result;
    } catch (error: any) {
      this.logger.error(`OpenCode SDK Request failed in pool: ${error.message}`);
      throw error;
    }
  }
}
