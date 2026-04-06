/**
 * bracketUtils.js — Pure bracket state utilities.
 *
 * Exported: applyPick, countPicks, picksMatch, flattenBracketPicks,
 *           getMatchupResultState, computeBracketHealth,
 *           R1_DISPLAY_ORDER, reorderR1, randomFillBracket, clearAllPicks.
 *
 * All functions operate on the transformed bracket shape produced by
 * BracketServices.transformBracketData (component round keys, enriched matchup objects).
 *
 * None of these functions make API calls. All mutations happen in React state;
 * the only API write is POST /bracket/submit (see BracketServices.submitBracket).
 */

// Maps component round keys to scoring config keys (used by computeBracketHealth for scoring config lookup)
const COMPONENT_TO_API_ROUND = {
  playin:   'playinFirst',
  survivor: 'playinSecond',
  r1:       'first',
  semis:    'second',
  cf:       'conferenceFinal',
};

// ---------------------------------------------------------------------------
// Result state helpers (shared by BracketMatchup + computeBracketHealth)
// ---------------------------------------------------------------------------

/**
 * Determines the result state of a matchup for display purposes.
 * Returns: 'bullseye' | 'hit' | 'miss' | 'path_miss' | 'pending' | 'voided' | 'na'
 */
export function getMatchupResultState(m) {
  if (!m?.hasPick) return 'na';
  if (m?.isMatchupExist === false) return 'voided';
  if (!m?.isPlayed) return 'pending';

  const isBullseye =
    m.isCorrect === true &&
    !m.isPlayin &&
    Boolean(m.predicted_series_score) &&
    Boolean(m.actual_series_score) &&
    m.predicted_series_score === m.actual_series_score;

  if (isBullseye) return 'bullseye';
  if (m.isCorrect === true) return 'hit';
  if (m.isCorrect === false && m.actualWinnerIsOther) return 'path_miss';
  if (m.isCorrect === false) return 'miss';
  return 'na';
}

/**
 * Computes bracket health stats from the current bracket state and scoring config.
 *
 * @param {Object} bracket - Transformed bracket state
 * @param {Object} scoringConfig - Bracket scoring config from API, keyed by API round name
 *   e.g. { playin_first: { hit: 3, bullseye: null }, first: { hit: 5, bullseye: 7 }, ... }
 * @returns {{ correct: number, wrong: number, pending: number, voided: number,
 *             pts: number, totalPotential: number, decided: number }}
 */
export function computeBracketHealth(bracket, scoringConfig) {
  if (!bracket) return { correct: 0, wrong: 0, pending: 0, voided: 0, pts: 0, totalPotential: 0, decided: 0 };

  let correct = 0, wrong = 0, pending = 0, voided = 0;
  let pts = 0, totalPotential = 0;

  const processMatchup = (m, apiRound) => {
    const state = getMatchupResultState(m);
    const roundScoring = scoringConfig?.[apiRound] || { hit: 0, bullseye: null };
    const maxPts = roundScoring.bullseye || roundScoring.hit || 0;

    switch (state) {
      case 'bullseye':
        correct++;
        pts += roundScoring.bullseye || roundScoring.hit || 0;
        totalPotential += maxPts;
        break;
      case 'hit':
        correct++;
        pts += roundScoring.hit || 0;
        totalPotential += maxPts;
        break;
      case 'miss':
      case 'path_miss':
        wrong++;
        totalPotential += maxPts;
        break;
      case 'pending':
        pending++;
        totalPotential += maxPts;
        break;
      case 'voided':
        voided++;
        totalPotential += maxPts;
        break;
      default: // 'na'
        totalPotential += maxPts;
        break;
    }
  };

  // Process conference matchups
  for (const conf of ['east', 'west']) {
    for (const [roundKey, matchups] of Object.entries(bracket[conf] || {})) {
      const apiRound = COMPONENT_TO_API_ROUND[roundKey];
      for (const m of matchups) {
        processMatchup(m, apiRound);
      }
    }
  }

  // Process Finals
  if (bracket.final) {
    processMatchup(bracket.final, 'final');
  }

  const decided = correct + wrong + voided;

  return { correct, wrong, pending, voided, pts, totalPotential, decided };
}

// ---------------------------------------------------------------------------
// Propagation map
//
// Key:   `${componentRoundKey}-${matchupPosition}`
// Value: array of downstream slot updates to apply when a winner is picked
//
// Component round keys (not API round names):
//   playin   = playin_first   (2 per conf: pos 1 = 7v8, pos 2 = 9v10)
//   survivor = playin_second  (1 per conf: loser-of-pos1 vs winner-of-pos2)
//   r1       = first          (4 per conf)
//   semis    = second         (2 per conf)
//   cf       = conference_final (1 per conf)
//
// For `cf-1 → final`, `slot` is null — resolved in propagatePickResult
// based on conference: east → team_1, west → team_2.
// ---------------------------------------------------------------------------
const PROPAGATION_MAP = {
  'playin-1': [
    { targetRound: 'r1',       targetPos: 2, slot: 'team_2', take: 'winner' },
    { targetRound: 'survivor', targetPos: 1, slot: 'team_1', take: 'loser'  },
  ],
  'playin-2': [
    { targetRound: 'survivor', targetPos: 1, slot: 'team_2', take: 'winner' },
  ],
  'survivor-1': [{ targetRound: 'r1',    targetPos: 1, slot: 'team_2', take: 'winner' }],
  'r1-1':       [{ targetRound: 'semis', targetPos: 1, slot: 'team_1', take: 'winner' }],
  'r1-2':       [{ targetRound: 'semis', targetPos: 2, slot: 'team_1', take: 'winner' }],
  'r1-3':       [{ targetRound: 'semis', targetPos: 2, slot: 'team_2', take: 'winner' }],
  'r1-4':       [{ targetRound: 'semis', targetPos: 1, slot: 'team_2', take: 'winner' }],
  'semis-1':    [{ targetRound: 'cf',    targetPos: 1, slot: 'team_1', take: 'winner' }],
  'semis-2':    [{ targetRound: 'cf',    targetPos: 1, slot: 'team_2', take: 'winner' }],
  'cf-1':       [{ targetRound: 'final', targetPos: 1, slot: null,     take: 'winner' }],
};

// ---------------------------------------------------------------------------
// Internal helpers (not exported)
// ---------------------------------------------------------------------------

/**
 * Returns a reference to a matchup object within the cloned state.
 * For the Finals matchup, pass conference='final' or round='final'.
 */
function getMatchupMut(state, conference, round, pos) {
  if (round === 'final' || conference === 'final') return state.final;
  const roundArr = state[conference]?.[round];
  if (!roundArr) return null;
  return roundArr.find(m => m.matchup_position === pos) || null;
}

/**
 * Zeros out all pick-related fields on a matchup object.
 * Called when a downstream pick is invalidated by an upstream team change.
 */
function clearMatchupPick(matchup) {
  matchup.predicted_winner_team_id = null;
  matchup.predicted_series_score   = null;
  matchup.hasPick                  = false;
  matchup.predWinnerIsTeam1        = false;
  matchup.predWinnerIsTeam2        = false;
}

/**
 * Recursively propagates a pick result (winnerTeam / loserTeam) to all downstream
 * matchup slots as defined in PROPAGATION_MAP. When winnerTeam is null it means
 * the upstream pick was cleared — nulls cascade downstream.
 *
 * When a downstream team slot changes AND that matchup already has a pick:
 *   - The pick is cleared (the predicted winner may no longer be in the matchup)
 *   - Propagation recurses from that matchup with (null, null) to further clear
 *     any picks that depended on the now-invalid prediction
 */
function propagatePickResult(state, conference, round, position, winnerTeam, loserTeam) {
  const key     = `${round}-${position}`;
  const entries = PROPAGATION_MAP[key];
  if (!entries) return;

  for (const { targetRound, targetPos, slot: slotDef, take } of entries) {
    const newTeam = take === 'winner' ? winnerTeam : loserTeam;

    // Determine target conference and team slot
    const targetConf = targetRound === 'final' ? 'final' : conference;
    const slot = targetRound === 'final'
      ? (conference === 'east' ? 'team_1' : 'team_2')
      : slotDef;

    const targetMatchup = getMatchupMut(state, targetConf, targetRound, targetPos);
    if (!targetMatchup) continue;

    const oldTeam = targetMatchup[slot];
    const teamChanged = oldTeam?.team_id !== newTeam?.team_id;

    // Update team slot
    targetMatchup[slot] = newTeam;

    // Re-derive isTbd and can_edit
    targetMatchup.isTbd     = !targetMatchup.team_1 || !targetMatchup.team_2;
    targetMatchup.can_edit  = !targetMatchup.isTbd && !state.isLocked;

    // If the team that was in this slot changed and there's an existing pick,
    // that pick is now invalid — clear it and cascade further.
    if (teamChanged && targetMatchup.predicted_winner_team_id !== null) {
      clearMatchupPick(targetMatchup);
      // Recurse with null winner/loser: downstream slots of this cleared pick become null too
      propagatePickResult(state, targetConf, targetRound, targetPos, null, null);
    }
  }
}

// ---------------------------------------------------------------------------
// Exported utilities
// ---------------------------------------------------------------------------

/**
 * Applies a single pick to the bracket state and cascades downstream changes.
 *
 * Pure function — deep-clones the state, never mutates in place.
 * Returns the new bracket state. Call via `setBracketState(prev => applyPick(prev, pick))`.
 *
 * @param {Object} bracketState  - Current bracket state (from BracketServices.transformBracketData)
 * @param {Object} pick
 * @param {string} pick.round            - Component round key ('playin', 'survivor', 'r1', 'semis', 'cf', 'final')
 * @param {string} pick.conference       - 'east' | 'west' | 'final'
 * @param {number} pick.matchupPosition  - 1-based matchup position within the round
 * @param {number} pick.winnerTeamId     - team_id of the predicted winner
 * @param {number|null} pick.seriesScoreLoser - loser's wins (0-3); null for play-in rounds
 */
export function applyPick(bracketState, { round, conference, matchupPosition, winnerTeamId, seriesScoreLoser }) {
  // Deep clone — all enriched matchup fields are plain JSON (no functions)
  const state = JSON.parse(JSON.stringify(bracketState));

  // Locate and update the target matchup
  const target = getMatchupMut(state, conference, round, matchupPosition);
  if (!target) return state;

  const isPlayin = round === 'playin' || round === 'survivor';

  // Resolve winner and loser team objects (for propagation)
  const winnerTeam = target.team_1?.team_id === winnerTeamId ? target.team_1 : target.team_2;
  const loserTeam  = target.team_1?.team_id === winnerTeamId ? target.team_2 : target.team_1;

  // Apply the pick
  target.predicted_winner_team_id = winnerTeamId;
  target.predicted_series_score   = isPlayin ? null : `4-${seriesScoreLoser}`;
  target.hasPick                  = true;
  target.predWinnerIsTeam1        = winnerTeamId === target.team_1?.team_id;
  target.predWinnerIsTeam2        = winnerTeamId === target.team_2?.team_id;

  // Cascade downstream
  propagatePickResult(state, conference, round, matchupPosition, winnerTeam, loserTeam);

  // Re-count (predictedMatchups drives the progress bar and submit button)
  state.predictedMatchups = countPicks(state);

  return state;
}

/**
 * Counts the number of matchups where a winner has been predicted.
 * Returns an integer from 0 to 21.
 */
export function countPicks(bracketState) {
  if (!bracketState) return 0;

  let count = 0;
  for (const conf of ['east', 'west']) {
    for (const roundArr of Object.values(bracketState[conf])) {
      for (const m of roundArr) {
        if (m.predicted_winner_team_id !== null) count++;
      }
    }
  }
  if (bracketState.final?.predicted_winner_team_id !== null) count++;
  return count;
}

/**
 * Returns true when two bracket states have identical picks across all 21 matchups.
 * Used to compute `hasUnsavedChanges` in BracketPage.
 */
export function picksMatch(a, b) {
  if (!a || !b) return false;

  for (const conf of ['east', 'west']) {
    const keysA = Object.keys(a[conf]);
    for (const key of keysA) {
      const roundA = a[conf][key];
      const roundB = b[conf][key];
      if (!roundB || roundA.length !== roundB.length) return false;
      for (let i = 0; i < roundA.length; i++) {
        if (roundA[i].predicted_winner_team_id !== roundB[i].predicted_winner_team_id) return false;
        if (roundA[i].predicted_series_score   !== roundB[i].predicted_series_score)   return false;
      }
    }
  }

  if (a.final.predicted_winner_team_id !== b.final.predicted_winner_team_id) return false;
  if (a.final.predicted_series_score   !== b.final.predicted_series_score)   return false;

  return true;
}

/**
 * Converts the nested bracket state into the flat 21-pick array required by
 * POST /bracket/submit. Maps component round keys back to API round names.
 *
 * @returns {Array} 21 pick objects, each with:
 *   { round, conference, matchup_position, team_1_id, team_2_id,
 *     predicted_winner_team_id, predicted_series_score_winner, predicted_series_score_loser }
 */
export function flattenBracketPicks(bracketState) {
  const ROUND_KEY_TO_API = {
    playin:   'playin_first',
    survivor: 'playin_second',
    r1:       'first',
    semis:    'second',
    cf:       'conference_final',
  };

  const picks = [];

  for (const conf of ['east', 'west']) {
    for (const [roundKey, matchups] of Object.entries(bracketState[conf])) {
      const apiRound = ROUND_KEY_TO_API[roundKey];
      const isPlayin = roundKey === 'playin' || roundKey === 'survivor';

      for (const m of matchups) {
        const loserScore = (!isPlayin && m.predicted_series_score)
          ? parseInt(m.predicted_series_score.split('-')[1], 10)
          : null;

        picks.push({
          round:                          apiRound,
          conference:                     conf,
          matchup_position:               m.matchup_position,
          team_1_id:                      m.team_1?.team_id ?? null,
          team_2_id:                      m.team_2?.team_id ?? null,
          predicted_winner_team_id:       m.predicted_winner_team_id,
          predicted_series_score_winner:  isPlayin ? null : 4,
          predicted_series_score_loser:   isPlayin ? null : loserScore,
        });
      }
    }
  }

  // Finals
  const f = bracketState.final;
  const finalsLoserScore = f.predicted_series_score
    ? parseInt(f.predicted_series_score.split('-')[1], 10)
    : null;

  picks.push({
    round:                          'final',
    conference:                     'final',
    matchup_position:               f.matchup_position ?? 1,
    team_1_id:                      f.team_1?.team_id ?? null,
    team_2_id:                      f.team_2?.team_id ?? null,
    predicted_winner_team_id:       f.predicted_winner_team_id,
    predicted_series_score_winner:  4,
    predicted_series_score_loser:   finalsLoserScore,
  });

  return picks;
}

// ---------------------------------------------------------------------------
// Random fill
// ---------------------------------------------------------------------------

/**
 * Picks the winner of a matchup based on strategy.
 * Returns the winning team object.
 *
 * - 'random':    coin flip
 * - 'favorites': higher seed wins deterministically (lower seed number)
 * - 'upsets':    underdog wins with weighted probability — bigger seed gaps
 *               mean higher upset probability (55-80%), creating a chaos bracket
 *
 * Falls back to random when seeds are equal or null (e.g. cross-conference Finals).
 */
function pickWinnerByStrategy(team1, team2, strategy) {
  if (strategy !== 'random' && team1.seed != null && team2.seed != null && team1.seed !== team2.seed) {
    const higherSeed = team1.seed < team2.seed ? team1 : team2;
    const lowerSeed  = higherSeed === team1 ? team2 : team1;

    if (strategy === 'favorites') return higherSeed;

    // 'upsets': bigger seed gap → higher upset probability
    // diff 1 (4v5) → 58%, diff 3 (3v6) → 64%, diff 5 (2v7) → 70%, diff 7 (1v8) → 76%
    const seedDiff = Math.abs(team1.seed - team2.seed);
    const upsetProb = Math.min(0.55 + 0.03 * seedDiff, 0.80);
    return Math.random() < upsetProb ? lowerSeed : higherSeed;
  }
  return Math.random() < 0.5 ? team1 : team2;
}

/**
 * Fills empty (or all) matchup slots with picks based on a strategy.
 *
 * Pure function — builds new state by sequentially calling applyPick in
 * topological round order so upstream winners propagate before downstream
 * matchups are filled.
 *
 * @param {Object} bracketState - Current bracket state
 * @param {'all'|'remaining'} mode - 'all' replaces every pick; 'remaining' only fills empty slots
 * @param {'random'|'favorites'|'upsets'} [strategy='random'] - Winner selection strategy
 * @returns {Object} New bracket state with picks applied
 */
const FILL_ROUND_ORDER = ['playin', 'survivor', 'r1', 'semis', 'cf'];

export function randomFillBracket(bracketState, mode, strategy = 'random') {
  let state = bracketState;

  for (const conf of ['east', 'west']) {
    for (const round of FILL_ROUND_ORDER) {
      const count = state[conf][round]?.length ?? 0;
      for (let i = 0; i < count; i++) {
        // Re-read from latest state — applyPick deep-clones, so previous refs are stale
        const m = state[conf][round][i];
        if (mode === 'remaining' && m.hasPick) continue;
        if (m.isTbd) continue;

        const isPlayin = round === 'playin' || round === 'survivor';
        const winner = pickWinnerByStrategy(m.team_1, m.team_2, strategy);
        state = applyPick(state, {
          round,
          conference:       conf,
          matchupPosition:  m.matchup_position,
          winnerTeamId:     winner.team_id,
          seriesScoreLoser: isPlayin ? null : Math.floor(Math.random() * 4),
        });
      }
    }
  }

  // Finals
  const f = state.final;
  if (f && !f.isTbd && !(mode === 'remaining' && f.hasPick)) {
    const winner = pickWinnerByStrategy(f.team_1, f.team_2, strategy);
    state = applyPick(state, {
      round:            'final',
      conference:       'final',
      matchupPosition:  f.matchup_position ?? 1,
      winnerTeamId:     winner.team_id,
      seriesScoreLoser: Math.floor(Math.random() * 4),
    });
  }

  return state;
}

/**
 * Clears all picks and propagated team slots, returning the bracket to its
 * base state (only structurally-assigned teams remain).
 *
 * Uses PROPAGATION_MAP to identify which team slots were filled by predictions
 * and nulls them out, then clears pick fields on every matchup.
 */
export function clearAllPicks(bracketState) {
  const state = JSON.parse(JSON.stringify(bracketState));

  // Null out every propagated team slot defined in the propagation map
  for (const entries of Object.values(PROPAGATION_MAP)) {
    for (const { targetRound, targetPos, slot: slotDef } of entries) {
      if (targetRound === 'final') {
        // cf → final: both team slots are propagated (east→team_1, west→team_2)
        if (state.final) {
          state.final.team_1 = null;
          state.final.team_2 = null;
        }
      } else {
        for (const conf of ['east', 'west']) {
          const target = getMatchupMut(state, conf, targetRound, targetPos);
          if (target && slotDef) target[slotDef] = null;
        }
      }
    }
  }

  // Clear picks and re-derive flags on every matchup
  for (const conf of ['east', 'west']) {
    for (const matchups of Object.values(state[conf])) {
      for (const m of matchups) {
        clearMatchupPick(m);
        m.isTbd    = !m.team_1 || !m.team_2;
        m.can_edit = !m.isTbd && !state.isLocked;
      }
    }
  }
  if (state.final) {
    clearMatchupPick(state.final);
    state.final.isTbd    = !state.final.team_1 || !state.final.team_2;
    state.final.can_edit = !state.final.isTbd && !state.isLocked;
  }

  state.predictedMatchups = 0;
  return state;
}

// ---------------------------------------------------------------------------
// Display order helpers (used by DesktopBracketGrid + MobileBracketScroll)
// ---------------------------------------------------------------------------

// R1 display order: top half (1v8 + 4v5) → bottom half (3v6 + 2v7)
export const R1_DISPLAY_ORDER = [1, 4, 3, 2];

/**
 * Reorders Round 1 matchups into bracket topology order for display.
 */
export function reorderR1(matchups) {
  if (!matchups || matchups.length !== 4) return matchups || [];
  return R1_DISPLAY_ORDER.map(pos => matchups.find(m => m.matchup_position === pos)).filter(Boolean);
}
