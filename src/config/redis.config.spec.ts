import { redisConfig } from './redis.config';

describe('RedisConfig', () => {
  it('should return a valid Redis config object', () => {
    process.env.REDIS_HOST = 'test-redis-host';
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 'test-password';

    const config = redisConfig();

    expect(config.host).toBe('test-redis-host');
    expect(config.port).toBe(6380);
    expect(config.password).toBe('test-password');
  });

  it('should fallback to default values', () => {
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;

    const config = redisConfig();

    expect(config.host).toBe('localhost');
    expect(config.port).toBe(6379);
    expect(config.password).toBeUndefined();
  });
});
