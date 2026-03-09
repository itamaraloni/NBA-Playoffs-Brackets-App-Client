/**
 * Extract an invite token from user input.
 *
 * Accepts either:
 *   - A full invite URL:  https://playoffprophet.com/invite/AbCdEf...
 *   - A raw token string: AbCdEf...
 *
 * Returns the token portion, or null if the input is empty/whitespace.
 */
export function extractTokenFromInput(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;

  // Match a URL that contains /invite/<token>
  const urlMatch = trimmed.match(/\/invite\/([A-Za-z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];

  // Otherwise treat the entire input as a raw token
  return trimmed;
}
