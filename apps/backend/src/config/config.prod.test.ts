describe('backend production config env loading', () => {
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');
  const appRoot = path.resolve(__dirname, '../..');
  const appProdEnvLocalPath = path.join(appRoot, '.env.production.local');
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    if (fs.existsSync(appProdEnvLocalPath)) {
      fs.rmSync(appProdEnvLocalPath);
    }
  });

  it('loads DB_PASSWORD from apps/backend/.env.production.local when process env is absent', () => {
    delete process.env.DB_PASSWORD;
    fs.writeFileSync(
      appProdEnvLocalPath,
      ['DB_PASSWORD=from-prod-file', 'DB_USERNAME=car_platform'].join('\n') + '\n'
    );

    let config: typeof import('./config.prod').default;

    jest.isolateModules(() => {
      config = require('./config.prod').default;
    });

    const dataSource = config!.typeorm.dataSource.default as {
      username?: string;
      password?: string;
    };

    expect(dataSource).toMatchObject({
      username: 'car_platform',
      password: 'from-prod-file',
    });
  });

  it('reads database connection from explicit production env vars', () => {
    process.env.DB_HOST = '124.222.31.238';
    process.env.DB_PORT = '3306';
    process.env.DB_USERNAME = 'car_platform';
    process.env.DB_PASSWORD = 'from-prod-env';
    process.env.DB_NAME = 'car_platform';

    let config: typeof import('./config.prod').default;

    jest.isolateModules(() => {
      config = require('./config.prod').default;
    });

    const dataSource = config!.typeorm.dataSource.default as {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      database?: string;
    };

    expect(dataSource).toMatchObject({
      host: '124.222.31.238',
      port: 3306,
      username: 'car_platform',
      password: 'from-prod-env',
      database: 'car_platform',
    });
  });

  it('lets production env files override stale process map provider variables', () => {
    process.env.MAP_SERVICE_PROVIDER = 'amap-proxy';
    process.env.AMAP_WEB_SERVICE_KEYS = 'stale-map-key';
    fs.writeFileSync(
      appProdEnvLocalPath,
      [
        'DB_PASSWORD=from-prod-file',
        'MAP_SERVICE_PROVIDER=amap-official',
        'AMAP_WEB_SERVICE_KEYS=official-map-key',
      ].join('\n') + '\n'
    );

    jest.isolateModules(() => {
      require('./config.prod');
    });

    expect(process.env.MAP_SERVICE_PROVIDER).toBe('amap-official');
    expect(process.env.AMAP_WEB_SERVICE_KEYS).toBe('official-map-key');
  });

  it('fails fast when production DB_PASSWORD is missing', () => {
    process.env.DB_HOST = '124.222.31.238';
    process.env.DB_PORT = '3306';
    process.env.DB_USERNAME = 'car_platform';
    delete process.env.DB_PASSWORD;
    process.env.DB_NAME = 'car_platform';

    expect(() => {
      jest.isolateModules(() => {
        require('./config.prod');
      });
    }).toThrow('缺少生产数据库密码 DB_PASSWORD');
  });
});
