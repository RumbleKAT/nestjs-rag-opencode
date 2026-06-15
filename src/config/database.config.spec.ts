import { databaseConfig } from './database.config';

describe('DatabaseConfig', () => {
  it('should return a valid TypeOrmModuleOptions object', () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';

    const config = databaseConfig();

    expect(config).toBeDefined();
    expect(config.type).toBe('postgres');
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.username).toBe('testuser');
    expect(config.password).toBe('testpassword');
    expect(config.database).toBe('testdb');
    expect(config.autoLoadEntities).toBe(true);
    expect(config.synchronize).toBeDefined();
  });
});
