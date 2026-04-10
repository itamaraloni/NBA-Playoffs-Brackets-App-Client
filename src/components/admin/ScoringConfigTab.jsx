import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// Ordered list of rounds for display — short labels used on mobile
const ROUNDS = [
  { key: 'playin_first', label: 'Play-In (First)', shortLabel: 'Play-In 1' },
  { key: 'playin_second', label: 'Play-In (Second)', shortLabel: 'Play-In 2' },
  { key: 'first', label: 'First Round', shortLabel: '1st Round' },
  { key: 'second', label: 'Second Round', shortLabel: '2nd Round' },
  { key: 'conference_final', label: 'Conference Finals', shortLabel: 'Conf. Finals' },
  { key: 'final', label: 'Finals', shortLabel: 'Finals' },
];

const PLAY_IN_ROUNDS = new Set(['playin_first', 'playin_second']);

/**
 * Flatten the nested scoring config into an editable row structure.
 * Input shape:  { bracket: { round: { hit, bullseye } }, matchup: { ... } }
 * Output shape: { round: { bracketHit, bracketBullseye, matchupHit, matchupBullseye } }
 */
const buildScoringRows = (scoringConfig) => {
  const rows = {};
  for (const { key } of ROUNDS) {
    rows[key] = {
      bracketHit: scoringConfig.bracket[key]?.hit ?? 0,
      bracketBullseye: scoringConfig.bracket[key]?.bullseye,
      matchupHit: scoringConfig.matchup[key]?.hit ?? 0,
      matchupBullseye: scoringConfig.matchup[key]?.bullseye,
    };
  }
  return rows;
};

/**
 * Build a map of team championship points keyed by teamId.
 */
const buildTeamPointsMap = (teams) => {
  const map = {};
  for (const t of teams) {
    map[t.teamId] = t.championshipPoints ?? 0;
  }
  return map;
};

/**
 * Build a map of MVP points keyed by nbaPlayerId.
 */
const buildMvpPointsMap = (mvpCandidates) => {
  const map = {};
  for (const c of mvpCandidates) {
    map[c.nbaPlayerId] = c.mvpPoints ?? 0;
  }
  return map;
};

/**
 * Scoring Config tab — lets admins edit round scoring, championship points, and MVP points.
 *
 * Design notes:
 * - Each section tracks its own "edited" state independently
 * - Save button only enables when values differ from the original props
 * - On save, only changed rows are sent to the server (minimizes API calls)
 * - Number inputs use type="number" with min=0 to prevent negative values
 */
const ScoringConfigTab = ({
  scoringConfig,
  teams,
  mvpCandidates,
  loading,
  error,
  onUpdateScoring,
  onUpdateTeam,
  onUpdateMvpPlayer,
  onPickActualMvp,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputWidth = isMobile ? 64 : 80;
  // --- Round Scoring state ---
  const originalScoringRows = useMemo(
    () => (scoringConfig ? buildScoringRows(scoringConfig) : null),
    [scoringConfig]
  );
  const [editedScoringRows, setEditedScoringRows] = useState(null);

  // Initialize edited rows when original data arrives
  const scoringRows = editedScoringRows ?? originalScoringRows;

  const handleScoringChange = useCallback((round, field, value) => {
    setEditedScoringRows(prev => {
      const base = prev ?? originalScoringRows;
      return {
        ...base,
        [round]: { ...base[round], [field]: value === '' ? '' : Number(value) },
      };
    });
  }, [originalScoringRows]);

  const isScoringDirty = useMemo(() => {
    if (!editedScoringRows || !originalScoringRows) return false;
    return JSON.stringify(editedScoringRows) !== JSON.stringify(originalScoringRows);
  }, [editedScoringRows, originalScoringRows]);

  const [scoringSaving, setScoringSaving] = useState(false);

  const handleSaveScoring = async () => {
    if (!editedScoringRows || !originalScoringRows) return;
    // Validate no empty fields before sending
    for (const { key, label } of ROUNDS) {
      const edited = editedScoringRows[key];
      const isPlayIn = PLAY_IN_ROUNDS.has(key);
      if (edited.bracketHit === '' || edited.matchupHit === '') {
        if (window.notify) window.notify.error(`Hit points cannot be empty for ${label}`);
        return;
      }
      if (!isPlayIn && (edited.bracketBullseye === '' || edited.matchupBullseye === '')) {
        if (window.notify) window.notify.error(`Bullseye points cannot be empty for ${label}`);
        return;
      }
    }
    const changes = [];
    for (const { key } of ROUNDS) {
      const orig = originalScoringRows[key];
      const edited = editedScoringRows[key];
      // Check bracket changes
      if (orig.bracketHit !== edited.bracketHit || orig.bracketBullseye !== edited.bracketBullseye) {
        changes.push({
          predictionType: 'bracket',
          round: key,
          hitPoints: edited.bracketHit,
          bullseyePoints: edited.bracketBullseye,
        });
      }
      // Check matchup changes
      if (orig.matchupHit !== edited.matchupHit || orig.matchupBullseye !== edited.matchupBullseye) {
        changes.push({
          predictionType: 'matchup',
          round: key,
          hitPoints: edited.matchupHit,
          bullseyePoints: edited.matchupBullseye,
        });
      }
    }
    if (changes.length === 0) return;
    setScoringSaving(true);
    try {
      await onUpdateScoring(changes);
      setEditedScoringRows(null); // reset dirty state — fresh data will come via props
    } catch (err) {
      if (window.notify) window.notify.error(err.message || 'Failed to update scoring config');
    } finally {
      setScoringSaving(false);
    }
  };

  // --- Championship Points state ---
  const originalTeamPoints = useMemo(
    () => (teams?.length ? buildTeamPointsMap(teams) : null),
    [teams]
  );
  const [editedTeamPoints, setEditedTeamPoints] = useState(null);

  const teamPoints = editedTeamPoints ?? originalTeamPoints;

  const handleTeamPointsChange = useCallback((teamId, value) => {
    setEditedTeamPoints(prev => {
      const base = prev ?? originalTeamPoints;
      return { ...base, [teamId]: value === '' ? '' : Number(value) };
    });
  }, [originalTeamPoints]);

  const isTeamsDirty = useMemo(() => {
    if (!editedTeamPoints || !originalTeamPoints) return false;
    return JSON.stringify(editedTeamPoints) !== JSON.stringify(originalTeamPoints);
  }, [editedTeamPoints, originalTeamPoints]);

  const [teamsSaving, setTeamsSaving] = useState(false);

  const handleSaveTeams = async () => {
    if (!editedTeamPoints || !originalTeamPoints) return;
    const changes = [];
    for (const teamId of Object.keys(originalTeamPoints)) {
      if (originalTeamPoints[teamId] !== editedTeamPoints[teamId]) {
        if (editedTeamPoints[teamId] === '') {
          const teamName = teams.find(t => t.teamId === teamId)?.name || teamId;
          if (window.notify) window.notify.error(`Championship points cannot be empty for ${teamName}`);
          return;
        }
        changes.push({ teamId, championshipPoints: editedTeamPoints[teamId] });
      }
    }
    if (changes.length === 0) return;
    setTeamsSaving(true);
    try {
      await onUpdateTeam(changes);
      setEditedTeamPoints(null);
    } catch (err) {
      if (window.notify) window.notify.error(err.message || 'Failed to update championship points');
    } finally {
      setTeamsSaving(false);
    }
  };

  // --- MVP Points state ---
  const originalMvpPoints = useMemo(
    () => (mvpCandidates?.length ? buildMvpPointsMap(mvpCandidates) : null),
    [mvpCandidates]
  );
  const [editedMvpPoints, setEditedMvpPoints] = useState(null);

  const mvpPoints = editedMvpPoints ?? originalMvpPoints;

  const handleMvpPointsChange = useCallback((nbaPlayerId, value) => {
    setEditedMvpPoints(prev => {
      const base = prev ?? originalMvpPoints;
      return { ...base, [nbaPlayerId]: value === '' ? '' : Number(value) };
    });
  }, [originalMvpPoints]);

  const isMvpDirty = useMemo(() => {
    if (!editedMvpPoints || !originalMvpPoints) return false;
    return JSON.stringify(editedMvpPoints) !== JSON.stringify(originalMvpPoints);
  }, [editedMvpPoints, originalMvpPoints]);

  const [mvpSaving, setMvpSaving] = useState(false);

  const handleSaveMvp = async () => {
    if (!editedMvpPoints || !originalMvpPoints) return;
    const changes = [];
    for (const nbaPlayerId of Object.keys(originalMvpPoints)) {
      if (originalMvpPoints[nbaPlayerId] !== editedMvpPoints[nbaPlayerId]) {
        if (editedMvpPoints[nbaPlayerId] === '') {
          const playerName = mvpCandidates.find(c => c.nbaPlayerId === nbaPlayerId)?.name || nbaPlayerId;
          if (window.notify) window.notify.error(`MVP points cannot be empty for ${playerName}`);
          return;
        }
        changes.push({ nbaPlayerId, mvpPoints: editedMvpPoints[nbaPlayerId] });
      }
    }
    if (changes.length === 0) return;
    setMvpSaving(true);
    try {
      await onUpdateMvpPlayer(changes);
      setEditedMvpPoints(null);
    } catch (err) {
      if (window.notify) window.notify.error(err.message || 'Failed to update MVP points');
    } finally {
      setMvpSaving(false);
    }
  };

  // Sort teams by championship points ascending (favourite -> underdog)
  const sortedTeams = useMemo(
    () => teams ? [...teams].sort((a, b) => (a.championshipPoints ?? 0) - (b.championshipPoints ?? 0)) : [],
    [teams]
  );

  // Sort MVP candidates by points ascending (favourite -> underdog)
  const sortedMvpCandidates = useMemo(
    () => mvpCandidates ? [...mvpCandidates].sort((a, b) => (a.mvpPoints ?? 0) - (b.mvpPoints ?? 0)) : [],
    [mvpCandidates]
  );

  const championTeam = useMemo(
    () => (teams?.length === 1 ? teams[0] : null),
    [teams]
  );

  const eligibleActualMvpCandidates = useMemo(
    () => (
      championTeam
        ? sortedMvpCandidates.filter(candidate => candidate.teamId === championTeam.teamId)
        : []
    ),
    [championTeam, sortedMvpCandidates]
  );

  const [selectedActualMvpId, setSelectedActualMvpId] = useState('');
  const [actualMvpSaving, setActualMvpSaving] = useState(false);

  useEffect(() => {
    if (!championTeam || eligibleActualMvpCandidates.length === 0) {
      setSelectedActualMvpId('');
      return;
    }

    if (!eligibleActualMvpCandidates.some(candidate => candidate.nbaPlayerId === selectedActualMvpId)) {
      setSelectedActualMvpId(eligibleActualMvpCandidates[0].nbaPlayerId);
    }
  }, [championTeam, eligibleActualMvpCandidates, selectedActualMvpId]);

  const handlePickActualMvp = async () => {
    if (!selectedActualMvpId) return;

    setActualMvpSaving(true);
    try {
      await onPickActualMvp(selectedActualMvpId);
    } catch (err) {
      // Notification is handled by the page-level callback.
    } finally {
      setActualMvpSaving(false);
    }
  };

  // --- Render ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!scoringConfig) return null;

  return (
    <Box>
      <Stack spacing={4}>
        {/* Section 1: Round Scoring */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Round Scoring
          </Typography>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Round</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{isMobile ? 'B. Hit' : 'Bracket Hit'}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{isMobile ? 'B. Bull' : 'Bracket Bullseye'}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{isMobile ? 'M. Hit' : 'Matchup Hit'}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{isMobile ? 'M. Bull' : 'Matchup Bullseye'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scoringRows && ROUNDS.map(({ key, label, shortLabel }) => {
                  const row = scoringRows[key];
                  const isPlayIn = PLAY_IN_ROUNDS.has(key);
                  return (
                    <TableRow key={key}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{isMobile ? shortLabel : label}</TableCell>
                      <TableCell align="center" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        <TextField
                          type="number"
                          size="small"
                          value={row.bracketHit}
                          onChange={(e) => handleScoringChange(key, 'bracketHit', e.target.value)}
                          slotProps={{ htmlInput: { min: 0 } }}
                          sx={{ width: inputWidth }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        {isPlayIn ? (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        ) : (
                          <TextField
                            type="number"
                            size="small"
                            value={row.bracketBullseye ?? ''}
                            onChange={(e) => handleScoringChange(key, 'bracketBullseye', e.target.value)}
                            slotProps={{ htmlInput: { min: 0 } }}
                            sx={{ width: inputWidth }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        <TextField
                          type="number"
                          size="small"
                          value={row.matchupHit}
                          onChange={(e) => handleScoringChange(key, 'matchupHit', e.target.value)}
                          slotProps={{ htmlInput: { min: 0 } }}
                          sx={{ width: inputWidth }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        {isPlayIn ? (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        ) : (
                          <TextField
                            type="number"
                            size="small"
                            value={row.matchupBullseye ?? ''}
                            onChange={(e) => handleScoringChange(key, 'matchupBullseye', e.target.value)}
                            slotProps={{ htmlInput: { min: 0 } }}
                            sx={{ width: inputWidth }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              disabled={!isScoringDirty || scoringSaving}
              onClick={handleSaveScoring}
            >
              {scoringSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>

        {/* Section 2: Championship Points */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Championship Points
          </Typography>
          {sortedTeams.length > 0 ? (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      {!isMobile && <TableCell>Conference</TableCell>}
                      <TableCell align="center">Seed</TableCell>
                      <TableCell align="center">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedTeams.map((team) => (
                      <TableRow key={team.teamId}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{team.name}</TableCell>
                        {!isMobile && <TableCell>{team.conference}</TableCell>}
                        <TableCell align="center">{team.seed ?? '—'}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={teamPoints?.[team.teamId] ?? 0}
                            onChange={(e) => handleTeamPointsChange(team.teamId, e.target.value)}
                            slotProps={{ htmlInput: { min: 0 } }}
                            sx={{ width: inputWidth }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  disabled={!isTeamsDirty || teamsSaving}
                  onClick={handleSaveTeams}
                >
                  {teamsSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No teams available
            </Typography>
          )}
        </Paper>

        {/* Section 3: MVP Points */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            MVP Points
          </Typography>
          {sortedMvpCandidates.length > 0 ? (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Player</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell align="center">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedMvpCandidates.map((candidate) => (
                      <TableRow key={candidate.nbaPlayerId}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{candidate.name}</TableCell>
                        <TableCell>{candidate.teamName}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={mvpPoints?.[candidate.nbaPlayerId] ?? 0}
                            onChange={(e) => handleMvpPointsChange(candidate.nbaPlayerId, e.target.value)}
                            slotProps={{ htmlInput: { min: 0 } }}
                            sx={{ width: inputWidth }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  disabled={!isMvpDirty || mvpSaving}
                  onClick={handleSaveMvp}
                >
                  {mvpSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No MVP candidates available
            </Typography>
          )}
        </Paper>

        {/* Section 4: Actual Finals MVP */}        
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Actual Finals MVP
          </Typography>

          {!championTeam ? (
            <Typography variant="body2" color="text.secondary">
              Available after the Finals complete and exactly one active team remains.
            </Typography>
          ) : eligibleActualMvpCandidates.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No active MVP candidates are available for {championTeam.name}.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Alert severity="info">
                Finals winner: {championTeam.name}. Selecting the actual MVP will award bonus points to matching picks
                and mark the other active players on that roster as eliminated.
              </Alert>

              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                sx={{ alignItems: isMobile ? 'stretch' : 'flex-end' }}
              >
                <TextField
                  select
                  fullWidth={isMobile}
                  label="Actual MVP"
                  value={selectedActualMvpId}
                  onChange={(event) => setSelectedActualMvpId(event.target.value)}
                  sx={{ minWidth: isMobile ? 'auto' : 320 }}
                >
                  {eligibleActualMvpCandidates.map((candidate) => (
                    <MenuItem key={candidate.nbaPlayerId} value={candidate.nbaPlayerId}>
                      {candidate.name} ({candidate.mvpPoints} pts)
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  disabled={!selectedActualMvpId || actualMvpSaving}
                  onClick={handlePickActualMvp}
                >
                  {actualMvpSaving ? 'Saving...' : 'Set Actual MVP'}
                </Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default ScoringConfigTab;
