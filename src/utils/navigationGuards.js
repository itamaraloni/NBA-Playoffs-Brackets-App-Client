export const BRACKET_UNSAVED_EXIT_MESSAGE = 'You have unsaved bracket picks. Leave this page without submitting?';

const BRACKET_UNSAVED_FLAG = '__hasUnsavedBracketChanges';
const BRACKET_GUARD_BYPASS_FLAG = '__skipBracketUnsavedGuard';

const isBrowser = typeof window !== 'undefined';

export const setBracketUnsavedChangesFlag = (hasUnsavedChanges) => {
  if (!isBrowser) return;
  window[BRACKET_UNSAVED_FLAG] = Boolean(hasUnsavedChanges);
};

export const clearBracketUnsavedChangesFlag = () => {
  if (!isBrowser) return;
  window[BRACKET_UNSAVED_FLAG] = false;
  window[BRACKET_GUARD_BYPASS_FLAG] = false;
};

export const shouldWarnOnBracketExit = () => {
  if (!isBrowser) return false;
  return Boolean(window[BRACKET_UNSAVED_FLAG]) && !Boolean(window[BRACKET_GUARD_BYPASS_FLAG]);
};

export const confirmBracketExitIfNeeded = () => {
  if (!isBrowser) return true;
  if (!shouldWarnOnBracketExit()) return true;
  return window.confirm(BRACKET_UNSAVED_EXIT_MESSAGE);
};

export const runWithBracketGuardBypass = async (callback) => {
  if (!isBrowser) return callback();

  const previousBypassState = window[BRACKET_GUARD_BYPASS_FLAG];
  window[BRACKET_GUARD_BYPASS_FLAG] = true;
  try {
    return await callback();
  } finally {
    window[BRACKET_GUARD_BYPASS_FLAG] = previousBypassState;
  }
};
