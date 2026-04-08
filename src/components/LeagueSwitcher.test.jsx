import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';

import LeagueSwitcher from './LeagueSwitcher';
import { useAuth } from '../contexts/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const theme = createTheme();

function renderLeagueSwitcher() {
  return render(
    <ThemeProvider theme={theme}>
      <LeagueSwitcher />
    </ThemeProvider>
  );
}

describe('LeagueSwitcher', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('keeps the mobile switcher icon for single-league users so the title row stays compact', () => {
    useMediaQuery.mockReturnValue(true);
    useAuth.mockReturnValue({
      userPlayers: [
        {
          player_id: 'player-1',
          player_name: 'Itamar',
          league_name: 'Alpha League',
        },
      ],
      activePlayer: {
        player_id: 'player-1',
        player_name: 'Itamar',
        league_name: 'Alpha League',
      },
      switchActivePlayer: jest.fn(),
    });

    renderLeagueSwitcher();

    expect(screen.getByLabelText(/switch player or league/i)).toBeInTheDocument();
    expect(screen.queryByText('Itamar | Alpha League')).not.toBeInTheDocument();
  });
});
