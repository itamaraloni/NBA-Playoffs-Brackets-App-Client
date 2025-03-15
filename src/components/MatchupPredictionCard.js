import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Team from './Team';

const MatchupPredictionCard = ({ 
  homeTeam, 
  awayTeam, 
  status = 'upcoming',
  actualHomeScore = null,
  actualAwayScore = null,
  predictedHomeScore = null,
  predictedAwayScore = null,
  onSubmitPrediction,
  isAdmin = localStorage.getItem('is_admin'),
  onUpdateScore
}) => {
  const [homeScore, setHomeScore] = useState(predictedHomeScore || 0);
  const [awayScore, setAwayScore] = useState(predictedAwayScore || 0);
  const [validationError, setValidationError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [actualHome, setActualHome] = useState(actualHomeScore || 0);
  const [actualAway, setActualAway] = useState(actualAwayScore || 0);

  // Validate NBA Playoff series scoring rules
  const validateScore = (home, away) => {
    // Ensure only one team has 4 wins
    if (home < 4 && away < 4) {
      return 'Invalid score: One team must have 4 wins';
    }
    else if (home === 4 && away === 4) {
      return 'Invalid score: Only one team can have 4 wins';
    }
    
    return '';
  };

  const handleSubmitPrediction = () => {
    // Validate scores before submission
    const error = validateScore(homeScore, awayScore);
    if (error) {
      setValidationError(error);
      return;
    }

    // Clear any previous validation errors
    setValidationError('');

    if (onSubmitPrediction) {
      onSubmitPrediction({
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeScore,
        awayScore
      });
    }
  };

  const handleUpdateScore = () => {
    // Simulate API call to update score

    setEditMode(false);

    console.log('Updating score:', actualHome, actualAway);

    if (onUpdateScore) {
      onUpdateScore({
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeScore: actualHome,
        awayScore: actualAway
      });
    }
  };

  // Return a key based on string to ensure unique rendering
  const getKey = () => `${homeTeam.name}-${awayTeam.name}-${status}-${Date.now()}`;

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      key={getKey()}
    >
      <CardContent>
        {/* Teams Display */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' } 
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: { xs: 2, sm: 0 } 
          }}>
            <Team 
              name={homeTeam.name}
              logo={homeTeam.logo}
              seed={homeTeam.seed}
              conference={homeTeam.conference}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 'bold', mx: 2 }}>
            VS
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}>
            <Team 
              name={awayTeam.name}
              logo={awayTeam.logo}
              seed={awayTeam.seed}
              conference={awayTeam.conference}
            />
          </Box>
        </Box>

        {/* Prediction Input for Upcoming Games */}
        {status === 'upcoming' && (
          <Box sx={{ mt: 3 }}>
            {predictedHomeScore !== null && predictedAwayScore !== null && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Your Prediction:
                </Typography>
                <Typography>
                  {homeTeam.name} {predictedHomeScore} - {predictedAwayScore} {awayTeam.name}
                </Typography>
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'center' }}>
              {predictedHomeScore !== null ? 'Update Your Prediction' : 'Make Your Prediction'}
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center', 
              gap: 3,
              px: 3
            }}>
              <Box sx={{ width: '100%', maxWidth: 200 }}>
                <Typography gutterBottom>
                  {homeTeam.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    sx={{ minWidth: '40px' }}
                  >
                    -
                  </Button>
                  <Typography variant="h5" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
                    {homeScore}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setHomeScore(Math.min(4, homeScore + 1))}
                    sx={{ minWidth: '40px' }}
                  >
                    +
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ width: '100%', maxWidth: 200 }}>
                <Typography gutterBottom>
                  {awayTeam.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    sx={{ minWidth: '40px' }}
                  >
                    -
                  </Button>
                  <Typography variant="h5" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
                    {awayScore}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setAwayScore(Math.min(4, awayScore + 1))}
                    sx={{ minWidth: '40px' }}
                  >
                    +
                  </Button>
                </Box>
              </Box>
            </Box>

            {validationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {validationError}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSubmitPrediction}
              >
                Submit Prediction
              </Button>
            </Box>
          </Box>
        )}

        {/* Display for In Progress Games */}
        {status === 'in-progress' && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Current Score:
              </Typography>
              <Typography>
                {homeTeam.name} {actualHomeScore} - {actualAwayScore} {awayTeam.name}
              </Typography>
            </Box>

            {predictedHomeScore !== null && predictedAwayScore !== null && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Your Prediction:
                </Typography>
                <Typography>
                  {homeTeam.name} {predictedHomeScore} - {predictedAwayScore} {awayTeam.name}
                </Typography>
              </Box>
            )}

            {isAdmin && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                {!editMode ? (
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    size="small"
                  >
                    Update Score
                  </Button>
                ) : (
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center', 
                      gap: 3,
                      px: 3,
                      mt: 2,
                      mb: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ mr: 2 }}>
                          {homeTeam.name}:
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => setActualHome(Math.max(0, actualHome - 1))}
                          sx={{ minWidth: '40px' }}
                        >
                          -
                        </Button>
                        <Typography variant="h5" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
                          {actualHome}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => setActualHome(Math.min(4, actualHome + 1))}
                          sx={{ minWidth: '40px' }}
                        >
                          +
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: { xs: 2, sm: 0 } }}>
                        <Typography sx={{ mr: 2 }}>
                          {awayTeam.name}:
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => setActualAway(Math.max(0, actualAway - 1))}
                          sx={{ minWidth: '40px' }}
                        >
                          -
                        </Button>
                        <Typography variant="h5" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
                          {actualAway}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => setActualAway(Math.min(4, actualAway + 1))}
                          sx={{ minWidth: '40px' }}
                        >
                          +
                        </Button>
                      </Box>
                    </Box>

                    {validationError && (
                      <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                        {validationError}
                      </Alert>
                    )}

                    <Button 
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleUpdateScore}
                      size="small"
                    >
                      Save Score
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Display for Completed Games */}
        {status === 'completed' && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Final Score:
              </Typography>
              <Typography>
                {homeTeam.name} {actualHomeScore} - {actualAwayScore} {awayTeam.name}
              </Typography>
            </Box>

            {predictedHomeScore !== null && predictedAwayScore !== null && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Your Prediction:
                </Typography>
                <Typography>
                  {homeTeam.name} {predictedHomeScore} - {predictedAwayScore} {awayTeam.name}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchupPredictionCard;