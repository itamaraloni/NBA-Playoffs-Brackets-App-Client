import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';

import BracketView from './BracketView';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

jest.mock('./DesktopBracketGrid', () => () => <div>Desktop bracket grid</div>);
jest.mock('./MobileBracketScroll', () => () => <div>Mobile bracket scroll</div>);

const theme = createTheme();

function renderBracketView(props) {
  return render(
    <ThemeProvider theme={theme}>
      <BracketView
        bracket={{}}
        isLocked
        predictedMatchups={12}
        totalMatchups={15}
        deadline="2026-04-12T00:00:00Z"
        onMatchupClick={jest.fn()}
        bracketHealth={{
          bullseyes: 3,
          hits: 2,
          misses: 1,
          pending: 4,
          pts: 10,
          totalPotential: 42,
        }}
        bonusPicks={null}
        scoringConfig={null}
        actionButtons={null}
        {...props}
      />
    </ThemeProvider>
  );
}

describe('BracketView', () => {
  it('shows a compact icon-only lock indicator in read mode when health stats are shown', () => {
    useMediaQuery.mockReturnValue(false);

    renderBracketView();

    expect(screen.getByRole('img', { name: /bracket locked/i })).toBeInTheDocument();
    expect(screen.queryByText(/bracket locked on/i)).not.toBeInTheDocument();
    expect(screen.getByText('10 / 42 pts')).toBeInTheDocument();
    expect(screen.getByText('Desktop bracket grid')).toBeInTheDocument();
  });
});
