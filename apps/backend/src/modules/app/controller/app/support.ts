import { Body, Inject, Post, Provide } from '@midwayjs/core';
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
  appSupportAiService: AppSupportAiService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/chat', { summary: '客服 AI 对话' })
  async chat(@Body() body: SupportChatRequest) {
    return this.ok(await this.appSupportAiService.chat(body));
  }
}
