/**
 * bracketUtils.js — Pure bracket state utilities.
 *
 * Exported: applyPick, countPicks, picksMatch, flattenBracketPicks,
 *           getMatchupResultState, computeBracketHealth.
 *
 * All functions operate on the transformed bracket shape produced by
 * BracketServices.transformBracketData (component round keys, enriched matchup objects).
 *
 * None of these functions make API calls. All mutations happen in React state;
 * the only API write is POST /bracket/submit (see BracketServices.submitBracket).
 */

// Maps component round keys to API round keys (used by computeBracketHealth for scoring config lookup)
const COMPONENT_TO_API_ROUND = {
  playin:   'playin_first',
  survivor: 'playin_second',
  r1:       'first',
  semis:    'second',
  cf:       'conference_final',
};

// ---------------------------------------------------------------------------
// Result state helpers (shared by BracketMatchup + computeBracketHealth)
// ---------------------------------------------------------------------------

/**
 * Determines the result state of a matchup for display purposes.
 * Returns: 'bullseye' | 'hit' | 'miss' | 'pending' | 'voided' | 'na'
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
