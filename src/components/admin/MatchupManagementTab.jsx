import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import MatchupTable from './MatchupTable';
import CreateMatchupDialog from './CreateMatchupDialog';
import PredictionStatsDialog from './PredictionStatsDialog';

const ROUND_OPTIONS = [
  { value: '', label: 'All Rounds' },
  { value: 'playin_first', label: 'Play-In (1st)' },
  { value: 'playin_second', label: 'Play-In (2nd)' },
  { value: 'first', label: 'First Round' },
  { value: 'second', label: 'Conference Semis' },
  { value: 'conference_final', label: 'Conference Finals' },
  { value: 'final', label: 'NBA Finals' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const CONFERENCE_OPTIONS = [
  { value: '', label: 'All Conferences' },
  { value: 'Eastern', label: 'Eastern' },
  { value: 'Western', label: 'Western' },
  { value: 'Final', label: 'Finals' },
];

/**
 * Matchup Management tab — filter controls, matchup table, create dialog.
 *
 * Filters use controlled <Select> components that update the parent's filter state.
 * When a filter changes, the parent re-fetches matchups with the new filters.
 */
const MatchupManagementTab = ({
  matchups,
  loading,
  error,
  filters,
  onFiltersChange,
  onActivate,
  onUpdateScore,
  onCreate,
  onOpenCreate,
  teams,
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedMatchupId, setSelectedMatchupId] = useState(null);

  const handleFilterChange = (field) => (event) => {
    onFiltersChange({ ...filters, [field]: event.target.value });
  };

  const handleViewStats = (matchupId) => {
    setSelectedMatchupId(matchupId);
    setStatsDialogOpen(true);
  };

  useEffect(() => {
    if (createDialogOpen && onOpenCreate) {
      onOpenCreate();
    }
  }, [createDialogOpen, onOpenCreate]);

  return (
    <Box>
      {/* Filter controls + Create button */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={handleFilterChange('status')}
          >
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Round</InputLabel>
          <Select
            value={filters.round}
            label="Round"
            onChange={handleFilterChange('round')}
          >
            {ROUND_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Conference</InputLabel>
          <Select
            value={filters.conference}
            label="Conference"
            onChange={handleFilterChange('conference')}
          >
            {CONFERENCE_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Matchup
        </Button>
      </Stack>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <MatchupTable
          matchups={matchups}
          onActivate={onActivate}
          onUpdateScore={onUpdateScore}
          onViewStats={handleViewStats}
        />
      )}

      {/* Create matchup dialog */}
      <CreateMatchupDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={onCreate}
        teams={teams}
      />

      {/* Prediction stats dialog */}
      <PredictionStatsDialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        matchupId={selectedMatchupId}
      />
    </Box>
  );
};

export default MatchupManagementTab;
