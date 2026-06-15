import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiDocument } from './wiki.entity';
import { WikiService } from './wiki.service';
import { EmbeddingService } from './embedding.service';
import { OpenCodeModule } from '../opencode/opencode.module';
import { WikiController } from './wiki.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WikiDocument]),
    OpenCodeModule
  ],
  controllers: [WikiController],
  providers: [WikiService, EmbeddingService],
  exports: [WikiService, EmbeddingService],
})
export class WikiModule {}
