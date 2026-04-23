import * as fs from 'fs';
import * as path from 'path';

describe('backend cross-domain wiring', () => {
  it('enables the Midway cross-domain component for browser clients', () => {
    const source = fs.readFileSync(path.join(__dirname, 'configuration.ts'), 'utf8');

    expect(source).toMatch(
      /^\s*import \* as crossDomain from '@midwayjs\/cross-domain';$/m
    );
    expect(source).toMatch(/^\s*crossDomain,\s*$/m);
  });
});
