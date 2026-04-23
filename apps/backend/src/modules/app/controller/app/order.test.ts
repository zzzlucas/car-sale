import * as fs from 'fs';
import * as path from 'path';

describe('AppOrderController source contract', () => {
  it('does not expose the legacy local photo upload route anymore', () => {
    const source = fs.readFileSync(path.join(__dirname, 'order.ts'), 'utf8');

    expect(source).not.toContain("@Post('/valuation-orders/photos',");
    expect(source).not.toContain('async uploadPhoto()');
    expect(source).toContain("@Post('/valuation-orders/photos/upload-ticket'");
  });
});
