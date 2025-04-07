// NBA Teams with scoring
export const NBA_TEAMS_WITH_POINTS = [
  { name: 'Boston Celtics', points: 10, logo: "/resources/team-logos/boston-celtics.png" },
  { name: 'Oklahoma City Thunder', points: 12, logo: "/resources/team-logos/oklahoma-city-thunder.png" },
  { name: 'Cleveland Cavaliers', points: 14, logo: "/resources/team-logos/cleveland-cavaliers.png" },
  { name: 'Los Angeles Lakers', points: 16, logo: "/resources/team-logos/los-angeles-lakers.png" },
  { name: 'Denver Nuggets', points: 18, logo: "/resources/team-logos/denver-nuggets.png" },
  { name: 'Golden State Warriors', points: 20, logo: "/resources/team-logos/golden-state-warriors.png" },
  { name: 'New York Knicks', points: 22, logo: "/resources/team-logos/new-york-knicks.png" },
  { name: 'Minnesota Timberwolves', points: 24, logo: "/resources/team-logos/minnesota-timberwolves.png" },
  { name: 'Milwaukee Bucks', points: 26, logo: "/resources/team-logos/milwaukee-bucks.png" }
];

// For backward compatibility
export const NBA_TEAMS = NBA_TEAMS_WITH_POINTS.map(team => team.name);

// MVP Candidates with scoring
export const MVP_CANDIDATES_WITH_POINTS = [
  { name: 'Shai Gilgeous-Alexander', points: 10, avatar: "/resources/nba-players-avatars/SGA.png" },
  { name: 'Jayson Tatum', points: 12, avatar: "/resources/nba-players-avatars/tatum.png" },
  { name: 'Donovan Mitchell', points: 14, avatar: "/resources/nba-players-avatars/donovan.png" },
  { name: 'Jaylen Brown', points: 16, avatar: "/resources/nba-players-avatars/jaylen-brown.png" },
  { name: 'Nikola Jokić', points: 18, avatar: "/resources/nba-players-avatars/jokic.png" },
  { name: 'Stephen Curry', points: 20, avatar: "/resources/nba-players-avatars/steph.png" },
  { name: 'Luka Dončić', points: 22, avatar: "/resources/nba-players-avatars/luka-doncic.png" },
  { name: 'Jalen Williams', points: 24, avatar: "/resources/nba-players-avatars/jalen-williams.png" },
  { name: 'LeBron James', points: 26, avatar: "/resources/nba-players-avatars/lebron.png" },
  { name: 'Darius Garland', points: 28, avatar: "/resources/nba-players-avatars/garland.png" },
  { name: 'Evan Mobley', points: 30, avatar: "/resources/nba-players-avatars/mobley.png" },
  { name: 'Jalen Brunson', points: 32, avatar: "/resources/nba-players-avatars/jalen-brunson.png" },
  { name: 'Giannis Antetokounmpo', points: 34, avatar: "/resources/nba-players-avatars/giannis.png" },
  { name: 'Anthony Edwards', points: 36, avatar: "/resources/nba-players-avatars/ant.png" },
  { name: 'Kevin Durant', points: 38, avatar: "/resources/nba-players-avatars/KD.png" },
  { name: 'Damian Lillard', points: 40, avatar: "/resources/nba-players-avatars/dame.png" },
  { name: 'Other', points: 50 }
];

// For backward compatibility
export const MVP_CANDIDATES = MVP_CANDIDATES_WITH_POINTS.map(player => player.name);

// Player avatars
export const PLAYER_AVATARS = [
    { id: "1", src: '/resources/player-avatars/casspi.png', alt: 'Casspi' },
    { id: "2", src: '/resources/player-avatars/steph.png', alt: 'Steph' },
    { id: "3", src: '/resources/player-avatars/bibi.png', alt: 'Bibi king' },
    { id: "4", src: '/resources/player-avatars/jokic.png', alt: 'Jokic' },
    { id: "5", src: '/resources/player-avatars/trump.png', alt: 'Trump' },
    { id: "6", src: '/resources/player-avatars/deni.png', alt: 'Deni' },
    { id: "7", src: '/resources/player-avatars/draymond.png', alt: 'Draymond' },
    { id: "8", src: '/resources/player-avatars/ben-gvir.png', alt: 'Itamari' },
    { id: "9", src: '/resources/player-avatars/ez7.png', alt: 'EZ7' },
    { id: "10", src: '/resources/player-avatars/gali.png', alt: 'GALI' },
    { id: "11", src: '/resources/player-avatars/lebron.png', alt: 'Lebron' },
    { id: "12", src: '/resources/player-avatars/shaq.png', alt: 'Shaq' },
    { id: "100", src: '/resources/player-avatars/sheep.png', alt: 'Sheep' },
    { id: "101", src: '/resources/player-avatars/monkey.png', alt: 'Monkey' },
  ];