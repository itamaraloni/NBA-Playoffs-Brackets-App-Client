/**
 * Clear localStorage while preserving the user's theme preference.
 */
export function clearLocalStoragePreserveTheme() {
  const theme = localStorage.getItem('theme-mode');
  localStorage.clear();
  if (theme) {
    localStorage.setItem('theme-mode', theme);
  }
}
