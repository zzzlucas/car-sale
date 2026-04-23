import { Body, Get, Inject, Param, Post, Provide } from '@midwayjs/core';
import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import type {
  ValuationOrderPayload,
  ValuationPhotoUploadTicketPayload,
} from '@car/shared-types';
import { AppOrderService } from '../../service/order';

@Provide()
@CoolUrlTag()
@CoolController('/app')
export class AppOrderController extends BaseController {
  @Inject()
  appOrderService: AppOrderService;

  @Inject()
  ctx;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/valuation-orders', { summary: '提交车辆估价与预约' })
  async create(@Body() body: ValuationOrderPayload) {
    return this.ok(await this.appOrderService.submit(body));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/valuation-orders/photos', { summary: '旧版上传入口（已停用）' })
  async uploadPhoto() {
    return this.ok(
      await this.appOrderService.uploadPhoto(this.ctx.files?.[0], this.ctx.origin)
    );
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/valuation-orders/photos/upload-ticket', { summary: '获取车辆照片直传 COS 票据' })
  async createUploadTicket(@Body() body: ValuationPhotoUploadTicketPayload) {
    return this.ok(this.appOrderService.createPhotoUploadTicket(body));
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
