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

  it('exposes a streaming endpoint without wrapping the event stream in the cool response envelope', () => {
    const source = fs.readFileSync(path.join(__dirname, 'support.ts'), 'utf8');

    expect(source).toContain("@Post('/chat/stream'");
    expect(source).toContain("'Content-Type', 'text/event-stream'");
    expect(source).toContain('this.ctx.body = stream');
    expect(source).not.toContain('this.ok(await this.appSupportAiService.streamChat');
  });
});
