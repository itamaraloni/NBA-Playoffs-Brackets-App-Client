import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';

/**
 * Compact helper for playerless dashboard empty state.
 */
const AppExplanation = ({ elevation = 2 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollRef = useRef(null);
  const stepRefs = useRef([]);
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      number: 1,
      eyebrow: 'League',
      title: 'Create or join a league',
      description: 'Head to Profile to start a league of your own or join one from an invite link.',
    },
    {
      number: 2,
      eyebrow: 'Player',
      title: 'Finish your player setup',
      description: 'Choose your avatar, championship team, and Finals MVP to unlock the full app.',
    },
    {
      number: 3,
      eyebrow: 'Compete',
      title: 'Submit your bracket and live picks',
      description: 'Lock in your bracket, then come back before each series to make live picks.',
    },
  ];

  const handleScroll = useCallback((event) => {
    const container = event.currentTarget;
    const nextStep = Math.round(container.scrollLeft / container.clientWidth);
    setActiveStep(Math.min(Math.max(nextStep, 0), steps.length - 1));
  }, [steps.length]);

  const scrollToStep = useCallback((index) => {
    stepRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    setActiveStep(index);
  }, []);

  const renderStepCard = (step, index, mobile = false) => (
    <Box
      key={step.number}
      ref={(node) => {
        stepRefs.current[index] = node;
      }}
      sx={{
        textAlign: 'center',
        p: mobile ? 2.5 : 2,
        minHeight: mobile ? 210 : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        border: mobile ? `1px solid ${theme.palette.divider}` : 'none',
        bgcolor: mobile ? 'background.default' : 'transparent',
        scrollSnapAlign: mobile ? 'start' : undefined,
        flexShrink: mobile ? 0 : undefined,
        width: mobile ? '100%' : undefined,
        boxSizing: 'border-box',
      }}
    >
      <Avatar 
        sx={{ 
          width: 48, 
          height: 48, 
          bgcolor: theme.palette.info.main,
          mx: 'auto',
          mb: 2
        }}
      >
        {step.number}
      </Avatar>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 1.2, lineHeight: 1.6 }}
      >
        {step.eyebrow}
      </Typography>
      <Typography variant="subtitle1" fontWeight="medium">
        {step.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {step.description}
      </Typography>
    </Box>
  );

  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: { xs: 2.5, sm: 3 },
        borderRadius: 2,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Typography variant="h6" fontWeight="medium">
        Get Started
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>
        You do not have a player in a league yet. These are the next steps to get into the app.
      </Typography>

      {isMobile ? (
        <Box>
          <Box
            ref={scrollRef}
            onScroll={handleScroll}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              gap: 2,
              px: 0,
              pb: 1,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {steps.map((step, index) => renderStepCard(step, index, true))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            {steps.map((step, index) => (
              <Box
                key={step.number}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${step.number}`}
                onClick={() => scrollToStep(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    scrollToStep(index);
                  }
                }}
                sx={{
                  width: index === activeStep ? 22 : 10,
                  height: 10,
                  borderRadius: 999,
                  bgcolor: index === activeStep ? 'info.main' : 'action.disabled',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            ))}
          </Box>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1.5 }}>
            Swipe between the steps
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={step.number}>
              {renderStepCard(step, index)}
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

AppExplanation.propTypes = {
  elevation: PropTypes.number
};

export default AppExplanation;
