import React, { useRef, useCallback } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BracketMatchup from './BracketMatchup';
import BonusPicks from './BonusPicks';

// R1 display order: top half (1v8 + 4v5) → bottom half (3v6 + 2v7)
const R1_DISPLAY_ORDER = [1, 4, 3, 2];

/**
 * HoverCard — wrapper for bracket cards with hover handlers + staggered animation delay.
 * Defined outside DesktopBracketGrid so its component identity is stable across re-renders,
 * preventing React from unmounting/remounting cards and restarting the entry animation.
 */
function HoverCard({ children, delay, onHoverStart, onHoverEnd, ...props }) {
  return (
    <Box
      {...props}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={delay != null ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Box>
  );
}

function reorderR1(matchups) {
  if (!matchups || matchups.length !== 4) return matchups || [];
  return R1_DISPLAY_ORDER.map(pos => matchups.find(m => m.matchup_position === pos)).filter(Boolean);
}

/**
 * Connector — renders the bracket lines between two rounds.
 * Top/bottom horizontal stubs, vertical bar, and an output line.
 * `mirrored` flips for the Eastern conference (lines from right).
 */
function Connector({ gridColumn, gridRow, mirrored, connId }) {
  const theme = useTheme();
  const connColor = alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.5 : 0.4);
  const w = 2;

  const base = { position: 'absolute', borderColor: connColor };
  const leftOrRight = mirrored ? { right: 0 } : { left: 0 };
  const vertSide = mirrored ? { right: '50%' } : { left: '50%' };
  const outSide = mirrored ? { right: '50%' } : { left: '50%' };

  return (
    <Box
      data-conn-id={connId}
      sx={{
        gridColumn, gridRow,
        position: 'relative', alignSelf: 'stretch',
        // Highlight state toggled by JS class
        '&.conn--highlight .conn-line': {
          borderColor: alpha(theme.palette.primary.main, 0.7),
        },
      }}
    >
      <Box className="conn-line" sx={{ ...base, top: '25%', width: '50%', borderTopWidth: w, borderTopStyle: 'solid', ...leftOrRight }} />
      <Box className="conn-line" sx={{ ...base, top: '75%', width: '50%', borderTopWidth: w, borderTopStyle: 'solid', ...leftOrRight }} />
      <Box className="conn-line" sx={{ ...base, top: '25%', height: '50%', borderLeftWidth: w, borderLeftStyle: 'solid', ...vertSide }} />
      <Box className="conn-line" sx={{ ...base, top: '50%', width: '50%', borderTopWidth: w, borderTopStyle: 'solid', ...outSide }} />
    </Box>
  );
}

/**
 * RoundHeader — pill-shaped label with point value for a round.
 */
function RoundHeader({ label, pts, variant, gridColumn }) {
  const theme = useTheme();

  const styles = {
    playin: {
      background: alpha(theme.palette.warning.main, 0.06),
      border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
      color: theme.palette.warning.light,
    },
    finals: {
      background: alpha(theme.palette.warning.main, 0.08),
      border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
      color: theme.palette.warning.light,
    },
    semis: {
      background: alpha(theme.palette.primary.main, 0.06),
      border: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.secondary,
    },
    cf: {
      background: alpha(theme.palette.primary.main, 0.1),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      color: theme.palette.text.secondary,
    },
    default: {
      background: theme.palette.action.hover,
      border: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.secondary,
    },
  };

  const s = styles[variant] || styles.default;

  return (
    <Box sx={{
      gridColumn, gridRow: 2, alignSelf: 'end',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '8px', px: 1, py: '5px', mx: '2px', mb: '6px',
      gap: '6px', whiteSpace: 'nowrap',
      ...s,
    }}>
      <Typography sx={{
        fontSize: '0.6875rem', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </Typography>
      {pts != null && (
        <Typography sx={{
          fontSize: '0.625rem', fontWeight: 800, opacity: 0.7,
        }}>
          {pts}pts
        </Typography>
      )}
    </Box>
  );
}

/**
 * CardCell — wraps a BracketMatchup in a grid cell with hover highlight data attributes.
 */
function CardCell({ matchup, gridColumn, gridRow, alignSelf, isLocked, isFinals, onMatchupClick, cardId, feeds }) {
  return (
    <Box
      data-card-id={cardId}
      data-feeds={feeds?.join(',') || ''}
      sx={{ gridColumn, gridRow, px: '2px', alignSelf: alignSelf || 'center' }}
    >
      <BracketMatchup
        matchup={matchup}
        isLocked={isLocked}
        isFinals={isFinals}
        onMatchupClick={onMatchupClick}
      />
    </Box>
  );
}

/**
 * DesktopBracketGrid — CSS Grid bracket layout matching the desktop prototype.
 *
 * 15-column, 9-row grid: West play-in | West R1-Semis-CF | Finals | East CF-Semis-R1 | East play-in
 * Includes connector lines and hover path highlighting.
 */
const DesktopBracketGrid = ({ bracket, isLocked, onMatchupClick, bonusPicks, scoringConfig }) => {
  const theme = useTheme();
  const gridRef = useRef(null);

  // --- Hover highlighting ---
  const highlightPath = useCallback((cardEl) => {
    if (!gridRef.current) return;
    const feedsStr = cardEl.getAttribute('data-feeds');
    if (!feedsStr) return;
    const feedIds = feedsStr.split(',').filter(Boolean);

    cardEl.classList.add('card-highlight');
    for (const fid of feedIds) {
      const feedCard = gridRef.current.querySelector(`[data-card-id="${fid}"]`);
      if (feedCard) feedCard.classList.add('card-highlight-source');
      const conn = gridRef.current.querySelector(`[data-conn-id="${fid}"]`);
      if (conn) conn.classList.add('conn--highlight');
    }
  }, []);

  const clearHighlight = useCallback(() => {
    if (!gridRef.current) return;
    gridRef.current.querySelectorAll('.card-highlight').forEach(el => el.classList.remove('card-highlight'));
    gridRef.current.querySelectorAll('.card-highlight-source').forEach(el => el.classList.remove('card-highlight-source'));
    gridRef.current.querySelectorAll('.conn--highlight').forEach(el => el.classList.remove('conn--highlight'));
  }, []);

  const handleMouseEnter = useCallback((e) => {
    const cardEl = e.currentTarget;
    highlightPath(cardEl);
  }, [highlightPath]);

  const handleMouseLeave = useCallback(() => {
    clearHighlight();
  }, [clearHighlight]);

  // --- Data ---
  const west = bracket.west || {};
  const east = bracket.east || {};
  const westR1 = reorderR1(west.r1);
  const eastR1 = reorderR1(east.r1);
  const westSemis = (west.semis || []).sort((a, b) => a.matchup_position - b.matchup_position);
  const eastSemis = (east.semis || []).sort((a, b) => a.matchup_position - b.matchup_position);
  const westCf = (west.cf || [])[0];
  const eastCf = (east.cf || [])[0];
  // Play-in: reverse so 9v10 (pos 2) renders above 7v8 (pos 1),
  // aligning 7v8 with the bottom R1 slot its winner feeds into.
  const westPlayin = [...(west.playin || [])].reverse();
  const westSurvivor = (west.survivor || [])[0];
  const eastPlayin = [...(east.playin || [])].reverse();
  const eastSurvivor = (east.survivor || [])[0];

  // Scoring config for round header pts — show "hit/bullseye" for playoff rounds
  const sc = scoringConfig || {};
  const fmtPts = (round) => {
    const r = sc[round];
    if (!r) return null;
    return r.bullseye ? `${r.hit}/${r.bullseye}` : `${r.hit}`;
  };
  const piPts = fmtPts('playin_first');
  const r1Pts = fmtPts('first');
  const semiPts = fmtPts('second');
  const cfPts = fmtPts('conference_final');
  const finalPts = fmtPts('final');

  // Card animation stagger counter — increments per card for cascading fade-in
  let cardIdx = 0;

  return (
    <Box
      ref={gridRef}
      sx={{
        display: 'grid',
        gridTemplateColumns:
          'minmax(140px,180px) 10px minmax(150px,1fr) 16px minmax(150px,1fr) 16px minmax(150px,1fr) minmax(160px,200px) minmax(150px,1fr) 16px minmax(150px,1fr) 16px minmax(150px,1fr) 10px minmax(140px,180px)',
        gridTemplateRows:
          'auto auto 1fr 10px 1fr 20px 1fr 10px 1fr',
        minHeight: 520,
        alignItems: 'center',
        // Highlight styles applied via JS class toggling (no re-renders)
        '& .card-highlight > .MuiPaper-root': {
          borderColor: `${theme.palette.primary.main} !important`,
          boxShadow: `0 0 0 1px ${theme.palette.primary.main}, ${theme.shadows[4]} !important`,
        },
        '& .card-highlight-source > .MuiPaper-root': {
          borderColor: `${alpha(theme.palette.primary.main, 0.7)} !important`,
          boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.25)} !important`,
        },
        // Card entry animation — stagger fade-in
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
      }}
    >
      {/* ════ Row 1: Conference Titles ════ */}
      <Box sx={{
        gridColumn: '1 / 8', gridRow: 1,
        fontSize: '0.75rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        color: theme.palette.primary.main, textAlign: 'center',
        pb: '6px', mb: '8px',
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      }}>
        Western Conference
      </Box>

      <Box sx={{
        gridColumn: 8, gridRow: 1,
        textAlign: 'center', pb: '6px', mb: '8px',
      }} />

      <Box sx={{
        gridColumn: '9 / 16', gridRow: 1,
        fontSize: '0.75rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        color: theme.palette.primary.main, textAlign: 'center',
        pb: '6px', mb: '8px',
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      }}>
        Eastern Conference
      </Box>

      {/* ════ Row 2: Round Headers ════ */}
      <RoundHeader label="Play-In" pts={piPts} variant="playin" gridColumn={1} />
      <RoundHeader label="Round 1" pts={r1Pts} variant="default" gridColumn={3} />
      <RoundHeader label="Semis" pts={semiPts} variant="semis" gridColumn={5} />
      <RoundHeader label="Conf Finals" pts={cfPts} variant="cf" gridColumn={7} />
      <RoundHeader label="Finals" pts={finalPts} variant="finals" gridColumn={8} />
      <RoundHeader label="Conf Finals" pts={cfPts} variant="cf" gridColumn={9} />
      <RoundHeader label="Semis" pts={semiPts} variant="semis" gridColumn={11} />
      <RoundHeader label="Round 1" pts={r1Pts} variant="default" gridColumn={13} />
      <RoundHeader label="Play-In" pts={piPts} variant="playin" gridColumn={15} />

      {/* ════ Separators (dashed dividers) ════ */}
      <Box sx={{
        gridColumn: 2, gridRow: '2 / 10', alignSelf: 'stretch', position: 'relative',
        '&::after': {
          content: '""', position: 'absolute',
          top: '15%', bottom: '15%', left: '50%',
          borderLeft: `1px dashed ${theme.palette.divider}`,
        },
      }} />
      <Box sx={{
        gridColumn: 14, gridRow: '2 / 10', alignSelf: 'stretch', position: 'relative',
        '&::after': {
          content: '""', position: 'absolute',
          top: '15%', bottom: '15%', left: '50%',
          borderLeft: `1px dashed ${theme.palette.divider}`,
        },
      }} />

      {/* ════ West Play-In (stacked column) ════ */}
      <Box sx={{
        gridColumn: 1, gridRow: '3 / 10',
        alignSelf: 'stretch',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'stretch',
        gap: '8px', px: '2px', py: '4px',
      }}>
        {westSurvivor && (
          <>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.palette.text.disabled, textAlign: 'center' }}>
              Survivor
            </Typography>
            <HoverCard data-card-id="w-surv" data-feeds="w-pi-1,w-pi-2" delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}>
              <BracketMatchup matchup={westSurvivor} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
            </HoverCard>
          </>
        )}
        {westPlayin.map((m) => (
          <React.Fragment key={m.matchup_position}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.palette.text.disabled, textAlign: 'center' }}>
              {m.matchup_position === 1 ? '#7 vs #8' : '#9 vs #10'}
            </Typography>
            <HoverCard data-card-id={`w-pi-${m.matchup_position}`} data-feeds="" delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}>
              <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
            </HoverCard>
          </React.Fragment>
        ))}
      </Box>

      {/* ════ West R1 Cards ════ */}
      {westR1.map((m, i) => {
        const rows = [3, 5, 7, 9];
        const feedMap = { 1: 'w-surv', 2: 'w-pi-1', 3: '', 4: '' };
        const feeds = feedMap[m.matchup_position] ? [feedMap[m.matchup_position]] : [];
        return (
          <HoverCard
            key={m.matchup_position}
            data-card-id={`w-r1-${m.matchup_position}`}
            data-feeds={feeds.join(',')}
            delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}
            sx={{ gridColumn: 3, gridRow: rows[i], px: '2px' }}
          >
            <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
          </HoverCard>
        );
      })}

      {/* ════ West Connectors R1→Semis ════ */}
      <Connector gridColumn={4} gridRow="3 / 6" connId="w-c1-top" />
      <Connector gridColumn={4} gridRow="7 / 10" connId="w-c1-bot" />

      {/* ════ West Semis ════ */}
      {westSemis[0] && (
        <HoverCard
          data-card-id="w-s1"
          data-feeds="w-r1-1,w-r1-4,w-c1-top"
          delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}
          sx={{ gridColumn: 5, gridRow: '3 / 6', px: '2px', alignSelf: 'center' }}
        >
          <BracketMatchup matchup={westSemis[0]} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
        </HoverCard>
      )}
      {westSemis[1] && (
        <HoverCard
          data-card-id="w-s2"
          data-feeds="w-r1-3,w-r1-2,w-c1-bot"
          delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}
          sx={{ gridColumn: 5, gridRow: '7 / 10', px: '2px', alignSelf: 'center' }}
        >
          <BracketMatchup matchup={westSemis[1]} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
        </HoverCard>
      )}

      {/* ════ West Connector Semis→CF ════ */}
      <Connector gridColumn={6} gridRow="3 / 10" connId="w-c2" />

      {/* ════ West Conf Finals ════ */}
      {westCf && (
        <HoverCard
          data-card-id="w-cf"
          data-feeds="w-s1,w-s2,w-c2"
          delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}
          sx={{ gridColumn: 7, gridRow: '3 / 10', px: '2px', alignSelf: 'center' }}
        >
          <BracketMatchup matchup={westCf} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
        </HoverCard>
      )}

      {/* ════ Finals Center Column ════ */}
      <Box sx={{
        gridColumn: 8, gridRow: '3 / 10',
        alignSelf: 'center', px: '4px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.15)} 0%, transparent 70%)`,
          mb: '4px',
        }}>
          <Typography sx={{
            fontSize: 36, lineHeight: 1,
            filter: `drop-shadow(0 0 12px ${alpha(theme.palette.warning.main, 0.6)})`,
          }}>
            {'\uD83C\uDFC6'}
          </Typography>
        </Box>
        <Typography sx={{
          fontSize: '0.625rem', fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          color: theme.palette.warning.light, mb: 1,
        }}>
          NBA Finals
        </Typography>
        <Box sx={{ width: '100%' }}>
          <BracketMatchup matchup={bracket.final} isLocked={isLocked} isFinals onMatchupClick={onMatchupClick} compact />
        </Box>
        {bonusPicks && (
          <Box sx={{ width: '100%', mt: '16px' }}>
            <BonusPicks {...bonusPicks} isLocked={isLocked} />
          </Box>
        )}
      </Box>

      {/* ════ East Conf Finals ════ */}
      {eastCf && (
        <HoverCard
          data-card-id="e-cf"
          data-feeds="e-s1,e-s2,e-c2"
          delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}
          sx={{ gridColumn: 9, gridRow: '3 / 10', px: '2px', alignSelf: 'center' }}
        >
          <BracketMatchup matchup={eastCf} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
        </HoverCard>
      )}

      {/* ════ East Connector Semis→CF ════ */}
      <Connector gridColumn={10} gridRow="3 / 10" mirrored connId="e-c2" />

      {/* ════ East Semis ════ */}
      {eastSemis[0] && (
        <HoverCard
          data-card-id="e-s1"
          data-feeds="e-r1-1,e-r1-4,e-c1-top"
          delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}
          sx={{ gridColumn: 11, gridRow: '3 / 6', px: '2px', alignSelf: 'center' }}
        >
          <BracketMatchup matchup={eastSemis[0]} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
        </HoverCard>
      )}
      {eastSemis[1] && (
        <HoverCard
          data-card-id="e-s2"
          data-feeds="e-r1-3,e-r1-2,e-c1-bot"
          delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}
          sx={{ gridColumn: 11, gridRow: '7 / 10', px: '2px', alignSelf: 'center' }}
        >
          <BracketMatchup matchup={eastSemis[1]} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
        </HoverCard>
      )}

      {/* ════ East Connectors R1→Semis ════ */}
      <Connector gridColumn={12} gridRow="3 / 6" mirrored connId="e-c1-top" />
      <Connector gridColumn={12} gridRow="7 / 10" mirrored connId="e-c1-bot" />

      {/* ════ East R1 Cards ════ */}
      {eastR1.map((m, i) => {
        const rows = [3, 5, 7, 9];
        const feedMap = { 1: 'e-surv', 2: 'e-pi-1', 3: '', 4: '' };
        const feeds = feedMap[m.matchup_position] ? [feedMap[m.matchup_position]] : [];
        return (
          <HoverCard
            key={m.matchup_position}
            data-card-id={`e-r1-${m.matchup_position}`}
            data-feeds={feeds.join(',')}
            delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}
            sx={{ gridColumn: 13, gridRow: rows[i], px: '2px' }}
          >
            <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
          </HoverCard>
        );
      })}

      {/* ════ East Play-In (stacked column) ════ */}
      <Box sx={{
        gridColumn: 15, gridRow: '3 / 10',
        alignSelf: 'stretch',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'stretch',
        gap: '8px', px: '2px', py: '4px',
      }}>
        {eastSurvivor && (
          <>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.palette.text.disabled, textAlign: 'center' }}>
              Survivor
            </Typography>
            <HoverCard data-card-id="e-surv" data-feeds="e-pi-1,e-pi-2" delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}>
              <BracketMatchup matchup={eastSurvivor} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
            </HoverCard>
          </>
        )}
        {eastPlayin.map((m) => (
          <React.Fragment key={m.matchup_position}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.palette.text.disabled, textAlign: 'center' }}>
              {m.matchup_position === 1 ? '#7 vs #8' : '#9 vs #10'}
            </Typography>
            <HoverCard data-card-id={`e-pi-${m.matchup_position}`} data-feeds="" delay={cardIdx++ * 40} onHoverStart={handleMouseEnter} onHoverEnd={handleMouseLeave}>
              <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} compact />
            </HoverCard>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default DesktopBracketGrid;
