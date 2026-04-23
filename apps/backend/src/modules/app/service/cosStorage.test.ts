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

  it('supports documented bucket + appId configuration when COS_BUCKET omits the appId suffix', () => {
    const config = resolveCosStorageConfig({
      COS_REGION: 'ap-shanghai',
      COS_BUCKET: 'car-platform',
      COS_APP_ID: '1250000000',
      COS_SECRET_ID: 'AKIDexample',
      COS_SECRET_KEY: 'secret-example',
    } as NodeJS.ProcessEnv);

    expect(config.enabled).toBe(true);
    expect(config.bucket).toBe('car-platform-1250000000');
    expect(config.missingKeys).toEqual([]);
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

  it('derives an allowed image content type when the client omits it', () => {
    const service = new AppCosStorageService();
    service.env = {
      COS_REGION: 'ap-shanghai',
      COS_BUCKET: 'car-platform',
      COS_APP_ID: '1250000000',
      COS_SECRET_ID: 'AKIDexample',
      COS_SECRET_KEY: 'secret-example',
    } as NodeJS.ProcessEnv;

    const ticket = service.createValuationPhotoUploadTicket({
      visitorKey: 'visitor-a',
      fileName: 'car.jpeg',
    });

    expect(ticket.headers).toEqual({
      'Content-Type': 'image/jpeg',
    });
    expect(ticket.uploadUrl).toContain('car-platform-1250000000.cos.ap-shanghai.myqcloud.com');
  });

  it('rejects non-image upload tickets before signing', () => {
    const service = new AppCosStorageService();
    service.env = {
      COS_REGION: 'ap-shanghai',
      COS_BUCKET: 'car-platform-1250000000',
      COS_SECRET_ID: 'AKIDexample',
      COS_SECRET_KEY: 'secret-example',
    } as NodeJS.ProcessEnv;

    expect(() =>
      service.createValuationPhotoUploadTicket({
        visitorKey: 'visitor-a',
        fileName: 'malware.exe',
        contentType: 'application/octet-stream',
      })
    ).toThrow('仅支持上传图片');
  });

  it('parses and rebuilds cos pointers consistently', () => {
    const pointer = buildCosObjectPointer('car-platform-dev/orders/demo/car.png');
    expect(pointer).toBe('cos://car-platform-dev/orders/demo/car.png');
    expect(parseCosObjectPointer(pointer)).toBe('car-platform-dev/orders/demo/car.png');
  });
});
