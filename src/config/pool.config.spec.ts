import { poolConfig } from './pool.config';

describe('PoolConfig', () => {
  it('should return default thread pool configuration', () => {
    delete process.env.POOL_MIN_THREADS;
    delete process.env.POOL_MAX_THREADS;
    delete process.env.POOL_IDLE_TIMEOUT;

    const config = poolConfig();
    expect(config.minThreads).toBe(2);
    expect(config.maxThreads).toBe(4);
    expect(config.idleTimeout).toBe(30000);
    expect(config.filename).toContain('rag.worker.js');
  });

  it('should parse environment variables', () => {
    process.env.POOL_MIN_THREADS = '4';
    process.env.POOL_MAX_THREADS = '8';
    process.env.POOL_IDLE_TIMEOUT = '15000';

    const config = poolConfig();
    expect(config.minThreads).toBe(4);
    expect(config.maxThreads).toBe(8);
    expect(config.idleTimeout).toBe(15000);
  });
});
