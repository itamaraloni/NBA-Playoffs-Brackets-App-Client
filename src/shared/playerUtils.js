/** Strip diacritics (ć→c, č→c, etc.) so filenames stay ASCII-safe */
export const stripDiacritics = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Derive NBA player avatar path from player name (kebab-case, ASCII-safe) */
export const getPlayerAvatar = (name) =>
  name ? `/resources/nba-players-avatars/${stripDiacritics(name).toLowerCase().replace(/\s+/g, '-')}.png` : null;
