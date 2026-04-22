import { Get, Inject, Provide } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { AppOperatorService } from '../../service/operator';

@Provide()
@CoolController('/operator')
export class OperatorDashboardController extends BaseController {
  @Inject()
  appOperatorService: AppOperatorService;

  @Get('/dashboard', { summary: '移动运营端首页摘要' })
  async dashboard() {
    return this.ok(await this.appOperatorService.dashboard());
  }
}
