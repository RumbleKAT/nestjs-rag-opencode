import { Controller, Post, Body } from '@nestjs/common';
import { WikiService } from './wiki.service';

@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Post('index')
  async indexDocument(@Body('title') title: string, @Body('text') text: string) {
    const doc = await this.wikiService.indexDocument(title, text);
    return { id: doc.id, title: doc.title, entities: doc.entities };
  }
}
