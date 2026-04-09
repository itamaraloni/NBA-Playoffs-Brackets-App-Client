import { useState, useEffect, useCallback } from 'react';
import { Box, Tab, Tabs, Typography, Alert, useTheme, useMediaQuery } from '@mui/material';

import MatchupManagementTab from '../components/admin/MatchupManagementTab';
import StatsTab from '../components/admin/StatsTab';
import HealthTab from '../components/admin/HealthTab';
import ScoringConfigTab from '../components/admin/ScoringConfigTab';
import AdminServices from '../services/AdminServices';
import ConfigServices from '../services/ConfigServices';
import { clearScoringConfigCache } from '../hooks/useScoringConfig';
import { clearTeamsCache } from '../hooks/useTeams';
import { clearMvpCandidatesCache } from '../hooks/useMvpCandidates';

/**
 * Top-level admin dashboard page.
 * Owns all data state and passes down to tab components via props.
 * Stats and Health data are fetched lazily when their tab is selected.
 */
const AdminPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabIndex, setTabIndex] = useState(0);

  // Matchup state
  const [matchups, setMatchups] = useState([]);
  const [isMatchupsLoading, setIsMatchupsLoading] = useState(true);
  const [matchupsError, setMatchupsError] = useState(null);
  const [filters, setFilters] = useState({ status: '', round: '', conference: '' });

  // Teams state (fetched independently for the create-matchup dropdown)
  const [teams, setTeams] = useState([]);

  // Stats state (lazy loaded)
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // Health state (lazy loaded)
  const [health, setHealth] = useState(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState(null);

  // Config state (lazy loaded)
  const [configScoring, setConfigScoring] = useState(null);
  const [configMvp, setConfigMvp] = useState(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [configError, setConfigError] = useState(null);

  // Fetch matchups with current filters
  const fetchMatchups = useCallback(async () => {
    try {
      setIsMatchupsLoading(true);
      setMatchupsError(null);
      const result = await AdminServices.getMatchups(filters);
      setMatchups(result.matchups);
    } catch (err) {
      setMatchupsError(err.message || 'Failed to load matchups');
    } finally {
      setIsMatchupsLoading(false);
    }
  }, [filters]);

  // Fetch teams once on mount (active teams for the create-matchup dropdown)
  const fetchTeams = useCallback(async () => {
    try {
      const result = await ConfigServices.getTeams();
      setTeams(result);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  }, []);

  // Fetch matchups and teams on mount; matchups also re-fetch when filters change
  useEffect(() => {
    fetchMatchups();
  }, [fetchMatchups]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Fetch stats when Stats tab is selected (lazy)
  const fetchStats = useCallback(async () => {
    if (stats) return; // Already loaded
    try {
      setIsStatsLoading(true);
      setStatsError(null);
      const result = await AdminServices.getPlayerStats();
      setStats(result);
    } catch (err) {
      setStatsError(err.message || 'Failed to load stats');
    } finally {
      setIsStatsLoading(false);
    }
  }, [stats]);

  // Fetch health when Health tab is selected (lazy)
  const fetchHealth = useCallback(async () => {
    try {
      setIsHealthLoading(true);
      setHealthError(null);
      const result = await AdminServices.getHealthCheck();
      setHealth(result);
    } catch (err) {
      setHealthError(err.message || 'Failed to load health check');
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  // Fetch config data when Config tab is selected (lazy)
  const fetchConfigData = useCallback(async () => {
    try {
      setIsConfigLoading(true);
      setConfigError(null);
      const [scoring, mvp] = await Promise.all([
        ConfigServices.getScoringConfig(),
        ConfigServices.getMvpCandidates(),
      ]);
      setConfigScoring(scoring);
      setConfigMvp(mvp);
    } catch (err) {
      setConfigError(err.message || 'Failed to load config');
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  // Handle tab change with lazy loading
  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
    if (newIndex === 1) fetchStats();
    if (newIndex === 2) fetchHealth();
    if (newIndex === 3) fetchConfigData();
  };

  // Matchup mutation callbacks — refresh list after success
  const handleActivateMatchup = async (matchupId) => {
    try {
      await AdminServices.activateMatchup(matchupId);
      if (window.notify) window.notify.success('Matchup activated');
      await fetchMatchups();
    } catch (err) {
      if (window.notify) window.notify.error(err.message || 'Failed to activate matchup');
    }
  };

  const handleUpdateScore = async (matchupId, scores) => {
    try {
      await AdminServices.updateMatchupScore(matchupId, scores);
      if (window.notify) window.notify.success('Score updated');
      await Promise.all([fetchMatchups(), fetchTeams()]);
    } catch (err) {
      if (window.notify) window.notify.error(err.message || 'Failed to update score');
    }
  };

  const handleCreateMatchup = async (data) => {
    await AdminServices.createMatchup(data);
    if (window.notify) window.notify.success('Matchup created');
    await fetchMatchups();
  };

  // Config mutation callbacks
  const handleUpdateScoring = async (changes) => {
    try {
      await Promise.all(changes.map(c => AdminServices.updateScoringConfig(c)));
      if (window.notify) window.notify.success('Scoring config updated');
    } finally {
      clearScoringConfigCache();
      await fetchConfigData();
    }
  };

  const handleUpdateTeam = async (changes) => {
    try {
      await Promise.all(changes.map(c =>
        AdminServices.updateTeamChampionshipPoints(c.teamId, c.championshipPoints)
      ));
      if (window.notify) window.notify.success('Championship points updated');
    } finally {
      clearTeamsCache();
      await Promise.all([fetchConfigData(), fetchTeams()]);
    }
  };

  const handleUpdateMvpPlayer = async (changes) => {
    try {
      await Promise.all(changes.map(c =>
        AdminServices.updateNbaPlayerMvpPoints(c.nbaPlayerId, c.mvpPoints)
      ));
      if (window.notify) window.notify.success('MVP points updated');
    } finally {
      clearMvpCandidatesCache();
      await fetchConfigData();
    }
  };

  const handlePickActualMvp = async (nbaPlayerId) => {
    try {
      const result = await AdminServices.pickActualMvp(nbaPlayerId);
      if (window.notify) window.notify.success(`Actual MVP set to ${result.name}`);
    } catch (err) {
      if (window.notify) window.notify.error(err.message || 'Failed to set actual MVP');
      throw err;
    } finally {
      clearMvpCandidatesCache();
      await fetchConfigData();
    }
  };

  return (
    <Box>
      <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ mb: 3, fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={isMobile ? 'Matchups' : 'Matchup Management'} />
        <Tab label="Stats" />
        <Tab label="Health" />
        <Tab label={isMobile ? 'Config' : 'Scoring Config'} />
      </Tabs>

      {/* Tab 0: Matchup Management */}
      {tabIndex === 0 && (
        <MatchupManagementTab
          matchups={matchups}
          loading={isMatchupsLoading}
          error={matchupsError}
          filters={filters}
          onFiltersChange={setFilters}
          onActivate={handleActivateMatchup}
          onUpdateScore={handleUpdateScore}
          onCreate={handleCreateMatchup}
          onOpenCreate={fetchTeams}
          teams={teams}
        />
      )}

      {/* Tab 1: Stats */}
      {tabIndex === 1 && (
        <StatsTab
          stats={stats}
          loading={isStatsLoading}
          error={statsError}
        />
      )}

      {/* Tab 2: Health */}
      {tabIndex === 2 && (
        <HealthTab
          health={health}
          loading={isHealthLoading}
          error={healthError}
          onRefresh={fetchHealth}
        />
      )}

      {/* Tab 3: Scoring Config */}
      {tabIndex === 3 && (
        <ScoringConfigTab
          scoringConfig={configScoring}
          teams={teams}
          mvpCandidates={configMvp}
          loading={isConfigLoading}
          error={configError}
          onUpdateScoring={handleUpdateScoring}
          onUpdateTeam={handleUpdateTeam}
          onUpdateMvpPlayer={handleUpdateMvpPlayer}
          onPickActualMvp={handlePickActualMvp}
        />
      )}
    </Box>
  );
};

export default AdminPage;
