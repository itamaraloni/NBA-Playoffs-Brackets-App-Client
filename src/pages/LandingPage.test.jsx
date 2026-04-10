import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import LandingPage from './LandingPage';
import { useAuth } from '../contexts/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../components/common/StandaloneHeader', () => () => <div>Header</div>);
jest.mock('../components/AppExplanation', () => () => <div>App explanation</div>);

const theme = createTheme();

function renderLandingPage() {
  return render(
    <ThemeProvider theme={theme}>
      <LandingPage />
    </ThemeProvider>
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resets the loading spinner when authError appears after an async rejection', async () => {
    let authState = {
      signInWithGoogle: jest.fn(() => new Promise(() => {})),
      isAuthenticated: false,
      error: null,
    };

    useAuth.mockImplementation(() => authState);

    const { rerender } = renderLandingPage();

    fireEvent.click(screen.getByRole('button', { name: /get started with google/i }));

    expect(authState.signInWithGoogle).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();

    authState = {
      ...authState,
      error: 'Sign in failed. Please try again.',
    };

    rerender(
      <ThemeProvider theme={theme}>
        <LandingPage />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /get started with google/i })).not.toBeDisabled();
    });
  });

  it('navigates to the dashboard only after auth state flips true', async () => {
    let authState = {
      signInWithGoogle: jest.fn(),
      isAuthenticated: false,
      error: null,
    };

    useAuth.mockImplementation(() => authState);

    const { rerender } = renderLandingPage();

    expect(mockNavigate).not.toHaveBeenCalled();

    authState = {
      ...authState,
      isAuthenticated: true,
    };

    rerender(
      <ThemeProvider theme={theme}>
        <LandingPage />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('does not render the app explanation on landing anymore', () => {
    useAuth.mockImplementation(() => ({
      signInWithGoogle: jest.fn(),
      isAuthenticated: false,
      error: null,
    }));

    renderLandingPage();

    expect(screen.queryByText('App explanation')).not.toBeInTheDocument();
  });
});
