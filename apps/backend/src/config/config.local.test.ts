import * as fs from 'fs';
import * as path from 'path';

describe('backend local config env loading', () => {
  const repoRoot = path.resolve(__dirname, '../../../../');
  const rootEnvLocalPath = path.join(repoRoot, '.env.local');
  const appEnvLocalPath = path.join(repoRoot, 'apps/backend/.env.local');
  const originalDbPassword = process.env.DB_PASSWORD;
  let originalRootEnvLocal: string | null = null;
  let originalAppEnvLocal: string | null = null;

  beforeEach(() => {
    originalRootEnvLocal = fs.existsSync(rootEnvLocalPath)
      ? fs.readFileSync(rootEnvLocalPath, 'utf8')
      : null;
    originalAppEnvLocal = fs.existsSync(appEnvLocalPath)
      ? fs.readFileSync(appEnvLocalPath, 'utf8')
      : null;
  });

  afterEach(() => {
    jest.resetModules();

    if (originalDbPassword === undefined) {
      delete process.env.DB_PASSWORD;
    } else {
      process.env.DB_PASSWORD = originalDbPassword;
    }

    if (originalRootEnvLocal === null) {
      fs.rmSync(rootEnvLocalPath, { force: true });
    } else {
      fs.writeFileSync(rootEnvLocalPath, originalRootEnvLocal);
    }

    if (originalAppEnvLocal === null) {
      fs.rmSync(appEnvLocalPath, { force: true });
    } else {
      fs.writeFileSync(appEnvLocalPath, originalAppEnvLocal);
    }
  });

  it('loads DB_PASSWORD from the repo .env.local when process env is absent', () => {
    delete process.env.DB_PASSWORD;
    fs.writeFileSync(rootEnvLocalPath, 'DB_PASSWORD=from-root-env-local\n');
    fs.rmSync(appEnvLocalPath, { force: true });

    let config: typeof import('./config.local').default;

    jest.isolateModules(() => {
      config = require('./config.local').default;
    });

    const password = (config!.typeorm.dataSource.default as { password?: string })
      .password;

    expect(password).toBe('from-root-env-local');
  });

  it('keeps the explicit process env password when one is already provided', () => {
    process.env.DB_PASSWORD = 'from-process-env';
    fs.writeFileSync(rootEnvLocalPath, 'DB_PASSWORD=from-root-env-local\n');
    fs.rmSync(appEnvLocalPath, { force: true });

    let config: typeof import('./config.local').default;

    jest.isolateModules(() => {
      config = require('./config.local').default;
    });

    const password = (config!.typeorm.dataSource.default as { password?: string })
      .password;

    expect(password).toBe('from-process-env');
  });

  it('uses bounded keepalive database connections for local MySQL', () => {
    process.env.DB_PASSWORD = 'from-process-env';
    fs.rmSync(appEnvLocalPath, { force: true });

    let config: typeof import('./config.local').default;

    jest.isolateModules(() => {
      config = require('./config.local').default;
    });

    const dataSource = config!.typeorm.dataSource.default as {
      connectTimeout?: number;
      extra?: { enableKeepAlive?: boolean; keepAliveInitialDelay?: number };
    };

    expect(dataSource.connectTimeout).toBe(5000);
    expect(dataSource.extra).toMatchObject({
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  });

  it('fails fast with a clear error when DB_PASSWORD is still missing', () => {
    delete process.env.DB_PASSWORD;
    fs.rmSync(rootEnvLocalPath, { force: true });
    fs.rmSync(appEnvLocalPath, { force: true });

    expect(() => {
      jest.isolateModules(() => {
        require('./config.local');
      });
    }).toThrow(
      '缺少本地开发数据库密码 DB_PASSWORD，请在 apps/backend/.env.local 填写真实值'
    );
  });
});
