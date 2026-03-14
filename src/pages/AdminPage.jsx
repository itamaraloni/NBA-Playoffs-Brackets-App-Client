import { useState, useEffect, useCallback } from 'react';
import { Box, Tab, Tabs, Typography, Alert, useTheme, useMediaQuery } from '@mui/material';

import MatchupManagementTab from '../components/admin/MatchupManagementTab';
import StatsTab from '../components/admin/StatsTab';
import HealthTab from '../components/admin/HealthTab';
import AdminServices from '../services/AdminServices';

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
      const result = await AdminServices.getTeams();
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

  // Handle tab change with lazy loading
  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
    if (newIndex === 1) fetchStats();
    if (newIndex === 2) fetchHealth();
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
      await fetchMatchups();
    } catch (err) {
      if (window.notify) window.notify.error(err.message || 'Failed to update score');
    }
  };

  const handleCreateMatchup = async (data) => {
    await AdminServices.createMatchup(data);
    if (window.notify) window.notify.success('Matchup created');
    await fetchMatchups();
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
    </Box>
  );
};

export default AdminPage;
