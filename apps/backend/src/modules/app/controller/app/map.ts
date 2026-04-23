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

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/map/regeo', { summary: '根据经纬度解析中文地址' })
  async reverseGeocode(
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number
  ) {
    return this.ok(await this.appMapService.reverseGeocode(Number(longitude), Number(latitude)));
  }
}
