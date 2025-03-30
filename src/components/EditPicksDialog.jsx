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
  TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon
} from '@mui/icons-material';
import { NBA_TEAMS, MVP_CANDIDATES } from '../shared/GeneralConsts';

const EditPicksDialog = ({ open, onClose, type, player, onSave }) => {
  const theme = useTheme();
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
      : 'Edit MVP Pick';
  };

  const getOptions = () => {
    return type === 'championship' ? NBA_TEAMS : MVP_CANDIDATES;
  };

  const getIcon = () => {
    return type === 'championship' 
      ? <TrophyIcon sx={{ color: 'gold', mr: 1 }} />
      : <MvpIcon sx={{ color: 'gold', mr: 1 }} />;
  };

  const getColor = () => {
    return type === 'championship' ? 'primary' : 'secondary';
  };

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
          You can edit your predictions until April 14, 2025, 11:59 PM.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Current selection: <strong>{
            type === 'championship' ? player?.championshipPrediction : player?.mvpPrediction
          }</strong>
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="edit-prediction-label">
            {type === 'championship' ? 'Championship Winner' : 'MVP Player'}
          </InputLabel>
          <Select
            labelId="edit-prediction-label"
            value={selection}
            label={type === 'championship' ? 'Championship Winner' : 'MVP Player'}
            onChange={handleChange}
            color={getColor()}
          >
            {getOptions().map((option) => (
              <MenuItem key={option} value={option}>
                {option}
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