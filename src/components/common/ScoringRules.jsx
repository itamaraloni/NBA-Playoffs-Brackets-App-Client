import React, { useState } from 'react';
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
  useTheme,
  Collapse,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';
import { BsBullseye } from 'react-icons/bs';
import { TbCrystalBall } from 'react-icons/tb';

/**
 * Reusable scoring rules component with expandable details
 */
const ScoringRules = ({ showTitle = true, elevation = 2 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState({
    championship: false,
    mvp: false,
    bullsEye: false,
    hit: false
  });

  // Custom styling to align React icons with Material-UI icons
  const reactIconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24
  };

  // Toggle expansion state
  const handleToggle = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Round-based scoring data
  const roundScoring = [
    { round: 'Play-in', hit: 2, bullsEye: 2, notes: 'Single elimination games - hit and bulls-eye are the same' },
    { round: 'First Round', hit: 4, bullsEye: 6, notes: '' },
    { round: 'Conference Semifinals', hit: 6, bullsEye: 9, notes: '' },
    { round: 'Conference Finals', hit: 8, bullsEye: 12, notes: '' },
    { round: 'NBA Finals', hit: 10, bullsEye: 15, notes: '' }
  ];

  return (
    <Card elevation={elevation}>
      <CardContent>
        {showTitle && (
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'medium' }}>
            Scoring Rules
          </Typography>
        )}
        
        <List dense={isMobile}>
          {/* Championship Prediction */}
          <ListItem 
            alignItems="flex-start"
            secondaryAction={
              <IconButton 
                edge="end" 
                size="small"
                onClick={() => handleToggle('championship')}
              >
                {expanded.championship ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            }
          >
            <ListItemIcon>
              <TrophyIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Correct championship team prediction" />
          </ListItem>
          <Collapse in={expanded.championship} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
              <Typography variant="body2" color="text.secondary">
              The points you earn for predicting the championship team are adjusted based on that team's odds to win;
              selecting a heavy favorite yields fewer points, while correctly predicting an underdog rewards you with more points.
              </Typography>
            </Box>
          </Collapse>
          <Divider component="li" />

          {/* MVP Prediction */}
          <ListItem 
            alignItems="flex-start"
            secondaryAction={
              <IconButton 
                edge="end" 
                size="small"
                onClick={() => handleToggle('mvp')}
              >
                {expanded.mvp ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            }
          >
            <ListItemIcon>
              <MvpIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Correct MVP prediction" />
          </ListItem>
          <Collapse in={expanded.mvp} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
              <Typography variant="body2" color="text.secondary">
              The points you earn for predicting the MVP are adjusted based on that player's odds to win;
              selecting a heavy favorite yields fewer points, while correctly predicting an underdog rewards you with more points.
              </Typography>
            </Box>
          </Collapse>
          <Divider component="li" />

          {/* Hit Prediction */}
          <ListItem 
            alignItems="flex-start"
            secondaryAction={
              <IconButton 
                edge="end" 
                size="small"
                onClick={() => handleToggle('hit')}
              >
                {expanded.hit ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            }
          >
            <ListItemIcon>
              <div style={reactIconStyle}>
                <BsBullseye size={20} style={{ color: theme.palette.warning.main }} />
              </div>
            </ListItemIcon>
            <ListItemText 
              primary="Hit prediction: Correct series winner" 
              secondary={!expanded.hit ? "Points increase with each playoff round" : ""}
            />
          </ListItem>
          <Collapse in={expanded.hit} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Hit predictions award points for correctly predicting just the winner of a series,
                regardless of the number of games.
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Playoff Round</TableCell>
                      <TableCell align="center">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roundScoring.map((row) => (
                      <TableRow key={row.round}>
                        <TableCell component="th" scope="row">
                          {row.round}
                        </TableCell>
                        <TableCell align="center">{row.hit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
          <Divider component="li" />

          {/* Bulls-Eye Prediction */}
          <ListItem 
            alignItems="flex-start"
            secondaryAction={
              <IconButton 
                edge="end" 
                size="small"
                onClick={() => handleToggle('bullsEye')}
              >
                {expanded.bullsEye ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            }
          >
            <ListItemIcon>
              <div style={reactIconStyle}>
                <TbCrystalBall size={20} style={{ color: theme.palette.success.main }} />
              </div>
            </ListItemIcon>
            <ListItemText 
              primary="Bulls-Eye prediction: Exact series outcome" 
              secondary={!expanded.bullsEye ? "Points increase with each playoff round" : ""}
            />
          </ListItem>
          <Collapse in={expanded.bullsEye} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 9, pr: 2, pb: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bulls-Eye predictions award points for correctly predicting both the winner and 
                the exact number of games in a series.
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Playoff Round</TableCell>
                      <TableCell align="center">Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roundScoring.map((row) => (
                      <TableRow key={row.round}>
                        <TableCell component="th" scope="row">
                          {row.round}
                        </TableCell>
                        <TableCell align="center">{row.bullsEye}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {!isMobile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Note: For Play-in games, hit and bulls-eye are the same (single elimination).
                </Typography>
              )}
            </Box>
          </Collapse>
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