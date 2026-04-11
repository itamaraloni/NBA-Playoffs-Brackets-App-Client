import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

function makePrediction(name) {
  return {
    userName: name,
    userAvatar: '1',
    homeScore: 4,
    awayScore: 2,
  };
}

function makePredictions(count) {
  return Array.from({ length: count }, (_, i) => makePrediction(`Player ${i + 1}`));
}

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

  describe('pagination', () => {
    const baseMatchup = {
      homeTeam: { name: 'Knicks' },
      awayTeam: { name: 'Pacers' },
      status: 'upcoming',
      actualHomeScore: 0,
      actualAwayScore: 0,
      round: 'first',
      predictionStats: null,
    };

    it('shows all predictions with no pagination when count is within one page', () => {
      renderMatchupDetailsDialog({
        matchup: baseMatchup,
        leaguePredictions: makePredictions(5),
      });

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(`Player ${i}`)).toBeInTheDocument();
      }
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('shows pagination controls when predictions exceed page size', () => {
      renderMatchupDetailsDialog({
        matchup: baseMatchup,
        leaguePredictions: makePredictions(11),
      });

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders only the first 10 predictions on page 1', () => {
      renderMatchupDetailsDialog({
        matchup: baseMatchup,
        leaguePredictions: makePredictions(11),
      });

      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 10')).toBeInTheDocument();
      expect(screen.queryByText('Player 11')).not.toBeInTheDocument();
    });

    it('shows the next page of predictions after navigating forward', () => {
      renderMatchupDetailsDialog({
        matchup: baseMatchup,
        leaguePredictions: makePredictions(11),
      });

      fireEvent.click(screen.getByRole('button', { name: /go to page 2/i }));

      expect(screen.getByText('Player 11')).toBeInTheDocument();
      expect(screen.queryByText('Player 1')).not.toBeInTheDocument();
    });
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
