// NBA Teams with scoring
export const NBA_TEAMS_WITH_POINTS = [
  { name: 'Oklahoma City Thunder', points: 9, logo: "/resources/team-logos/oklahoma-city-thunder.png" },
  { name: 'Boston Celtics', points: 10, logo: "/resources/team-logos/boston-celtics.png" },
  { name: 'Cleveland Cavaliers', points: 14, logo: "/resources/team-logos/cleveland-cavaliers.png" },
  { name: 'Los Angeles Lakers', points: 17, logo: "/resources/team-logos/los-angeles-lakers.png" },
  { name: 'Denver Nuggets', points: 17, logo: "/resources/team-logos/denver-nuggets.png" },
  { name: 'Golden State Warriors', points: 18, logo: "/resources/team-logos/golden-state-warriors.png" },
  { name: 'New York Knicks', points: 22, logo: "/resources/team-logos/new-york-knicks.png" },
  { name: 'Los Angeles Clippers', points: 27, logo: "/resources/team-logos/los-angeles-clippers.png" },
  { name: 'Minnesota Timberwolves', points: 29, logo: "/resources/team-logos/minnesota-timberwolves.png" },
  { name: 'Detroit Pistons', points: 30, logo: "/resources/team-logos/detroit-pistons.png" },
  { name: 'Indiana Pacers', points: 35, logo: "/resources/team-logos/indiana-pacers.png" },
  { name: 'Houston Rockets', points: 38, logo: "/resources/team-logos/houston-rockets.png" },
  { name: 'Memphis Grizzlies', points: 42, logo: "/resources/team-logos/memphis-grizzlies.png" },
  { name: 'Milwaukee Bucks', points: 48, logo: "/resources/team-logos/milwaukee-bucks.png" },
  { name: 'Orlando Magic', points: 50, logo: "/resources/team-logos/orlando-magic.png" },
  { name: 'Atlanta Hawks', points: 50, logo: "/resources/team-logos/atlanta-hawks.png" },
  { name: 'Miami Heat', points: 50, logo: "/resources/team-logos/miami-heat.png" },
  { name: 'Chicago Bulls', points: 50, logo: "/resources/team-logos/chicago-bulls.png" },
  { name: 'Dallas Mavericks', points: 50, logo: "/resources/team-logos/dallas-mavericks.png" },
  { name: 'Sacramento Kings', points: 50, logo: "/resources/team-logos/sacramento-kings.png" }
];

// For backward compatibility
export const NBA_TEAMS = NBA_TEAMS_WITH_POINTS.map(team => team.name);

// MVP Candidates with scoring
export const MVP_CANDIDATES_WITH_POINTS = [
  { name: 'Shai Gilgeous-Alexander', points: 10, avatar: "/resources/nba-players-avatars/SGA.png" },
  { name: 'Jayson Tatum', points: 12, avatar: "/resources/nba-players-avatars/tatum.png" },
  { name: 'Donovan Mitchell', points: 14, avatar: "/resources/nba-players-avatars/donovan.png" },
  { name: 'Jaylen Brown', points: 17, avatar: "/resources/nba-players-avatars/jaylen-brown.png" },
  { name: 'Nikola Jokić', points: 18, avatar: "/resources/nba-players-avatars/jokic.png" },
  { name: 'Stephen Curry', points: 20, avatar: "/resources/nba-players-avatars/steph.png" },
  { name: 'Luka Dončić', points: 23, avatar: "/resources/nba-players-avatars/luka-doncic.png" },
  { name: 'Jalen Williams', points: 25, avatar: "/resources/nba-players-avatars/jalen-williams.png" },
  { name: 'LeBron James', points: 25, avatar: "/resources/nba-players-avatars/lebron.png" },
  { name: 'Darius Garland', points: 27, avatar: "/resources/nba-players-avatars/garland.png" },
  { name: 'Evan Mobley', points: 27, avatar: "/resources/nba-players-avatars/mobley.png" },
  { name: 'Jalen Brunson', points: 27, avatar: "/resources/nba-players-avatars/jalen-brunson.png" },
  { name: 'Kristaps Porzingis', points: 27, avatar: "/resources/nba-players-avatars/kristaps-porzingis.png" },
  { name: 'Chet Holmgren', points: 29, avatar: "/resources/nba-players-avatars/chet-holmgren.png" },
  { name: 'Anthony Edwards', points: 30, avatar: "/resources/nba-players-avatars/ant.png" },
  { name: 'Derrick White', points: 30, avatar: "/resources/nba-players-avatars/derrick-white.png" },
  { name: 'Karl Anthony Towns', points: 30, avatar: "/resources/nba-players-avatars/karl-anthony-towns.png" },
  { name: 'Jimmy Butler', points: 33, avatar: "/resources/nba-players-avatars/jimmy-butler.png" },
  { name: 'Giannis Antetokounmpo', points: 37, avatar: "/resources/nba-players-avatars/giannis.png" },
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