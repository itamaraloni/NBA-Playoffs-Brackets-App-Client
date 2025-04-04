import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import { TbCrystalBall } from 'react-icons/tb';
import { BsBullseye } from 'react-icons/bs';
import { AiOutlineCloseCircle } from 'react-icons/ai';

const PredictionStatsTable = ({ playerData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate points per round based on scoring rules
  const calculatePoints = (roundKey, hits, bullsEyes) => {
    // Default values
    let hitPoints = 0;
    let bullsEyePoints = 0;

    // Set point values based on round
    switch (roundKey) {
      case 'playin':
        hitPoints = 2;
        bullsEyePoints = 2; // Play-in games don't have bullseye (exact score)
        break;
      case 'first':
        hitPoints = 4;
        bullsEyePoints = 6;
        break;
      case 'second':
        hitPoints = 6;
        bullsEyePoints = 9;
        break;
      case 'conference_final':
        hitPoints = 8;
        bullsEyePoints = 12;
        break;
      case 'final':
        hitPoints = 10;
        bullsEyePoints = 15;
        break;
      default:
        hitPoints = 0;
        bullsEyePoints = 0;
    }

    // Calculate total points for this round
    return (hits * hitPoints) + (bullsEyes * bullsEyePoints);
  };

  // Generate stats rows for the table
  const generateStatsRows = () => {
    // First, handle Play-In rounds by combining them
    const playInHits = (playerData.hits?.playin_first || 0) + (playerData.hits?.playin_second || 0);
    const playInBullsEyes = (playerData.bullsEye?.playin_first || 0) + (playerData.bullsEye?.playin_second || 0);
    const playInMisses = (playerData.misses?.playin_first || 0) + (playerData.misses?.playin_second || 0);
    
    // Create array of rounds
    const rounds = [
      {
        key: 'playin',
        displayName: 'Play-In',
        hits: playInHits,
        bullsEyes: playInBullsEyes,
        misses: playInMisses
      },
      {
        key: 'first',
        displayName: 'First Round',
        hits: playerData.hits?.first || 0,
        bullsEyes: playerData.bullsEye?.first || 0,
        misses: playerData.misses?.first || 0
      },
      {
        key: 'second',
        displayName: 'Conference Semifinals',
        hits: playerData.hits?.second || 0,
        bullsEyes: playerData.bullsEye?.second || 0,
        misses: playerData.misses?.second || 0
      },
      {
        key: 'conference_final',
        displayName: 'Conference Finals',
        hits: playerData.hits?.conference_final || 0,
        bullsEyes: playerData.bullsEye?.conference_final || 0,
        misses: playerData.misses?.conference_final || 0
      },
      {
        key: 'final',
        displayName: 'NBA Finals',
        hits: playerData.hits?.final || 0,
        bullsEyes: playerData.bullsEye?.final || 0,
        misses: playerData.misses?.final || 0
      }
    ];

    // Calculate points and add them to each round
    return rounds.map(round => ({
      ...round,
      totalPoints: calculatePoints(round.key, round.hits, round.bullsEyes)
    }));
  };

  const statsRows = generateStatsRows();
  
  // Find the round with the most points (for highlighting)
  const maxPointsRound = statsRows.reduce((max, row) => 
    row.totalPoints > max.points ? { key: row.key, points: row.totalPoints } : max, 
    { key: null, points: -1 }
  );

  // Calculate totals
  const totalBullsEyes = statsRows.reduce((sum, row) => sum + row.bullsEyes, 0);
  const totalHits = statsRows.reduce((sum, row) => sum + row.hits, 0);
  const totalMisses = statsRows.reduce((sum, row) => sum + row.misses, 0);
  const grandTotal = statsRows.reduce((sum, row) => sum + row.totalPoints, 0);

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {statsRows.map((row) => (
            <Card 
            key={row.key} 
            variant="outlined" 
            sx={{ 
                mb: 2,
                bgcolor: row.key === maxPointsRound.key && row.totalPoints > 0 ? 
                'rgba(84, 194, 84, 0.6)' : 'inherit',
                border: row.key === maxPointsRound.key && row.totalPoints > 0 ?
                `2px solid ${theme.palette.success.main}` : undefined // border color
            }}
            >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {row.displayName}
                </Typography>
                
                {/* Stats in a table-like layout */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 1.5
                }}>                   
                    {/* Bulls-Eye row */}
                    <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    py: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`
                    }}>
                    <Box sx={{ 
                        width: '40%', 
                        display: 'flex', 
                        alignItems: 'center'
                    }}>
                        <TbCrystalBall style={{ color: theme.palette.success.main, marginRight: 4 }} size={16} />
                        <Typography variant="body2">Bulls-Eye</Typography>
                    </Box>
                    <Box sx={{ width: '60%', textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="medium">{row.bullsEyes}</Typography>
                    </Box>
                    </Box>
                    
                    {/* Hits row */}
                    <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    py: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`
                    }}>
                    <Box sx={{ 
                        width: '40%', 
                        display: 'flex', 
                        alignItems: 'center' 
                    }}>
                        <BsBullseye style={{ color: theme.palette.warning.main, marginRight: 4 }} size={16} />
                        <Typography variant="body2">Hits</Typography>
                    </Box>
                    <Box sx={{ width: '60%', textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="medium">{row.hits}</Typography>
                    </Box>
                    </Box>
                    
                    {/* Misses row */}
                    <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    py: 1
                    }}>
                    <Box sx={{ 
                        width: '40%', 
                        display: 'flex', 
                        alignItems: 'center' 
                    }}>
                        <AiOutlineCloseCircle style={{ color: theme.palette.error.main, marginRight: 4 }} size={16} />
                        <Typography variant="body2">Misses</Typography>
                    </Box>
                    <Box sx={{ width: '60%', textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="medium">{row.misses}</Typography>
                    </Box>
                    </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">Points Earned:</Typography>
                    <Typography variant="h6" fontWeight="bold" color={row.totalPoints > 0 ? theme.palette.success.main : 'inherit'}>
                    {row.totalPoints}
                    </Typography>
                </Box>
            </CardContent>
          </Card>
        ))}
        
        {/* Totals Card */}
        <Card variant="outlined" sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.08)', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.palette.divider}`
        }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
            Total Statistics
            </Typography>
            
            {/* Stats in a table-like layout */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 1,
                overflow: 'hidden',
                mb: 1.5
            }}>
            {/* Bulls-Eye row */}
            <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 1,
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <Box sx={{ 
                    width: '40%', 
                    display: 'flex', 
                    alignItems: 'center'
                }}>
                <TbCrystalBall style={{ color: theme.palette.success.main, marginRight: 4 }} size={16} />
                <Typography variant="body2">Bulls-Eye</Typography>
                </Box>
                <Box sx={{ width: '60%', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{totalBullsEyes}</Typography>
                </Box>
            </Box>
            
            {/* Hits row */}
            <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 1,
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <Box sx={{ 
                    width: '40%', 
                    display: 'flex', 
                    alignItems: 'center' 
                }}>
                <BsBullseye style={{ color: theme.palette.warning.main, marginRight: 4 }} size={16} />
                <Typography variant="body2">Hits</Typography>
                </Box>
                <Box sx={{ width: '60%', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{totalHits}</Typography>
                </Box>
            </Box>
            
            {/* Misses row */}
            <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 1
            }}>
                <Box sx={{ 
                    width: '40%', 
                    display: 'flex', 
                    alignItems: 'center' 
                }}>
                <AiOutlineCloseCircle style={{ color: theme.palette.error.main, marginRight: 4 }} size={16} />
                <Typography variant="body2">Misses</Typography>
                </Box>
                <Box sx={{ width: '60%', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{totalMisses}</Typography>
                </Box>
            </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" fontWeight="bold" color="text.secondary">Total Points:</Typography>
            <Typography variant="h6" fontWeight="bold" color={theme.palette.success.main}>
                {grandTotal}
            </Typography>
            </Box>
        </CardContent>
        </Card>
      </Box>
    );
  }

  // Desktop table view
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}>
            <TableCell><Typography fontWeight="bold">Round</Typography></TableCell>
            <TableCell align="center">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, marginRight: 4 }}>
                  <TbCrystalBall size={16} style={{ color: theme.palette.success.main }} />
                </div>
                <Typography fontWeight="bold">Bulls-Eye</Typography>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, marginRight: 4 }}>
                  <BsBullseye size={16} style={{ color: theme.palette.warning.main }} />
                </div>
                <Typography fontWeight="bold">Hits</Typography>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, marginRight: 4 }}>
                  <AiOutlineCloseCircle size={16} style={{ color: theme.palette.error.main }} />
                </div>
                <Typography fontWeight="bold">Misses</Typography>
              </Box>
            </TableCell>
            <TableCell align="right">
              <Typography fontWeight="bold">Points</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {statsRows.map((row) => (
            <TableRow 
                key={row.key}
                sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: row.key === maxPointsRound.key && row.totalPoints > 0 ? 
                    (theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.4)' : 'rgba(174, 247, 174, 0.5)') :
                    'inherit',
                    ...(row.key === maxPointsRound.key && row.totalPoints > 0 ? { 
                    '& td, & th': { borderColor: theme.palette.success.light }
                    } : {})
                }}
            >
              <TableCell component="th" scope="row">
                <Typography variant="body2">{row.displayName}</Typography>
              </TableCell>
              <TableCell align="center">{row.bullsEyes}</TableCell>
              <TableCell align="center">{row.hits}</TableCell>
              <TableCell align="center">{row.misses}</TableCell>
              <TableCell align="right">
                <Typography fontWeight={row.totalPoints > 0 ? 'bold' : 'normal'}>
                  {row.totalPoints}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        <TableRow sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            '& th, & td': { fontWeight: 'bold' },
            boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.05)'
        }}>
            <TableCell>
                <Typography variant="body2" fontWeight="bold" color="primary">Total</Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" fontWeight="bold">
                {totalBullsEyes}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" fontWeight="bold">
                {totalHits}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" fontWeight="bold">
                {totalMisses}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" fontWeight="bold">
                {grandTotal}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

PredictionStatsTable.propTypes = {
  playerData: PropTypes.object.isRequired
};

export default PredictionStatsTable;