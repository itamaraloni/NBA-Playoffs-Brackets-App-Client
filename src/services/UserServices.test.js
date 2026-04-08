jest.mock('./ApiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

import apiClient from './ApiClient';
import UserServices from './UserServices';

describe('UserServices auth bootstrap helpers', () => {
  beforeEach(() => {
    apiClient.post.mockReset();
    apiClient.post.mockResolvedValue({});
  });

  it('suppresses the global auth event during session bootstrap checks', async () => {
    await UserServices.checkUserWithSession();

    expect(apiClient.post).toHaveBeenCalledWith(
      '/user/check',
      {},
      { suppressAuthEvent: true }
    );
  });
});
