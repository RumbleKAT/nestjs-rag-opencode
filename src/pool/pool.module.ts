import { Module, Global } from '@nestjs/common';
import Piscina from 'piscina';
import * as path from 'path';

export const PISCINA_POOL = 'PISCINA_POOL';

@Global()
@Module({
  providers: [
    {
      provide: PISCINA_POOL,
      useFactory: () => {
        // use .js extension because we run built files in dist
        return new Piscina({
          filename: path.resolve(__dirname, '../rag/rag.worker.js'),
          minThreads: parseInt(process.env.POOL_MIN_THREADS || '2', 10),
          maxThreads: parseInt(process.env.POOL_MAX_THREADS || '4', 10),
          idleTimeout: parseInt(process.env.POOL_IDLE_TIMEOUT || '30000', 10),
        });
      },
    },
  ],
  exports: [PISCINA_POOL],
})
export class PoolModule {}
