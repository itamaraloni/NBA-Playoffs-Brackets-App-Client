// Player avatars
// Bot avatars (id >= 100) are excluded from all user-facing pickers.
// To add a new avatar: add an entry here and add its id to the appropriate group in PLAYER_AVATAR_GROUPS.
export const PLAYER_AVATARS = [
    { id: "1",   src: '/resources/player-avatars/casspi.png',            alt: 'Casspi' },
    { id: "2",   src: '/resources/player-avatars/steph.png',             alt: 'Steph' },
    { id: "3",   src: '/resources/player-avatars/bibi.png',              alt: 'Bibi' },
    { id: "4",   src: '/resources/player-avatars/jokic.png',             alt: 'Jokic' },
    { id: "5",   src: '/resources/player-avatars/trump.png',             alt: 'Trump' },
    { id: "6",   src: '/resources/player-avatars/deni.png',              alt: 'Deni' },
    { id: "7",   src: '/resources/player-avatars/draymond.png',          alt: 'Draymond' },
    { id: "8",   src: '/resources/player-avatars/mj.png',                alt: 'MJ' },
    { id: "9",   src: '/resources/player-avatars/ez7.png',               alt: 'EZ7' },
    { id: "10",  src: '/resources/player-avatars/messi.png',             alt: 'Messi' },
    { id: "11",  src: '/resources/player-avatars/lebron.png',            alt: 'Lebron' },
    { id: "12",  src: '/resources/player-avatars/shaq.png',              alt: 'Shaq' },
    { id: "13",  src: '/resources/player-avatars/kobe.png',              alt: 'Kobe' },
    { id: "14",  src: '/resources/player-avatars/dirk.png',              alt: 'Dirk' },
    { id: "15",  src: '/resources/player-avatars/CR7.png',               alt: 'CR7' },
    { id: "16",  src: '/resources/player-avatars/blatt.png',             alt: 'Blatt' },
    { id: "17",  src: '/resources/player-avatars/eyal.png',              alt: 'Eyal' },
    { id: "18",  src: '/resources/player-avatars/pini.png',              alt: 'Pini' },
    { id: "19",  src: '/resources/player-avatars/Bolt.png',              alt: 'Bolt' },
    { id: "20",  src: '/resources/player-avatars/Brady.png',             alt: 'Brady' },
    { id: "21",  src: '/resources/player-avatars/Federer.png',           alt: 'Federer' },
    { id: "22",  src: '/resources/player-avatars/Phelps.png',            alt: 'Phelps' },
    { id: "23",  src: '/resources/player-avatars/fuck them kids.png',    alt: 'Fuck Them Kids' },
    { id: "24",  src: '/resources/player-avatars/Biles.png',             alt: 'Biles' },
    { id: "25",  src: '/resources/player-avatars/Hamilton.png',          alt: 'Hamilton' },
    { id: "26",  src: '/resources/player-avatars/Novak.png',             alt: 'Novak' },
    { id: "27",  src: '/resources/player-avatars/Rafa.png',              alt: 'Rafa' },
    { id: "28",  src: '/resources/player-avatars/Serina.png',            alt: 'Serena' },
    { id: "29",  src: '/resources/player-avatars/Eminem.png',            alt: 'Eminem' },
    { id: "30",  src: '/resources/player-avatars/Kendrick.png',          alt: 'Kendrick' },
    { id: "31",  src: '/resources/player-avatars/Ye.png',                alt: 'Ye' },
    { id: "32",  src: '/resources/player-avatars/Max.png',               alt: 'Max' },
    { id: "33",  src: '/resources/player-avatars/drogba.png',            alt: 'Drogba' },
    { id: "34",  src: '/resources/player-avatars/Avi.png',               alt: 'Avi' },
    { id: "35",  src: '/resources/player-avatars/Yossi.png',             alt: 'Yossi' },
    { id: "36",  src: '/logo192.png',                                   alt: 'Prophet' },
    // Bot-only avatars — never shown in user pickers
    { id: "100", src: '/resources/player-avatars/sheep.png',             alt: 'Sheep' },
    { id: "101", src: '/resources/player-avatars/monkey.png',            alt: 'Monkey' },
];

// Avatar groups for the picker UI.
// Order within avatarIds controls display order inside the group.
// To add a new group: add an entry here with a unique id, label, and avatarIds.
export const PLAYER_AVATAR_GROUPS = [
    { id: 'goats',       label: 'GOATs',         avatarIds: ['36', '8', '10', '11', '15', '19', '20', '21', '22', '24', '25', '28'] },
    { id: 'ballers',     label: 'Ballers',      avatarIds: ['2', '4', '12', '13', '14', '17', '7', '6', '1', '9', '33', '35', '34'] },
    { id: 'politicians', label: 'World Leaders', avatarIds: ['3', '5'] },
    { id: 'others',      label: 'Be Different',        avatarIds: ['16', '18', '23', '29', '30', '31', '32', '26', '27'] },
];
