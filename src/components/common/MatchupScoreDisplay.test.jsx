import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';

import MatchupScoreDisplay from './MatchupScoreDisplay';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

const theme = createTheme();

function renderMatchupScoreDisplay(props) {
  return render(
    <ThemeProvider theme={theme}>
      <MatchupScoreDisplay
        label="Final Score"
        homeTeam="Knicks"
        awayTeam="Pacers"
        homeScore={3}
        awayScore={4}
        round="second"
        showSeriesWinnerChip
        resultColor="success"
        {...props}
      />
    </ThemeProvider>
  );
}

describe('MatchupScoreDisplay', () => {
  beforeEach(() => {
    useMediaQuery.mockReturnValue(false);
  });

  it('shows a winner-oriented series score when the away team wins', () => {
    renderMatchupScoreDisplay();

    expect(screen.getByText('Pacers wins 4-3')).toBeInTheDocument();
  });
});
