import { Body, Inject, Post, Provide } from '@midwayjs/core';
import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { AppAuthService } from '../../service/auth';

@Provide()
@CoolUrlTag()
@CoolController('/auth/mobile')
export class AppAuthController extends BaseController {
  @Inject()
  appAuthService: AppAuthService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/send-code', { summary: '发送手机号验证码（开发态）' })
  async sendCode(@Body('phone') phone: string) {
    return this.ok(await this.appAuthService.sendCode(phone));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/login', { summary: '手机号验证码登录（开发态）' })
  async login(@Body('phone') phone: string, @Body('code') code: string) {
    return this.ok(await this.appAuthService.login(phone, code));
  }
}
