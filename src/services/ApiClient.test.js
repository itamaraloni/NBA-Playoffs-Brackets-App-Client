describe('apiClient auth error handling', () => {
  let apiClient;
  let clearLocalStoragePreserveTheme;

  const buildUnauthorizedResponse = () => ({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    json: jest.fn().mockResolvedValue({
      message: 'Unauthorized',
      code: 'token_invalid',
    }),
  });

  beforeEach(() => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = 'http://example.com';
    clearLocalStoragePreserveTheme = jest.fn();

    jest.doMock('../utils/authStorage', () => ({
      clearLocalStoragePreserveTheme,
    }));

    jest.isolateModules(() => {
      apiClient = require('./ApiClient').default;
    });
  });

  afterEach(() => {
    jest.dontMock('../utils/authStorage');
    jest.restoreAllMocks();
    delete process.env.REACT_APP_API_URL;
  });

  it('throws without clearing local state when auth handling is suppressed', async () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    await expect(
      apiClient.handleResponse(buildUnauthorizedResponse(), { suppressAuthEvent: true })
    ).rejects.toMatchObject({
      status: 401,
      code: 'token_invalid',
      data: {
        message: 'Unauthorized',
        code: 'token_invalid',
      },
    });

    expect(clearLocalStoragePreserveTheme).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('clears local state and dispatches session-expired for standard 401s', async () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    await expect(
      apiClient.handleResponse(buildUnauthorizedResponse())
    ).resolves.toBeUndefined();

    expect(clearLocalStoragePreserveTheme).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy.mock.calls[0][0].type).toBe('auth:session-expired');
  });
});
