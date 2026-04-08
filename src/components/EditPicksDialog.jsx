import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  useTheme,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon
} from '@mui/icons-material';
import { useTeams } from '../hooks/useTeams';
import { useMvpCandidates } from '../hooks/useMvpCandidates';
import { PLAYIN_START_DATE } from '../shared/SeasonConfig';
import { getLogoPath } from '../shared/teamUtils';
import { getPlayerAvatar } from '../shared/playerUtils';

const EditPicksDialog = ({ open, onClose, type, player, onSave }) => {
  const theme = useTheme();
  const { teams, loading: teamsLoading } = useTeams();
  const { mvpCandidates, loading: mvpLoading } = useMvpCandidates();
  const [isEditWindowClosed, setIsEditWindowClosed] = useState(
    () => Date.now() >= PLAYIN_START_DATE.getTime()
  );
  const [selection, setSelection] = useState(
    type === 'championship' 
      ? (player?.championshipPrediction || '') 
      : (player?.mvpPrediction || '')
  );

  // Update selection when type or player changes
  useEffect(() => {
    setSelection(
      type === 'championship'
        ? (player?.championshipPrediction || '')
        : (player?.mvpPrediction || '')
    );
  }, [type, player]);

  useEffect(() => {
    const deadlineTimestamp = PLAYIN_START_DATE.getTime();

    if (Date.now() >= deadlineTimestamp) {
      setIsEditWindowClosed(true);
      return undefined;
    }

    setIsEditWindowClosed(false);
    const timeoutId = window.setTimeout(() => {
      setIsEditWindowClosed(true);
    }, deadlineTimestamp - Date.now());

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (open && isEditWindowClosed) {
      onClose();
    }
  }, [open, isEditWindowClosed, onClose]);

  const handleChange = (event) => {
    setSelection(event.target.value);
  };

  const handleSave = () => {
    onSave(type, selection);
    onClose();
  };

  const getTitle = () => {
    return type === 'championship' 
      ? 'Edit Championship Winner Pick' 
      : 'Edit Finals MVP Pick';
  };

  const getOptions = () => {
    if (type === 'championship') {
      return (teams || [])
        .map(t => ({
          name: t.name,
          points: t.championshipPoints,
          avatarSrc: getLogoPath(t.name),
        }))
        .sort((a, b) => a.points - b.points);
    }
    return (mvpCandidates || [])
      .map(c => ({
        name: c.name,
        points: c.mvpPoints,
        teamName: c.teamName,
        avatarSrc: getPlayerAvatar(c.name),
      }))
      .sort((a, b) => a.points - b.points);
  };

  const optionsLoading = type === 'championship' ? teamsLoading : mvpLoading;
  const options = getOptions();

  const getIcon = () => {
    return type === 'championship' 
      ? <TrophyIcon sx={{ color: 'gold', mr: 1 }} />
      : <MvpIcon sx={{ color: 'gold', mr: 1 }} />;
  };

  const getColor = () => {
    return type === 'championship' ? 'primary' : 'secondary';
  };

  if (isEditWindowClosed) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: type === 'championship' 
          ? theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(232, 244, 253, 0.8)'
          : theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.08)' : 'rgba(243, 229, 245, 0.8)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getIcon()}
          <Typography variant="h6">{getTitle()}</Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          You can edit your predictions until {PLAYIN_START_DATE.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Current selection: <strong>{
            type === 'championship' ? player?.championshipPrediction : player?.mvpPrediction
          }</strong>
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="edit-prediction-label">
            {type === 'championship' ? 'Championship Winner' : 'Finals MVP'}
          </InputLabel>
          <Select
            labelId="edit-prediction-label"
            value={selection}
            label={type === 'championship' ? 'Championship Winner' : 'Finals MVP'}
            onChange={handleChange}
            color={getColor()}
            disabled={optionsLoading}
            renderValue={(value) => {
              const option = options.find((item) => item.name === value);
              if (!option) return value;

              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                  <Avatar src={option.avatarSrc} alt={option.name} variant="rounded" sx={{ width: 28, height: 28 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {option.name}
                    </Typography>
                    {option.teamName && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {option.teamName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            }}
          >
            {options.map((option) => (
              <MenuItem key={option.name} value={option.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                    <Avatar src={option.avatarSrc} alt={option.name} variant="rounded" sx={{ width: 32, height: 32 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {option.name}
                      </Typography>
                      {option.teamName && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {option.teamName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
                    {option.points} pts
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color={getColor()}
          disabled={!selection || 
            (selection === (type === 'championship' 
              ? player?.championshipPrediction 
              : player?.mvpPrediction))}
        >
          Save Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditPicksDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['championship', 'mvp']).isRequired,
  player: PropTypes.shape({
    id: PropTypes.string,
    championshipPrediction: PropTypes.string,
    mvpPrediction: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired
};

export default EditPicksDialog;
