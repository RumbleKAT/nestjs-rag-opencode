import { resolve } from 'path';

export const poolConfig = () => ({
  filename: resolve(__dirname, '../rag/rag.worker.js'),
  minThreads: parseInt(process.env.POOL_MIN_THREADS || '2', 10),
  maxThreads: parseInt(process.env.POOL_MAX_THREADS || '4', 10),
  idleTimeout: parseInt(process.env.POOL_IDLE_TIMEOUT || '30000', 10),
});
