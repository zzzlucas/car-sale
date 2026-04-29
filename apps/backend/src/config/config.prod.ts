import { CoolConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';
import { entities } from '../entities';
import { TenantSubscriber } from '../modules/base/db/tenant';
import {
  loadBackendProductionEnv,
  requireBackendProductionEnv,
} from './localEnv';

loadBackendProductionEnv();

const dbPassword = requireBackendProductionEnv('DB_PASSWORD');
const dbPort = Number(process.env.DB_PORT || 3306);
const backendPort = Number(
  process.env.CAR_BACKEND_PORT || process.env.PORT || 8120
);

/**
 * 生产环境读取的配置文件
 *
 * 真实密钥不写入仓库；cloud2026 上推荐通过进程环境变量或
 * apps/backend/.env.production.local 提供。
 */
export default {
  koa: {
    port: backendPort,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: dbPort,
        username: process.env.DB_USERNAME || 'car_platform',
        password: dbPassword,
        database: process.env.DB_NAME || 'car_platform',
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: false,
        // 打印日志
        logging: false,
        // 字符集
        charset: 'utf8mb4',
        connectTimeout: 5000,
        extra: {
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
        },
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities,
        // 订阅者
        subscribers: [TenantSubscriber],
      },
    },
  },
  cool: {
    // 实体与路径，跟生成代码、前端请求、swagger文档相关 注意：线上不建议开启，以免暴露敏感信息
    eps: false,
    // 是否自动导入模块数据库
    initDB: false,
    // 判断是否初始化的方式
    initJudge: 'db',
    // 是否自动导入模块菜单
    initMenu: false,
  } as CoolConfig,
} as MidwayConfig;
