import { Body, Inject, Post, Provide } from '@midwayjs/core';
import type { IMidwayKoaContext } from '@midwayjs/koa';
import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import type { SupportChatRequest } from '@car/shared-types';

import { AppSupportAiService } from '../../service/supportAi';

@Provide()
@CoolUrlTag()
@CoolController('/app/support')
export class AppSupportController extends BaseController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Inject()
  appSupportAiService: AppSupportAiService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/chat', { summary: '客服 AI 对话' })
  async chat(@Body() body: SupportChatRequest) {
    return this.ok(await this.appSupportAiService.chat(body));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/chat/stream', { summary: '客服 AI 流式对话' })
  async streamChat(@Body() body: SupportChatRequest) {
    const stream = this.appSupportAiService.streamChat(body);

    this.ctx.set('Content-Type', 'text/event-stream');
    this.ctx.set('Cache-Control', 'no-cache');
    this.ctx.set('Connection', 'keep-alive');
    this.ctx.set('X-Accel-Buffering', 'no');
    this.ctx.status = 200;
    this.ctx.body = stream;
  }
}
