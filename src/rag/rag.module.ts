import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RagService } from './rag.service';
import { RagProcessor } from './rag.processor';
import { WikiModule } from '../wiki/wiki.module';
import { OpenCodeModule } from '../opencode/opencode.module';
import { PoolModule } from '../pool/pool.module';
import { RagController } from './rag.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ragQueue',
    }),
    WikiModule,
    OpenCodeModule,
    PoolModule,
  ],
  controllers: [RagController],
  providers: [RagService, RagProcessor],
  exports: [RagService],
})
export class RagModule {}
