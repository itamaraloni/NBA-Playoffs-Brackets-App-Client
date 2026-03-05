/**
 * teamUtils.js — Shared team-related utility functions.
 *
 * Logo path convention: team name lowercased, spaces replaced with hyphens.
 * Example: "Oklahoma City Thunder" → "/resources/team-logos/oklahoma-city-thunder.png"
 */

export function getLogoPath(teamName) {
  return `/resources/team-logos/${teamName.toLowerCase().replace(/ /g, '-')}.png`;
}

export function getShortTeamName(teamName) {
  if (!teamName)
    return null;

  const parts = teamName.trim().split(/\s+/);
  return parts[parts.length - 1] || teamName;
}
