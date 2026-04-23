import * as fs from 'fs';
import * as path from 'path';

describe('backend local config env loading', () => {
  const repoRoot = path.resolve(__dirname, '../../../../');
  const rootEnvLocalPath = path.join(repoRoot, '.env.local');
  const originalDbPassword = process.env.DB_PASSWORD;

  afterEach(() => {
    jest.resetModules();

    if (originalDbPassword === undefined) {
      delete process.env.DB_PASSWORD;
    } else {
      process.env.DB_PASSWORD = originalDbPassword;
    }

    if (fs.existsSync(rootEnvLocalPath)) {
      fs.rmSync(rootEnvLocalPath);
    }
  });

  it('loads DB_PASSWORD from the repo .env.local when process env is absent', () => {
    delete process.env.DB_PASSWORD;
    fs.writeFileSync(rootEnvLocalPath, 'DB_PASSWORD=from-root-env-local\n');

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

    let config: typeof import('./config.local').default;

    jest.isolateModules(() => {
      config = require('./config.local').default;
    });

    const password = (config!.typeorm.dataSource.default as { password?: string })
      .password;

    expect(password).toBe('from-process-env');
  });
});
