describe('backend local config prod import guard', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    jest.resetModules();

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('does not require local DB_PASSWORD when config.local is imported by prod bootstrap', () => {
    process.env.NODE_ENV = 'prod';

    jest.isolateModules(() => {
      jest.doMock('./localEnv', () => ({
        loadBackendLocalEnv: jest.fn(),
        requireBackendLocalEnv: jest.fn(() => {
          throw new Error('should not require local DB_PASSWORD in prod import');
        }),
      }));

      expect(() => {
        require('./config.local');
      }).not.toThrow();
    });
  });
});
