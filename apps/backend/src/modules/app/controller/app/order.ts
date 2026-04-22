import { Body, Get, Inject, Param, Post, Provide } from '@midwayjs/core';
import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';

import type { ValuationOrderPayload } from '@car/shared-types';
import { AppOrderService } from '../../service/order';

@Provide()
@CoolUrlTag()
@CoolController('/app')
export class AppOrderController extends BaseController {
  @Inject()
  appOrderService: AppOrderService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/valuation-orders', { summary: '提交车辆估价与预约' })
  async create(@Body() body: ValuationOrderPayload) {
    return this.ok(await this.appOrderService.submit(body));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/valuation-orders/:id', { summary: '获取订单详情' })
  async detail(@Param('id') id: string) {
    return this.ok(await this.appOrderService.detail(id));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/valuation-orders/:id/progress', { summary: '获取订单进度' })
  async progress(@Param('id') id: string) {
    return this.ok(await this.appOrderService.progress(id));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/me/valuation-orders', { summary: '获取我的预约列表' })
  async myOrders() {
    return this.ok(await this.appOrderService.myOrders());
  }
}
