import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Collapse, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BracketMatchup from './BracketMatchup';
import BonusPicks from './BonusPicks';
import { reorderR1 } from '../../utils/bracketUtils';
import { getBracketAnimationSx } from './bracketStyles';

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
          py: '10px', mb: 1,
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
 * `conference` is 'w' or 'e' — used for tap-to-highlight card IDs.
 */
function PlayinSection({ survivor, playinGames, isLocked, onMatchupClick, conference, onTap, cardIdx, skipDelay }) {
  const theme = useTheme();
  const connColor = alpha(theme.palette.warning.main, 0.4);
  const c = conference;

  // Reverse so 9v10 renders above 7v8 (7v8 at bottom, matching desktop)
  const orderedGames = [...playinGames].reverse();

  return (
    <Box>
      {/* Survivor card on top */}
      {survivor && (
        <Box sx={{ mb: '4px' }}>
          <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.palette.text.disabled, textAlign: 'center', mb: '4px' }}>
            Survivor
          </Typography>
          <TappableCard data-card-id={`${c}-surv`} data-feeds={`${c}-pi-1,${c}-pi-2`} delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={onTap}>
            <BracketMatchup matchup={survivor} isLocked={isLocked} onMatchupClick={onMatchupClick} />
          </TappableCard>
        </Box>
      )}

      {/* Fork connector */}
      {survivor && orderedGames.length > 0 && (
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

      {/* Play-in games (9v10 on top, 7v8 on bottom) */}
      {orderedGames.map(m => (
        <Box key={m.matchup_position} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.palette.text.disabled, textAlign: 'center', mb: '4px' }}>
            {m.matchup_position === 1 ? '#7 vs #8' : '#9 vs #10'}
          </Typography>
          <TappableCard data-card-id={`${c}-pi-${m.matchup_position}`} data-feeds="" delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={onTap}>
            <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
          </TappableCard>
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
      display: 'inline-flex', alignItems: 'center', gap: 1.5,
      background: theme.palette.background.paper,
      px: 2, py: 1, borderRadius: '24px',
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[4],
    }}>
      {Array.from({ length: count }, (_, i) => (
        <Box
          key={i}
          onClick={() => onDotClick(i)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDotClick(i); } }}
          role="button"
          tabIndex={0}
          aria-label={`Go to ${DOT_NAV_LABELS[i]}`}
          aria-current={i === activeIndex ? 'step' : undefined}
          sx={{
            width: 10, height: 10, borderRadius: '50%',
            background: i === activeIndex ? theme.palette.primary.main : theme.palette.text.disabled,
            transform: i === activeIndex ? 'scale(1.25)' : 'scale(1)',
            transition: 'background 0.3s, transform 0.3s',
            cursor: 'pointer',
            position: 'relative',
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 3,
            },
            // Enlarge tap target
            '&::before': {
              content: '""', position: 'absolute',
              top: -17, left: -17, right: -17, bottom: -17,
            },
          }}
        >
          {i === activeIndex && (
            <Typography sx={{
              position: 'absolute', bottom: '100%', mb: '4px',
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
 * TappableCard — wrapper for bracket cards with tap-to-highlight (read mode)
 * and staggered fade-in animation delay.
 * Defined outside MobileBracketScroll so its component identity is stable across re-renders.
 */
function TappableCard({ children, delay, onTap, sx: sxProp, ...props }) {
  return (
    <Box
      {...props}
      onClick={onTap}
      sx={{ ...(delay != null && { animationDelay: `${delay}ms` }), ...sxProp }}
    >
      {children}
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
  const animatedRef = useRef(false);
  useEffect(() => { animatedRef.current = true; }, []);
  const [activeRound, setActiveRound] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const sc = scoringConfig || {};
  const fmtPts = (round) => {
    const r = sc[round];
    if (!r) return null;
    return r.bullseye ? `${r.hit}/${r.bullseye}` : `${r.hit}`;
  };
  const piPts = fmtPts('playinFirst');
  const r1Pts = fmtPts('first');
  const semiPts = fmtPts('second');
  const cfPts = fmtPts('conferenceFinal');
  const finalPts = fmtPts('final');

  const west = bracket.west || {};
  const east = bracket.east || {};

  // --- Tap-to-highlight (read mode only) ---
  const activeHighlightRef = useRef(null);

  const clearHighlight = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.querySelectorAll('.card-highlight').forEach(el => el.classList.remove('card-highlight'));
    scrollRef.current.querySelectorAll('.card-highlight-source').forEach(el => el.classList.remove('card-highlight-source'));
    activeHighlightRef.current = null;
  }, []);

  const highlightPath = useCallback((cardEl) => {
    if (!scrollRef.current) return;
    const feedsStr = cardEl.getAttribute('data-feeds');
    if (!feedsStr) return;
    const feedIds = feedsStr.split(',').filter(Boolean);

    cardEl.classList.add('card-highlight');
    for (const fid of feedIds) {
      const feedCard = scrollRef.current.querySelector(`[data-card-id="${fid}"]`);
      if (feedCard) feedCard.classList.add('card-highlight-source');
    }
    activeHighlightRef.current = cardEl.getAttribute('data-card-id');
  }, []);

  const handleCardTap = useCallback((e) => {
    if (!isLocked) return; // write mode — let BracketMatchup handle clicks
    const cardEl = e.currentTarget;
    const cardId = cardEl.getAttribute('data-card-id');
    if (activeHighlightRef.current === cardId) {
      clearHighlight();
    } else {
      clearHighlight();
      highlightPath(cardEl);
    }
    e.stopPropagation(); // prevent container click from clearing immediately
  }, [isLocked, clearHighlight, highlightPath]);

  // Card animation stagger counter — only used on first render
  const skipDelay = animatedRef.current;
  let cardIdx = { val: 0 };

  // Lock page-level horizontal scroll when mobile bracket is mounted
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflowX;
    const prevBody = body.style.overflowX;
    html.style.overflowX = 'hidden';
    body.style.overflowX = 'hidden';
    return () => {
      html.style.overflowX = prevHtml;
      body.style.overflowX = prevBody;
    };
  }, []);

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
    let rafId = null;
    const handleScroll = () => {
      setShowSwipeHint(false);
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        const scrollLeft = container.scrollLeft;
        const colWidth = colRefs.current[0]?.offsetWidth || container.clientWidth * 0.85;
        const idx = Math.round(scrollLeft / colWidth);
        setActiveRound(Math.min(Math.max(idx, 0), 4));
        ticking = false;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
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
        onClick={clearHighlight}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          pb: 8,
          ...getBracketAnimationSx(theme),
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
              conference="w"
              onTap={handleCardTap}
              cardIdx={cardIdx}
              skipDelay={skipDelay}
            />
          </ConferenceSection>
          <ConferenceSection title="Eastern Conference">
            <PlayinSection
              survivor={(east.survivor || [])[0]}
              playinGames={east.playin || []}
              isLocked={isLocked}
              onMatchupClick={onMatchupClick}
              conference="e"
              onTap={handleCardTap}
              cardIdx={cardIdx}
              skipDelay={skipDelay}
            />
          </ConferenceSection>
        </Box>

        {/* ──── Round 1 Column ──── */}
        <Box ref={el => colRefs.current[1] = el} sx={roundColSx}>
          <MobileRoundHeader label="Round 1" pts={r1Pts} variant="default" />
          <ConferenceSection title="Western Conference">
            {reorderR1(west.r1).map((m, i, arr) => {
              const feedMap = { 1: 'w-surv', 2: 'w-pi-1', 3: '', 4: '' };
              const feeds = feedMap[m.matchup_position] || '';
              return (
                <React.Fragment key={m.matchup_position}>
                  <TappableCard data-card-id={`w-r1-${m.matchup_position}`} data-feeds={feeds} delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={handleCardTap} sx={{ mb: 1 }}>
                    <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
                  </TappableCard>
                  {i === 2 && arr.length > 2 && <FlowLabel text={'\u2192 Western Semi-Final 2'} />}
                  {i === 0 && <FlowLabel text={'\u2192 Western Semi-Final 1'} />}
                </React.Fragment>
              );
            })}
          </ConferenceSection>
          <ConferenceSection title="Eastern Conference">
            {reorderR1(east.r1).map((m, i, arr) => {
              const feedMap = { 1: 'e-surv', 2: 'e-pi-1', 3: '', 4: '' };
              const feeds = feedMap[m.matchup_position] || '';
              return (
                <React.Fragment key={m.matchup_position}>
                  <TappableCard data-card-id={`e-r1-${m.matchup_position}`} data-feeds={feeds} delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={handleCardTap} sx={{ mb: 1 }}>
                    <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
                  </TappableCard>
                  {i === 2 && arr.length > 2 && <FlowLabel text={'\u2192 Eastern Semi-Final 2'} />}
                  {i === 0 && <FlowLabel text={'\u2192 Eastern Semi-Final 1'} />}
                </React.Fragment>
              );
            })}
          </ConferenceSection>
        </Box>

        {/* ──── Semis Column ──── */}
        <Box ref={el => colRefs.current[2] = el} sx={roundColSx}>
          <MobileRoundHeader label="Semi-Finals" pts={semiPts} variant="default" />
          <ConferenceSection title="Western Conference">
            {(west.semis || []).sort((a, b) => a.matchup_position - b.matchup_position).map((m, i) => (
              <React.Fragment key={m.matchup_position}>
                <TappableCard data-card-id={`w-s${m.matchup_position}`} data-feeds={m.matchup_position === 1 ? 'w-r1-1,w-r1-4' : 'w-r1-3,w-r1-2'} delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={handleCardTap} sx={{ mb: 1 }}>
                  <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
                </TappableCard>
                {i === 0 && <FlowLabel text={'\u2192 Western Conference Final'} accent />}
              </React.Fragment>
            ))}
          </ConferenceSection>
          <ConferenceSection title="Eastern Conference">
            {(east.semis || []).sort((a, b) => a.matchup_position - b.matchup_position).map((m, i) => (
              <React.Fragment key={m.matchup_position}>
                <TappableCard data-card-id={`e-s${m.matchup_position}`} data-feeds={m.matchup_position === 1 ? 'e-r1-1,e-r1-4' : 'e-r1-3,e-r1-2'} delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={handleCardTap} sx={{ mb: 1 }}>
                  <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
                </TappableCard>
                {i === 0 && <FlowLabel text={'\u2192 Eastern Conference Final'} accent />}
              </React.Fragment>
            ))}
          </ConferenceSection>
        </Box>

        {/* ──── Conf Finals Column ──── */}
        <Box ref={el => colRefs.current[3] = el} sx={roundColSx}>
          <MobileRoundHeader label="Conference Finals" pts={cfPts} variant="default" />
          <ConferenceSection title="Western Conference">
            {(west.cf || []).map(m => (
              <TappableCard key={m.matchup_position} data-card-id="w-cf" data-feeds="w-s1,w-s2" delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={handleCardTap} sx={{ mb: 1 }}>
                <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
              </TappableCard>
            ))}
          </ConferenceSection>
          <ConferenceSection title="Eastern Conference">
            {(east.cf || []).map(m => (
              <TappableCard key={m.matchup_position} data-card-id="e-cf" data-feeds="e-s1,e-s2" delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={handleCardTap} sx={{ mb: 1 }}>
                <BracketMatchup matchup={m} isLocked={isLocked} onMatchupClick={onMatchupClick} />
              </TappableCard>
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
          <TappableCard data-card-id="final" data-feeds="w-cf,e-cf" delay={skipDelay ? undefined : cardIdx.val++ * 40} onTap={handleCardTap} sx={{ mb: 1 }}>
            <BracketMatchup matchup={bracket.final} isLocked={isLocked} isFinals onMatchupClick={onMatchupClick} />
          </TappableCard>
          {bonusPicks && (
            <BonusPicks {...bonusPicks} isLocked={isLocked} />
          )}
        </Box>
      </Box>

      {/* Dot navigation — sticky at bottom, centered */}
      <Box sx={{ display: 'flex', justifyContent: 'center', position: 'sticky', bottom: 12, zIndex: 10 }}>
        <DotNav count={5} activeIndex={activeRound} onDotClick={scrollToRound} />
      </Box>
    </Box>
  );
};

export default MobileBracketScroll;
