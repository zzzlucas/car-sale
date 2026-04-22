import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';

@Provide()
export class AppAuthService extends BaseService {
  async sendCode(phone: string) {
    return {
      phone,
      devCode: '123456',
      expiresIn: 300,
      message: '开发态验证码已生成',
    };
  }

  async login(phone: string, code: string) {
    return {
      token: `mobile-token-${phone}`,
      refreshToken: `mobile-refresh-${phone}`,
      expiresIn: 7200,
      user: {
        id: 'customer-demo-001',
        phone,
        role: 'customer',
      },
      debugVerified: code === '123456',
    };
  }
}
