// NBA Teams with scoring
export const NBA_TEAMS_WITH_POINTS = [
  { name: 'Boston Celtics', points: 10 },
  { name: 'Oklahoma City Thunder', points: 12 },
  { name: 'Cleveland Cavaliers', points: 14 },
  { name: 'Los Angeles Lakers', points: 16 },
  { name: 'Denver Nuggets', points: 18 },
  { name: 'Golden State Warriors', points: 20 },
  { name: 'New York Knicks', points: 22 },
  { name: 'Minnesota Timberwolves', points: 24 },
  { name: 'Milwaukee Bucks', points: 26 }
];

// For backward compatibility
export const NBA_TEAMS = NBA_TEAMS_WITH_POINTS.map(team => team.name);

// MVP Candidates with scoring
export const MVP_CANDIDATES_WITH_POINTS = [
  { name: 'Shai Gilgeous-Alexander', points: 10 },
  { name: 'Jayson Tatum', points: 12 },
  { name: 'Donovan Mitchell', points: 14 },
  { name: 'Jaylen Brown', points: 16 },
  { name: 'Nikola Jokić', points: 18 },
  { name: 'Stephen Curry', points: 20 },
  { name: 'Luka Dončić', points: 22 },
  { name: 'Jalen Williams', points: 24 },
  { name: 'LeBron James', points: 26 },
  { name: 'Darius Garland', points: 28 },
  { name: 'Evan Mobley', points: 30 },
  { name: 'Jalen Brunson', points: 32 },
  { name: 'Giannis Antetokounmpo', points: 34 },
  { name: 'Anthony Edwards', points: 36 },
  { name: 'Kevin Durant', points: 38 },
  { name: 'Damian Lillard', points: 40 },
  { name: 'Other', points: 50 }
];

// For backward compatibility
export const MVP_CANDIDATES = MVP_CANDIDATES_WITH_POINTS.map(player => player.name);

// Player avatars
export const PLAYER_AVATARS = [
    { id: "1", src: '/resources/player-avatars/steph.png', alt: 'Stephan Curry' },
    { id: "2", src: '/resources/player-avatars/jokic.png', alt: 'Nikola Jokic' },
    { id: "3", src: '/resources/player-avatars/deni.png', alt: 'Deni Avdija' },
    { id: "4", src: '/resources/player-avatars/casspi.png', alt: 'Omri Casspi' },
    { id: "5", src: '/resources/player-avatars/draymond.png', alt: 'Draymond Green' }
  ];