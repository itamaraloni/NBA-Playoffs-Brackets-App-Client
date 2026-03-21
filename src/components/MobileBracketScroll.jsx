import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Collapse, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BracketMatchup from './BracketMatchup';
import BonusPicks from './BonusPicks';

// R1 display order matching bracket topology
const R1_DISPLAY_ORDER = [1, 4, 3, 2];

function reorderR1(matchups) {
  if (!matchups || matchups.length !== 4) return matchups || [];
  return R1_DISPLAY_ORDER.map(pos => matchups.find(m => m.matchup_position === pos)).filter(Boolean);
}

/**
 * Divider line with centered text (e.g., "→ Semi-Final 1")
 */
function FlowLabel({ text, accent }) {
  const theme = useTheme();
  const lineColor = accent
    ? alpha(theme.palette.warning.main, 0.3)
    : alpha(theme.palette.text.primary, 0.35);
  const textColor = accent ? theme.palette.warning.main : theme.palette.text.secondary;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: '4px', my: '2px' }}>
      <Box sx={{ flex: 1, height: '1px', background: lineColor }} />
      <Typography sx={{
        fontSize: '0.625rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        whiteSpace: 'nowrap', color: textColor,
      }}>
        {text}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', background: lineColor }} />
    </Box>
  );
}

/**
 * Collapsible conference section within a round column.
 */
function ConferenceSection({ title, children, defaultExpanded = true }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setExpanded(prev => !prev)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0.5, cursor: 'pointer', userSelect: 'none',
          fontSize: '0.625rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: theme.palette.primary.main, textAlign: 'center',
          py: '6px', mb: 1,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
        }}
      >
        {title}
        <ExpandMoreIcon sx={{
          fontSize: 16,
          transition: 'transform 0.25s ease',
          transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
        }} />
      </Box>
      <Collapse in={expanded}>
        {children}
      </Collapse>
    </Box>
  );
}

/**
 * Play-in section with fork connector showing Survivor → PI-1/PI-2 relationship.
 */
function PlayinSection({ survivor, playinGames, isLocked, onMatchupClick }) {
  const theme = useTheme();
  const connColor = alpha(theme.palette.warning.main, 0.4);

  return (
    <Box>
      {/* Survivor card on top */}
      {survivor && (
        <Box sx={{ mb: '4px' }}>
          <BracketMatchup matchup={survivor} isLocked={isLocked} onMatchupClick={onMatchupClick} />
        </Box>
      )}

      {/* Fork connector */}
      {survivor && playinGames.length > 0 && (
        <>
          {/* Vertical line down */}
          <Box sx={{ height: 8, width: 2, background: connColor, mx: 'auto' }} />
          {/* Inverted fork */}
          <Box sx={{
            height: 24, mx: '20px', position: 'relative',
            '&::before': {
              content: '""', position: 'absolute',
              top: 0, left: '25%', width: '50%', height: '100%',
              borderLeft: `2px solid ${connColor}`,
              borderRight: `2px solid ${connColor}`,
              borderTop: `2px solid ${connColor}`,
              borderRadius: '6px 6px 0 0',
            },
          }} />
          {/* Fork labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: '4px' }}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: connColor, letterSpacing: '0.04em' }}>
              Winner {'\u2191'}
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: connColor, letterSpacing: '0.04em' }}>
              Loser {'\u2191'}
            </Typography>
          </Box>
        </>
      )}

      {/* Play-in games */}
      {playinGames.map(m => (
        <Box key={m.matchup_position} sx={{ mb: 1 }}>
          <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * RoundHeader — sticky pill at top of each round column.
 */
function MobileRoundHeader({ label, pts, variant }) {
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
    default: {
      background: theme.palette.action.hover,
      border: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.secondary,
    },
  };

  const s = styles[variant] || styles.default;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '8px', px: 1.5, py: 1, mx: 0, mt: '10px', mb: 1,
      gap: '6px', ...s,
    }}>
      <Typography sx={{
        fontSize: '0.6875rem', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </Typography>
      {pts != null && (
        <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, opacity: 0.7 }}>
          {pts}pts
        </Typography>
      )}
    </Box>
  );
}

/**
 * Dot navigation for round columns.
 */
const DOT_NAV_LABELS = ['Play-In', 'R1', 'Semis', 'Conf', 'Finals'];

function DotNav({ count, activeIndex, onDotClick }) {
  const theme = useTheme();

  return (
    <Box sx={{
      position: 'sticky', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      display: 'inline-flex', alignItems: 'center', gap: 1.5,
      background: theme.palette.background.paper,
      px: 2, py: 1, pb: '18px', borderRadius: '24px',
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[4],
      zIndex: 10, width: 'fit-content', mx: 'auto',
    }}>
      {Array.from({ length: count }, (_, i) => (
        <Box
          key={i}
          onClick={() => onDotClick(i)}
          sx={{
            width: 10, height: 10, borderRadius: '50%',
            background: i === activeIndex ? theme.palette.primary.main : theme.palette.text.disabled,
            transform: i === activeIndex ? 'scale(1.25)' : 'scale(1)',
            transition: 'background 0.3s, transform 0.3s',
            cursor: 'pointer',
            position: 'relative',
            // Enlarge tap target
            '&::before': {
              content: '""', position: 'absolute',
              top: -17, left: -17, right: -17, bottom: -17,
            },
          }}
        >
          {i === activeIndex && (
            <Typography sx={{
              position: 'absolute', top: '100%', mt: '4px',
              fontSize: '0.5625rem', fontWeight: 700,
              color: theme.palette.primary.main,
              whiteSpace: 'nowrap', textAlign: 'center',
              left: '50%', transform: 'translateX(-50%)',
              transition: 'opacity 0.2s',
            }}>
              {DOT_NAV_LABELS[i]}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

/**
 * MobileBracketScroll — horizontal snap-scroll bracket for mobile viewports.
 * 5 round columns: Play-In, R1, Semis, Conf Finals, Finals.
 * Each column has collapsible West/East sections.
 */
const MobileBracketScroll = ({ bracket, isLocked, onMatchupClick, bonusPicks, scoringConfig }) => {
  const theme = useTheme();
  const scrollRef = useRef(null);
  const colRefs = useRef([]);
  const [activeRound, setActiveRound] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const sc = scoringConfig || {};
  const piPts = sc.playin_first?.hit;
  const r1Pts = sc.first?.hit;
  const semiPts = sc.second?.hit;
  const cfPts = sc.conference_final?.hit;
  const finalPts = sc.final?.hit;

  const west = bracket.west || {};
  const east = bracket.east || {};

  // Auto-hide swipe hint after 3s
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Update active dot on scroll + hide swipe hint on first scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      setShowSwipeHint(false);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollLeft = container.scrollLeft;
        const colWidth = container.clientWidth * 0.85;
        const idx = Math.round(scrollLeft / colWidth);
        setActiveRound(Math.min(Math.max(idx, 0), 4));
        ticking = false;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToRound = useCallback((index) => {
    const col = colRefs.current[index];
    if (col) {
      col.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  }, []);

  const roundColSx = {
    flexShrink: 0,
    width: '85vw',
    '@media (min-width: 600px)': { width: '70vw' },
    scrollSnapAlign: 'start',
    px: '10px',
    '&:last-child': { pr: '15vw' },
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Swipe hint — fades out after 3s or on first scroll */}
      <Box sx={{
        position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', gap: '2px',
        px: 1, py: 0.5, borderRadius: '12px',
        background: alpha(theme.palette.background.paper, 0.85),
        border: `1px solid ${theme.palette.divider}`,
        opacity: showSwipeHint ? 0.8 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none', zIndex: 5,
      }}>
        <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: theme.palette.text.secondary }}>
          Swipe
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
      </Box>

      {/* Scroll container */}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          pb: 6,
        }}
      >
        {/* ──── Play-In Column ──── */}
        <Box ref={el => colRefs.current[0] = el} sx={roundColSx}>
          <MobileRoundHeader label="Play-In" pts={piPts} variant="playin" />
          <ConferenceSection title="Western Conference">
            <PlayinSection
              survivor={(west.survivor || [])[0]}
              playinGames={west.playin || []}
              isLocked={isLocked}
              onMatchupClick={onMatchupClick}
            />
          </ConferenceSection>
          <ConferenceSection title="Eastern Conference">
            <PlayinSection
              survivor={(east.survivor || [])[0]}
              playinGames={east.playin || []}
              isLocked={isLocked}
              onMatchupClick={onMatchupClick}
            />
          </ConferenceSection>
        </Box>

        {/* ──── Round 1 Column ──── */}
        <Box ref={el => colRefs.current[1] = el} sx={roundColSx}>
          <MobileRoundHeader label="Round 1" pts={r1Pts} variant="default" />
          <ConferenceSection title="Western Conference">
            {reorderR1(west.r1).map((m, i, arr) => (
              <React.Fragment key={m.matchup_position}>
                <Box sx={{ mb: 1 }}>
                  <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
                </Box>
                {i === 1 && arr.length > 2 && <FlowLabel text={'\u2192 Semi-Final 2'} />}
                {i === 0 && <FlowLabel text={'\u2192 Semi-Final 1'} />}
              </React.Fragment>
            ))}
          </ConferenceSection>
          <ConferenceSection title="Eastern Conference">
            {reorderR1(east.r1).map((m, i, arr) => (
              <React.Fragment key={m.matchup_position}>
                <Box sx={{ mb: 1 }}>
                  <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
                </Box>
                {i === 1 && arr.length > 2 && <FlowLabel text={'\u2192 Semi-Final 2'} />}
                {i === 0 && <FlowLabel text={'\u2192 Semi-Final 1'} />}
              </React.Fragment>
            ))}
          </ConferenceSection>
        </Box>

        {/* ──── Semis Column ──── */}
        <Box ref={el => colRefs.current[2] = el} sx={roundColSx}>
          <MobileRoundHeader label="Semi-Finals" pts={semiPts} variant="default" />
          <ConferenceSection title="Western Conference">
            {(west.semis || []).sort((a, b) => a.matchup_position - b.matchup_position).map(m => (
              <Box key={m.matchup_position} sx={{ mb: 1 }}>
                <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
              </Box>
            ))}
          </ConferenceSection>
          <ConferenceSection title="Eastern Conference">
            {(east.semis || []).sort((a, b) => a.matchup_position - b.matchup_position).map(m => (
              <Box key={m.matchup_position} sx={{ mb: 1 }}>
                <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
              </Box>
            ))}
          </ConferenceSection>
        </Box>

        {/* ──── Conf Finals Column ──── */}
        <Box ref={el => colRefs.current[3] = el} sx={roundColSx}>
          <MobileRoundHeader label="Conference Finals" pts={cfPts} variant="default" />
          <ConferenceSection title="Western Conference">
            {(west.cf || []).map(m => (
              <Box key={m.matchup_position} sx={{ mb: 1 }}>
                <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
              </Box>
            ))}
          </ConferenceSection>
          <ConferenceSection title="Eastern Conference">
            {(east.cf || []).map(m => (
              <Box key={m.matchup_position} sx={{ mb: 1 }}>
                <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
              </Box>
            ))}
          </ConferenceSection>
        </Box>

        {/* ──── Finals Column ──── */}
        <Box ref={el => colRefs.current[4] = el} sx={roundColSx}>
          <MobileRoundHeader label="NBA Finals" pts={finalPts} variant="finals" />
          <Box sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
            <Typography sx={{
              fontSize: 34, lineHeight: 1,
              filter: `drop-shadow(0 0 12px ${alpha(theme.palette.warning.main, 0.6)})`,
            }}>
              {'\uD83C\uDFC6'}
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <BracketMatchup matchup={bracket.final} isLocked={isLocked} isFinals onMatchupClick={onMatchupClick} />
          </Box>
          {bonusPicks && (
            <BonusPicks {...bonusPicks} isLocked={isLocked} />
          )}
        </Box>
      </Box>

      {/* Dot navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4 }}>
        <DotNav count={5} activeIndex={activeRound} onDotClick={scrollToRound} />
      </Box>
    </Box>
  );
};

export default MobileBracketScroll;
