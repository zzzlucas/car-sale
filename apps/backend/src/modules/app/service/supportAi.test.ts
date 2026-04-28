import axios from 'axios';
import { Readable } from 'stream';

import { AppSupportAiService } from './supportAi';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

async function collectStream(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  return Buffer.concat(chunks).toString('utf8');
}

function createService(env: NodeJS.ProcessEnv = {}) {
  const service = new AppSupportAiService() as any;
  service.env = {
    AI_SUPPORT_BASE_URL: 'https://api.siliconflow.cn/v1',
    AI_SUPPORT_API_KEYS: 'key-a,key-b',
    AI_SUPPORT_MODEL: 'deepseek-ai/DeepSeek-V3.2',
    AI_SUPPORT_TIMEOUT_MS: '3000',
    ...env,
  } as NodeJS.ProcessEnv;
  return service as AppSupportAiService;
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('AppSupportAiService', () => {
  it('streams support chat deltas and a final response through the backend proxy', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: Readable.from([
        'data: {"choices":[{"delta":{"content":"可以先"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"提交车辆信息"}}]}\n\n',
        'data: [DONE]\n\n',
      ]),
      headers: { 'x-request-id': 'trace-stream-1' },
    } as any);

    const service = createService();
    const stream = service.streamChat({
      scene: 'customer_support',
      userMessage: '报废流程怎么走？',
      turnCount: 1,
      history: [{ role: 'user', content: '报废流程怎么走？' }],
    });
    const output = await collectStream(stream);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.siliconflow.cn/v1/chat/completions',
      expect.objectContaining({
        model: 'deepseek-ai/DeepSeek-V3.2',
        stream: true,
      }),
      expect.objectContaining({
        responseType: 'stream',
        timeout: 3000,
      })
    );
    expect(output).toContain('"type":"meta"');
    expect(output).toContain('"type":"delta","content":"可以先"');
    expect(output).toContain('"type":"delta","content":"提交车辆信息"');
    expect(output).toContain('"type":"done"');
    expect(output).toContain('"reply":"可以先提交车辆信息"');
    expect(output).toContain('"traceId":"trace-stream-1"');
  });

  it('calls the shared-provider style chat completion endpoint through backend config', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: '可以先提交车辆信息，客服会联系确认。' } }],
        usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 },
      },
      headers: { 'x-request-id': 'trace-1' },
    } as any);

    const service = createService();
    const result = await service.chat({
      scene: 'customer_support',
      userMessage: '报废流程怎么走？',
      turnCount: 1,
      history: [{ role: 'user', content: '报废流程怎么走？' }],
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.siliconflow.cn/v1/chat/completions',
      expect.objectContaining({
        model: 'deepseek-ai/DeepSeek-V3.2',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          { role: 'user', content: '报废流程怎么走？' },
        ]),
        temperature: 0.2,
        stream: false,
      }),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer key-a' }),
        timeout: 3000,
      })
    );
    expect(result.reply).toBe('可以先提交车辆信息，客服会联系确认。');
    expect(result.traceId).toBe('trace-1');
    expect(result.model).toBe('deepseek-ai/DeepSeek-V3.2');
    expect(result.usage).toEqual({ promptTokens: 12, completionTokens: 8, totalTokens: 20 });
    expect(result.escalation.showInlineProfessionalContact).toBe(true);
  });

  it('falls back to professional support when provider config or request fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('network down'));

    const service = createService();
    const result = await service.chat({
      userMessage: '我要人工客服',
      turnCount: 4,
      history: [{ role: 'user', content: '我要人工客服' }],
    });

    expect(result.reply).toContain('当前智能答复暂时不可用');
    expect(result.escalation.showInlineProfessionalContact).toBe(true);
    expect(result.escalation.showLargeProfessionalContact).toBe(true);
    expect(result.escalation.reason).toBe('requested_professional_support');
  });
});
