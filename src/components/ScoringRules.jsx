import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon,
  Star as CorrectSeriesScoreIcon,
  StarHalf as CorrectSeriesOutcomeIcon
} from '@mui/icons-material';

/**
 * Reusable scoring rules component
 */
const ScoringRules = ({ showTitle = true, elevation = 2 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card elevation={elevation}>
      <CardContent>
        {showTitle && (
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Scoring Rules
          </Typography>
        )}
        
        <List dense={isMobile}>
          <ListItem>
            <ListItemIcon>
              <TrophyIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Correct championship team prediction: 50 points" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <MvpIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Correct MVP prediction: 30 points" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <CorrectSeriesScoreIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Correct series socre prediction: 15 points per series" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <CorrectSeriesOutcomeIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Correct series outcome prediction: 10 additional points" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

ScoringRules.propTypes = {
  showTitle: PropTypes.bool,
  elevation: PropTypes.number
};

export default ScoringRules;