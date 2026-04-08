import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AuthProvider, useAuth } from './AuthContext';
import UserServices from '../services/UserServices';
import {
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';

jest.mock('../firebase', () => ({
  auth: {},
}));

jest.mock('../services/UserServices', () => ({
  __esModule: true,
  default: {
    syncUserWithDatabase: jest.fn(),
    checkUserWithSession: jest.fn(),
    getUserLeagues: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {
    setCustomParameters = jest.fn();
  },
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

let authStateListener;

function AuthProbe() {
  const {
    signInWithGoogle,
    isAuthenticated,
    error,
    userPlayers,
    activePlayer,
    loading,
  } = useAuth();
  const [signInStatus, setSignInStatus] = useState('idle');

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setSignInStatus('resolved');
    } catch (err) {
      setSignInStatus(`rejected:${err.message}`);
    }
  };

  return (
    <div>
      <button onClick={handleSignIn}>Sign In</button>
      <div data-testid="sign-in-status">{signInStatus}</div>
      <div data-testid="is-authenticated">{String(isAuthenticated)}</div>
      <div data-testid="error">{error || ''}</div>
      <div data-testid="player-count">{String(userPlayers.length)}</div>
      <div data-testid="active-player">{activePlayer?.player_id || ''}</div>
      <div data-testid="loading">{String(loading)}</div>
    </div>
  );
}

const fakeUser = {
  uid: 'firebase-user-1',
  email: 'test@example.com',
  getIdToken: jest.fn(),
};

const leagueData = {
  players: [
    {
      player_id: 'player-1',
      league_name: 'League One',
    },
  ],
};

async function renderAuthProvider() {
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );

  await waitFor(() => expect(onAuthStateChanged).toHaveBeenCalledTimes(1));
  await act(async () => {
    await authStateListener(null);
  });
}

describe('AuthContext', () => {
  beforeEach(() => {
    authStateListener = null;

    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateListener = callback;
      return jest.fn();
    });

    signInWithPopup.mockReset();
    signInWithPopup.mockResolvedValue({ user: fakeUser });

    UserServices.syncUserWithDatabase.mockReset();
    UserServices.syncUserWithDatabase.mockResolvedValue({
      is_admin: false,
      isNewUser: false,
    });

    UserServices.checkUserWithSession.mockReset();
    UserServices.checkUserWithSession.mockResolvedValue(null);

    UserServices.getUserLeagues.mockReset();
    UserServices.getUserLeagues.mockResolvedValue(leagueData);

    UserServices.logout.mockReset();

    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'csrf_token=; path=/; max-age=0';
    window.notify = {
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps signInWithGoogle pending until auth sync and league fetch complete', async () => {
    await renderAuthProvider();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(signInWithPopup).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('sign-in-status')).toHaveTextContent('idle');

    await act(async () => {
      await authStateListener(fakeUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-status')).toHaveTextContent('resolved');
    });

    expect(UserServices.syncUserWithDatabase).toHaveBeenCalledWith(fakeUser, 0);
    expect(UserServices.getUserLeagues).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('player-count')).toHaveTextContent('1');
    expect(screen.getByTestId('active-player')).toHaveTextContent('player-1');
  });

  it('rejects the interactive sign-in when the server rejects auth sync', async () => {
    UserServices.syncUserWithDatabase.mockRejectedValue({
      status: 401,
      code: 'token_invalid',
      message: 'Server rejected auth',
    });

    await renderAuthProvider();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await act(async () => {
      await authStateListener(fakeUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-status')).toHaveTextContent('rejected:Server rejected auth');
    });

    expect(UserServices.getUserLeagues).not.toHaveBeenCalled();
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('Server rejected auth');
  });

  it('retries the first immediate post-login 401 before authenticating the user', async () => {
    const unauthorizedError = Object.assign(new Error('Unauthorized'), { status: 401 });
    UserServices.getUserLeagues
      .mockRejectedValueOnce(unauthorizedError)
      .mockResolvedValueOnce(leagueData);

    const realSetTimeout = global.setTimeout;
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay, ...args) => {
      if (delay === 200) {
        callback(...args);
        return 0;
      }
      return realSetTimeout(callback, delay, ...args);
    });
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    await renderAuthProvider();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await act(async () => {
      await authStateListener(fakeUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-status')).toHaveTextContent('resolved');
    });

    expect(UserServices.getUserLeagues).toHaveBeenCalledTimes(2);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 200);
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('dispatches session-expired and stays unauthenticated after a second 401', async () => {
    const unauthorizedError = Object.assign(new Error('Unauthorized'), { status: 401 });
    UserServices.getUserLeagues
      .mockRejectedValueOnce(unauthorizedError)
      .mockRejectedValueOnce(unauthorizedError);

    const realSetTimeout = global.setTimeout;
    jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay, ...args) => {
      if (delay === 200) {
        callback(...args);
        return 0;
      }
      return realSetTimeout(callback, delay, ...args);
    });
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);

    await renderAuthProvider();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await act(async () => {
      await authStateListener(fakeUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sign-in-status')).toHaveTextContent('rejected:Unauthorized');
    });

    expect(UserServices.getUserLeagues).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy.mock.calls[0][0].type).toBe('auth:session-expired');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });
});
