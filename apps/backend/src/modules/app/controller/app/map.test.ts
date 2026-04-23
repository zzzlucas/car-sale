import * as fs from 'fs';
import * as path from 'path';

describe('AppMapController source contract', () => {
  it('exposes both address suggestions and reverse geocode routes', () => {
    const source = fs.readFileSync(path.join(__dirname, 'map.ts'), 'utf8');

    expect(source).toContain("@Get('/map/address-suggestions'");
    expect(source).toContain("@Get('/map/regeo'");
  });
});
