import React from 'react';
import { Box, Button, Typography } from '@mui/material';

/**
 * A reusable score counter component with increment/decrement buttons
 * 
 * @param {Object} props
 * @param {string} props.label - Label for the counter
 * @param {number} props.value - Current score value
 * @param {Function} props.onChange - Callback when value changes
 * @param {number} props.min - Minimum allowed value (default: 0)
 * @param {number} props.max - Maximum allowed value (default: 4)
 * @param {Object} props.sx - Additional styles
 */
const ScoreCounter = ({
  label,
  value,
  onChange,
  min = 0,
  max = 4,
  sx = {}
}) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - 1));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + 1));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      ...sx
    }}>
      <Typography gutterBottom textAlign="center">
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleDecrement}
          sx={{ minWidth: '40px' }}
        >
          -
        </Button>
        <Typography variant="h5" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
          {value}
        </Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleIncrement}
          sx={{ minWidth: '40px' }}
        >
          +
        </Button>
      </Box>
    </Box>
  );
};

export default ScoreCounter;