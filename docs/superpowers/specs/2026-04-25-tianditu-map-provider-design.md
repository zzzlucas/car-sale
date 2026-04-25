# 天地图地图 Provider 设计

## 目标

为 `apps/backend` 增加天地图 Web 服务 provider，并允许通过环境变量在天地图与高德之间切换；默认使用天地图，前端接口保持不变。

## 背景

当前高德中转站链路返回 `INVALID_USER_DOMAIN / 10006`，说明 `key + amap.bangban.cc/_AMapService + JS 来源上下文` 组合不可用。为了降低对单一卖家中转站的依赖，后端地图服务需要支持另一个 provider。

## 配置

- `MAP_SERVICE_PROVIDER=tianditu|amap`，默认 `tianditu`。
- `TIANDITU_WEB_SERVICE_KEYS` 为天地图 Key 池，支持逗号、空格或换行分隔。
- `TIANDITU_WEB_SERVICE_KEY` 为单 Key 兼容入口。
- `TIANDITU_WEB_SERVICE_TIMEOUT_MS` 覆盖天地图请求超时，默认 2500ms。
- 现有 `AMAP_WEB_SERVICE_*` 保留，用于显式回退高德。

## 接口兼容

前端继续调用现有接口：

- `/app/map/address-suggestions`
- `/app/map/regeo`

后端继续返回现有共享类型：

- `MapAddressSuggestion[]`
- `MapReverseGeocodeResult | null`

缺少有效经纬度时改为明确错误 `缺少有效经纬度`，避免返回空 success 误导排查。

## 实现边界

- 不改移动端调用方式。
- 不删除高德 provider。
- 不提交真实天地图 Key。
- 预发布同步脚本只同步地图相关变量，不覆盖数据库变量。
