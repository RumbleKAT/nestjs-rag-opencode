import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ask/sync')
  async askSync(@Body('query') query: string) {
    const result = await this.ragService.askSync(query);
    return result;
  }

  @Post('ask/async')
  async askAsync(@Body('query') query: string) {
    const jobId = await this.ragService.askAsync(query);
    return { jobId };
  }

  @Get('status/:id')
  async getStatus(@Param('id') id: string) {
    return this.ragService.getJobResult(id);
  }
}
