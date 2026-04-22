import { ModuleConfig } from '@cool-midway/core';

export default () => {
  return {
    name: '客户侧应用模块',
    description: '服务移动端客户与移动运营端的应用接口',
    middlewares: [],
    globalMiddlewares: [],
    order: 1,
  } as ModuleConfig;
};
