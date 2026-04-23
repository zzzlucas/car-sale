import { BaseController, CoolController, CoolTag, CoolUrlTag, TagTypes } from '@cool-midway/core';
import { Get, Inject, Provide, Query } from '@midwayjs/core';

import { AppMapService } from '../../service/map';

@Provide()
@CoolUrlTag()
@CoolController('/app')
export class AppMapController extends BaseController {
  @Inject()
  appMapService: AppMapService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/map/address-suggestions', { summary: '搜索取车地址建议' })
  async addressSuggestions(@Query('keywords') keywords: string) {
    return this.ok(await this.appMapService.searchAddressSuggestions(keywords));
  }
}
