import apiClient from './ApiClient';

// Maps server round codes to component-friendly keys
const ROUND_KEY_MAP = {
  playin_first:      'playin',
  playin_second:     'survivor',
  first:             'r1',
  second:            'semis',
  conference_final:  'cf',
};

/**
 * Enriches a raw matchup object from the API with computed boolean flags
 * that drive display logic in BracketMatchup.
 */
function enrichMatchup(m) {
  const isPlayin  = m.round === 'playin_first' || m.round === 'playin_second';
  const hasPick   = m.predicted_winner_team_id !== null;
  const isPlayed  = m.actual_winner_team_id !== null;

  return {
    ...m,
    isPlayin,
    hasPick,
    // true when the predicted winner is team_1 (used to highlight the correct row)
    predWinnerIsTeam1:   hasPick  && m.predicted_winner_team_id === m.team_1?.team_id,
    // true when the actual winner is team_1 (used to show result overlay)
    actualWinnerIsTeam1: isPlayed && m.actual_winner_team_id    === m.team_1?.team_id,
    // TBD: either team slot is not yet determined (pre-play-in)
    isTbd: !m.team_1 || !m.team_2,
  };
}

/**
 * Groups a flat conference matchup array (9 matchups) into round buckets,
 * sorted by matchup_position within each bucket.
 */
function groupByRound(matchups) {
  const groups = { playin: [], survivor: [], r1: [], semis: [], cf: [] };

  for (const m of matchups) {
    const key = ROUND_KEY_MAP[m.round];
    if (key) groups[key].push(enrichMatchup(m));
  }

  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.matchup_position - b.matchup_position);
  }

  return groups;
}

/**
 * Converts the raw API response from GET /bracket/get_player_bracket into
 * the shape consumed by BracketView and its child components.
 *
 * Input:  { bracket_id, conferences: { east: [...], west: [...] }, final: {...}, ... }
 * Output: { bracketId, east, west, final, isLocked, isBracketSubmitted, ... }
 */
function transformBracketData(apiResponse) {
  return {
    bracketId:           apiResponse.bracket_id,
    playerId:            apiResponse.player_id,
    leagueId:            apiResponse.league_id,
    isBracketSubmitted:  apiResponse.is_bracket_submitted,
    bracketSubmittedAt:  apiResponse.bracket_submitted_at,
    predictedMatchups:   apiResponse.predicted_matchups,
    totalMatchups:       apiResponse.total_matchups,
    deadline:            apiResponse.deadline,
    isLocked:            apiResponse.is_locked,
    east:  groupByRound(apiResponse.conferences.east),
    west:  groupByRound(apiResponse.conferences.west),
    final: enrichMatchup({ ...apiResponse.final, isPlayin: false }),
  };
}

const BracketServices = {
  /**
   * Fetches and transforms the full bracket for a player.
   * Omit playerId to fetch your own bracket; include it to view another player's.
   */
  async getBracket(playerId, leagueId) {
    try {
      const params = new URLSearchParams({ league_id: leagueId });
      if (playerId) params.append('player_id', playerId);
      const data = await apiClient.get(`/bracket/get_player_bracket?${params.toString()}`);
      return transformBracketData(data);
    } catch (error) {
      throw error;
    }
  },

  /** Lightweight status check — does not fetch all 21 matchups. */
  async getBracketStatus(playerId, leagueId) {
    try {
      const params = new URLSearchParams({ league_id: leagueId });
      if (playerId) params.append('player_id', playerId);
      return await apiClient.get(`/bracket/status?${params.toString()}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submits the full bracket atomically.
   * picks: array of 21 pick objects (built by flattenBracketPicks in Phase 1-F-c)
   */
  async submitBracket(playerId, leagueId, picks) {
    try {
      return await apiClient.post('/bracket/submit', {
        player_id: playerId,
        league_id: leagueId,
        picks,
      });
    } catch (error) {
      throw error;
    }
  },
};

export default BracketServices;
