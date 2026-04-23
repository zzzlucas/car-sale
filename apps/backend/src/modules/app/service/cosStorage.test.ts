import {
  buildCosObjectPointer,
  parseCosObjectPointer,
  resolveCosStorageConfig,
  AppCosStorageService,
} from './cosStorage';

describe('AppCosStorageService', () => {
  it('marks COS as disabled when required secrets are missing', () => {
    const config = resolveCosStorageConfig({
      COS_REGION: 'ap-shanghai',
      COS_BUCKET: 'car-platform-1250000000',
      COS_UPLOAD_PREFIX: 'car-platform-dev/',
    } as NodeJS.ProcessEnv);

    expect(config.enabled).toBe(false);
    expect(config.missingKeys).toEqual(['COS_SECRET_ID', 'COS_SECRET_KEY']);
    expect(config.uploadPrefix).toBe('car-platform-dev/');
  });

  it('builds a direct-upload ticket and object pointer under the configured prefix', () => {
    const service = new AppCosStorageService();
    service.env = {
      COS_REGION: 'ap-shanghai',
      COS_BUCKET: 'car-platform-1250000000',
      COS_SECRET_ID: 'AKIDexample',
      COS_SECRET_KEY: 'secret-example',
      COS_UPLOAD_PREFIX: 'car-platform-dev/',
      COS_SIGN_EXPIRES: '600',
    } as NodeJS.ProcessEnv;

    const ticket = service.createValuationPhotoUploadTicket({
      visitorKey: 'visitor-a',
      fileName: 'car.png',
      contentType: 'image/png',
    });

    expect(ticket.method).toBe('PUT');
    expect(ticket.objectPointer.startsWith('cos://car-platform-dev/visitors/visitor-a/valuation-orders/')).toBe(true);
    expect(ticket.uploadUrl).toContain('.cos.ap-shanghai.myqcloud.com/');
    expect(ticket.uploadUrl).toContain('q-signature=');
    expect(ticket.headers).toEqual({
      'Content-Type': 'image/png',
    });
  });

  it('parses and rebuilds cos pointers consistently', () => {
    const pointer = buildCosObjectPointer('car-platform-dev/orders/demo/car.png');
    expect(pointer).toBe('cos://car-platform-dev/orders/demo/car.png');
    expect(parseCosObjectPointer(pointer)).toBe('car-platform-dev/orders/demo/car.png');
  });
});
