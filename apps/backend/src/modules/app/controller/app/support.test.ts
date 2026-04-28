import * as fs from 'fs';
import * as path from 'path';

describe('AppSupportController source contract', () => {
  it('exposes the customer support AI chat endpoint without frontend supplier keys', () => {
    const source = fs.readFileSync(path.join(__dirname, 'support.ts'), 'utf8');

    expect(source).toContain("@CoolController('/app/support')");
    expect(source).toContain("@Post('/chat'");
    expect(source).toContain('TagTypes.IGNORE_TOKEN');
    expect(source).not.toContain('AI_SUPPORT_API_KEY');
  });
});
