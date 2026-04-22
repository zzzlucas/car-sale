import { Get, Inject, Provide } from '@midwayjs/core';
import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { AppContentService } from '../../service/content';

@Provide()
@CoolUrlTag()
@CoolController('/app/content')
export class AppContentController extends BaseController {
  @Inject()
  appContentService: AppContentService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/service-guide', { summary: '获取流程说明' })
  async serviceGuide() {
    return this.ok(await this.appContentService.serviceGuide());
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/faqs', { summary: '获取常见问题' })
  async faqs() {
    return this.ok(await this.appContentService.faqs());
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/support', { summary: '获取客服信息' })
  async support() {
    return this.ok(await this.appContentService.support());
  }
}
