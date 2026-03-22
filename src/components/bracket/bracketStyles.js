import { alpha } from '@mui/material/styles';

/**
 * Shared CSS-in-JS styles for bracket card highlighting and fade-in animation.
 * Spread into the container `sx` prop in both DesktopBracketGrid and MobileBracketScroll.
 */
export function getBracketAnimationSx(theme) {
  return {
    // Highlight styles applied via JS class toggling (no re-renders)
    '& .card-highlight > .MuiPaper-root': {
      borderColor: `${theme.palette.primary.main} !important`,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}, ${theme.shadows[4]} !important`,
    },
    '& .card-highlight-source > .MuiPaper-root': {
      borderColor: `${alpha(theme.palette.primary.main, 0.7)} !important`,
      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.25)} !important`,
    },
    // Card entry animation — staggered fade-in
    '@keyframes bracketFadeIn': {
      from: { opacity: 0, transform: 'translateY(6px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    '& [data-card-id]': {
      animation: 'bracketFadeIn 0.3s ease-out both',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '& [data-card-id]': { animation: 'none' },
    },
  };
}
