/**
 * teamUtils.js — Shared team-related utility functions.
 *
 * Logo path convention: team name lowercased, spaces replaced with hyphens.
 * Example: "Oklahoma City Thunder" → "/resources/team-logos/oklahoma-city-thunder.png"
 */

export function getLogoPath(teamName) {
  return `/resources/team-logos/${teamName.toLowerCase().replace(/ /g, '-')}.png`;
}

// Some last-word extractions are still too long for compact chip display.
// Map the full last word → shorter display name.
const SHORT_NAME_OVERRIDES = {
  Timberwolves: 'Wolves',
};

export function getShortTeamName(teamName) {
  if (!teamName)
    return null;

  const parts = teamName.trim().split(/\s+/);
  const lastName = parts[parts.length - 1] || teamName;
  return SHORT_NAME_OVERRIDES[lastName] || lastName;
}
