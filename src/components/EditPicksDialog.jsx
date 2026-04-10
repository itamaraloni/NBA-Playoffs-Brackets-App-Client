import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Avatar,
  Autocomplete,
  TextField,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const selectedOption = options.find((item) => item.name === selection) || null;

  const autocompleteInputProps = (params) => (
    isMobile
      ? {
          ...params.inputProps,
          readOnly: true,
          inputMode: 'none',
          autoComplete: 'off',
          autoCorrect: 'off',
          spellCheck: false,
        }
      : params.inputProps
  );

  const mobileAutocompleteProps = isMobile
    ? {
        openOnFocus: true,
        blurOnSelect: true,
      }
    : {};

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
        <Autocomplete
          options={options}
          loading={optionsLoading}
          value={selectedOption}
          onChange={(event, newValue) => {
            setSelection(newValue ? newValue.name : '');
          }}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          fullWidth
          disableClearable
          disabled={optionsLoading}
          {...mobileAutocompleteProps}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;

            return (
              <Box key={key} component="li" {...optionProps} sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
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
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', minWidth: 56, textAlign: 'right', flexShrink: 0 }}>
                  {option.points} pts
                </Typography>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={type === 'championship' ? 'Championship Winner' : 'Finals MVP'}
              color={getColor()}
              inputProps={autocompleteInputProps(params)}
            />
          )}
        />
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
