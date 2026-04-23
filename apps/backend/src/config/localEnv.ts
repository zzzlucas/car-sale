import * as fs from 'fs';
import * as path from 'path';

const LOCAL_ENV_FILE_NAMES = ['.env', '.env.local'] as const;
const PRODUCTION_ENV_FILE_NAMES = [
  '.env.production',
  '.env.production.local',
] as const;

function parseEnvValue(rawValue: string) {
  const value = rawValue.trim();

  if (value.length >= 2) {
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value[value.length - 1] === quote) {
      const unwrapped = value.slice(1, -1);
      return quote === '"'
        ? unwrapped.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
        : unwrapped;
    }
  }

  return value;
}

export function parseEnvFile(content: string) {
  const parsed: Record<string, string> = {};
  const normalized = content.replace(/^\uFEFF/, '');

  for (const line of normalized.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/
    );
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    parsed[key] = parseEnvValue(rawValue);
  }

  return parsed;
}

function loadBackendEnvFiles(
  fileNames: readonly string[],
  env: NodeJS.ProcessEnv = process.env
) {
  const appRoot = path.resolve(__dirname, '../..');
  const workspaceRoot = path.resolve(appRoot, '..', '..');
  const protectedKeys = new Set(
    Object.keys(env).filter(key => env[key] !== undefined)
  );

  const envFiles = [
    ...fileNames.map(fileName => path.join(workspaceRoot, fileName)),
    ...fileNames.map(fileName => path.join(appRoot, fileName)),
  ];

  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) {
      continue;
    }

    const parsed = parseEnvFile(fs.readFileSync(envFile, 'utf8'));
    for (const [key, value] of Object.entries(parsed)) {
      if (protectedKeys.has(key)) {
        continue;
      }
      env[key] = value;
    }
  }
}

export function loadBackendLocalEnv(env: NodeJS.ProcessEnv = process.env) {
  loadBackendEnvFiles(LOCAL_ENV_FILE_NAMES, env);
}

export function loadBackendProductionEnv(
  env: NodeJS.ProcessEnv = process.env
) {
  loadBackendEnvFiles(PRODUCTION_ENV_FILE_NAMES, env);
}

export function requireBackendLocalEnv(
  key: string,
  env: NodeJS.ProcessEnv = process.env
) {
  const value = env[key]?.trim();

  if (value) {
    return value;
  }

  throw new Error(
    `缺少本地开发数据库密码 ${key}，请在仓库根目录或 apps/backend 下创建 .env.local，并填写真实值`
  );
}

export function requireBackendProductionEnv(
  key: string,
  env: NodeJS.ProcessEnv = process.env
) {
  const value = env[key]?.trim();

  if (value) {
    return value;
  }

  throw new Error(
    `缺少生产数据库密码 ${key}，请通过进程环境变量或 apps/backend/.env.production.local 提供真实值`
  );
}
