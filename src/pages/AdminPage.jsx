import React, { useState, useEffect, useCallback } from 'react';
import { Box, Tab, Tabs, Typography, Alert } from '@mui/material';

import AdminServices from '../services/AdminServices';
import MatchupManagementTab from '../components/admin/MatchupManagementTab';
import StatsTab from '../components/admin/StatsTab';
import HealthTab from '../components/admin/HealthTab';

/**
 * Top-level admin dashboard page.
 * Owns all data state and passes down to tab components via props.
 * Stats and Health data are fetched lazily when their tab is selected.
 */
const AdminPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // Matchup state
  const [matchups, setMatchups] = useState([]);
  const [matchupsLoading, setMatchupsLoading] = useState(true);
  const [matchupsError, setMatchupsError] = useState(null);
  const [filters, setFilters] = useState({ status: '', round: '', conference: '' });

  // Stats state (lazy loaded)
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // Health state (lazy loaded)
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState(null);

  // Fetch matchups with current filters
  const fetchMatchups = useCallback(async () => {
    try {
      setMatchupsLoading(true);
      setMatchupsError(null);
      const result = await AdminServices.getMatchups(filters);
      setMatchups(result.matchups);
    } catch (err) {
      setMatchupsError(err.message || 'Failed to load matchups');
    } finally {
      setMatchupsLoading(false);
    }
  }, [filters]);

  // Fetch matchups on mount and when filters change
  useEffect(() => {
    fetchMatchups();
  }, [fetchMatchups]);

  // Fetch stats when Stats tab is selected (lazy)
  const fetchStats = useCallback(async () => {
    if (stats) return; // Already loaded
    try {
      setStatsLoading(true);
      setStatsError(null);
      const result = await AdminServices.getPlayerStats();
      setStats(result);
    } catch (err) {
      setStatsError(err.message || 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, [stats]);

  // Fetch health when Health tab is selected (lazy)
  const fetchHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      setHealthError(null);
      const result = await AdminServices.getHealthCheck();
      setHealth(result);
    } catch (err) {
      setHealthError(err.message || 'Failed to load health check');
    } finally {
      setHealthLoading(false);
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
    await AdminServices.activateMatchup(matchupId);
    if (window.notify) window.notify.success('Matchup activated');
    await fetchMatchups();
  };

  const handleUpdateScore = async (matchupId, scores) => {
    await AdminServices.updateMatchupScore(matchupId, scores);
    await fetchMatchups();
  };

  const handleCreateMatchup = async (data) => {
    await AdminServices.createMatchup(data);
    if (window.notify) window.notify.success('Matchup created');
    await fetchMatchups();
  };

  // Extract unique teams from matchup data for the create dialog
  const teams = React.useMemo(() => {
    const teamMap = new Map();
    matchups.forEach(m => {
      if (!teamMap.has(m.homeTeam.teamId)) {
        teamMap.set(m.homeTeam.teamId, m.homeTeam);
      }
      if (!teamMap.has(m.awayTeam.teamId)) {
        teamMap.set(m.awayTeam.teamId, m.awayTeam);
      }
    });
    return Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [matchups]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Matchup Management" />
        <Tab label="Stats" />
        <Tab label="Health" />
      </Tabs>

      {/* Tab 0: Matchup Management */}
      {tabIndex === 0 && (
        <MatchupManagementTab
          matchups={matchups}
          loading={matchupsLoading}
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
          loading={statsLoading}
          error={statsError}
        />
      )}

      {/* Tab 2: Health */}
      {tabIndex === 2 && (
        <HealthTab
          health={health}
          loading={healthLoading}
          error={healthError}
          onRefresh={fetchHealth}
        />
      )}
    </Box>
  );
};

export default AdminPage;
