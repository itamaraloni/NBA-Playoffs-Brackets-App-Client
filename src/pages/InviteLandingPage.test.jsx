import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import InviteLandingPage from './InviteLandingPage';
import { useAuth } from '../contexts/AuthContext';
import LeagueServices from '../services/LeagueServices';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ token: 'invite-token-123' }),
}), { virtual: true });

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/LeagueServices', () => ({
  __esModule: true,
  default: {
    previewInvite: jest.fn(),
  },
}));

jest.mock('../components/common/StandaloneHeader', () => () => <div>Header</div>);

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('InviteLandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    LeagueServices.previewInvite.mockReset();
    LeagueServices.previewInvite.mockResolvedValue({
      leagueName: 'Invite League',
      playerCount: 2,
      leagueId: 'league-1',
    });

    window.notify = {
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('waits for signInWithGoogle to resolve before showing success feedback', async () => {
    const deferredSignIn = createDeferred();

    useAuth.mockImplementation(() => ({
      isAuthenticated: false,
      signInWithGoogle: jest.fn(() => deferredSignIn.promise),
      userPlayers: [],
      loading: false,
      logout: jest.fn(),
    }));

    render(<InviteLandingPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with google to join/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in with google to join/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    expect(window.notify.success).not.toHaveBeenCalled();

    await act(async () => {
      deferredSignIn.resolve();
      await deferredSignIn.promise;
    });

    await waitFor(() => {
      expect(window.notify.success).toHaveBeenCalledWith('Signed in successfully!');
    });

    expect(screen.getByRole('button', { name: /sign in with google to join/i })).toBeInTheDocument();
  });

  it('shows an error message and clears the spinner when sign-in fails', async () => {
    useAuth.mockImplementation(() => ({
      isAuthenticated: false,
      signInWithGoogle: jest.fn().mockRejectedValue(new Error('Popup closed')),
      userPlayers: [],
      loading: false,
      logout: jest.fn(),
    }));

    render(<InviteLandingPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with google to join/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in with google to join/i }));

    await waitFor(() => {
      expect(screen.getByText('Sign in failed. Please try again.')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /sign in with google to join/i })).not.toBeInTheDocument();
    expect(window.notify.success).not.toHaveBeenCalled();
  });
});
