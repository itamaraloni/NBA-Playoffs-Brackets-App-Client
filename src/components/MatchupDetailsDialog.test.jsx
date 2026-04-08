import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';

import MatchupDetailsDialog from './MatchupDetailsDialog';
import { useAuth } from '../contexts/AuthContext';

const mockMatchupScoreDisplay = jest.fn(() => <div>Matchup score</div>);

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('./common/MatchupTeamsDisplay', () => () => <div>Matchup teams</div>);
jest.mock('./common/MatchupScoreDisplay', () => (props) => mockMatchupScoreDisplay(props));
jest.mock('./MatchupPredictionsStats', () => () => <div>Prediction stats</div>);

const theme = createTheme();

function renderMatchupDetailsDialog(props) {
  return render(
    <ThemeProvider theme={theme}>
      <MatchupDetailsDialog
        open
        onClose={jest.fn()}
        matchup={{
          homeTeam: { name: 'Knicks' },
          awayTeam: { name: 'Pacers' },
          status: 'completed',
          actualHomeScore: 2,
          actualAwayScore: 4,
          round: 'second',
          predictionStats: {
            totalPredictions: 1,
            homeTeamWinCount: 0,
            awayTeamWinCount: 1,
            homeTeamWinPercentage: 0,
            awayTeamWinPercentage: 100,
          },
        }}
        leaguePredictions={[
          {
            userName: 'Dar',
            userAvatar: '1',
            homeScore: 2,
            awayScore: 4,
          },
        ]}
        {...props}
      />
    </ThemeProvider>
  );
}

describe('MatchupDetailsDialog', () => {
  beforeEach(() => {
    useMediaQuery.mockReturnValue(false);
    mockMatchupScoreDisplay.mockClear();
    useAuth.mockReturnValue({
      activePlayer: {
        player_name: 'Someone Else',
      },
    });
  });

  it('shows away-team picks with a winner-oriented series score', () => {
    renderMatchupDetailsDialog();

    expect(screen.getByText('Pacers 4-2')).toBeInTheDocument();
  });

  it('uses the winner chip for completed scores but not current scores', () => {
    renderMatchupDetailsDialog();

    expect(mockMatchupScoreDisplay).toHaveBeenCalled();
    expect(mockMatchupScoreDisplay.mock.calls[0][0].label).toBe('Final Score');
    expect(mockMatchupScoreDisplay.mock.calls[0][0].showSeriesWinnerChip).toBe(true);

    mockMatchupScoreDisplay.mockClear();

    renderMatchupDetailsDialog({
      matchup: {
        homeTeam: { name: 'Knicks' },
        awayTeam: { name: 'Pacers' },
        status: 'in-progress',
        actualHomeScore: 2,
        actualAwayScore: 1,
        round: 'second',
        predictionStats: null,
      },
      leaguePredictions: [],
    });

    expect(mockMatchupScoreDisplay).toHaveBeenCalled();
    expect(mockMatchupScoreDisplay.mock.calls[0][0].label).toBe('Current Score');
    expect(mockMatchupScoreDisplay.mock.calls[0][0].showSeriesWinnerChip).toBeUndefined();
  });
});
