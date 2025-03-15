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
  MilitaryTech as MvpIcon
} from '@mui/icons-material';
import { BsBullseye } from 'react-icons/bs';
import { TbCrystalBall } from 'react-icons/tb';

/**
 * Reusable scoring rules component
 */
const ScoringRules = ({ showTitle = true, elevation = 2 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Custom styling to align React icons with Material-UI icons
  const reactIconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24
  };

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
              <MvpIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Correct MVP prediction: 30 points" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <div style={reactIconStyle}>
                <TbCrystalBall size={20} style={{ color: theme.palette.success.main }} />
              </div>
            </ListItemIcon>
            <ListItemText primary="Bulls-Eye prediction: 15 points per series" />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <div style={reactIconStyle}>
                <BsBullseye size={20} style={{ color: theme.palette.warning.main }} />
              </div>
            </ListItemIcon>
            <ListItemText primary="Outcome hit prediction: 10 points per series" />
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