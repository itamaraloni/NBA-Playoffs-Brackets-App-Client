import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

const Team = ({ 
  name, 
  logo, 
  seed, 
  conference 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%'
    }}>
      {logo && (
        <Avatar
          src={logo}
          alt={`${name} logo`}
          sx={{ 
            width: 48, 
            height: 48, 
            mb: 1 
          }}
          imgProps={{
            onError: (e) => {
              console.error(`Error loading logo for ${name}:`, e);
              e.target.style.display = 'none';
            }
          }}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 0.5 }}>
        {seed && (
          <Typography variant="subtitle2" sx={{ mr: 0.5 }}>
            #{seed}
          </Typography>
        )}
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {conference}
      </Typography>
    </Box>
  );
};

export default Team;