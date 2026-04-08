import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import UserServices from '../services/UserServices';

const PENDING_FIRST_LOGIN_WELCOME_KEY = 'pendingFirstLoginWelcome';

// Create the authentication context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps your app and makes auth object available to any
// child component that calls useAuth().
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Multi-league state: all user's players across leagues, and the currently active one
  const [userPlayers, setUserPlayers] = useState([]);
  const [activePlayer, setActivePlayer] = useState(null);

  // Tracks the last Firebase UID we fully processed in onAuthStateChanged.
  // In React StrictMode (dev), effects run twice — this prevents the second
  // invocation from launching a concurrent duplicate auth flow that races
  // the first and can produce spurious 401s on /user/leagues.
  const UNINITIALIZED = useRef(Symbol('uninitialized'));
  const lastProcessedUid = useRef(UNINITIALIZED.current);
  const interactiveSignInRef = useRef(null);

  /**
   * Fetch player/league data from /user/leagues and set active player.
   * Called after successful auth sync (both sign-in and auth state change).
   *
   * Uses localStorage 'active_player_id' as a hint to restore the user's
   * last selected league across page reloads. Falls back to first player.
   *
   * Retries once on 401: Chrome's multi-process architecture commits Set-Cookie
   * from session_login asynchronously across the network/renderer process boundary,
   * so the session cookie may not yet be in the network stack when this fires
   * immediately after syncUserWithDatabase returns. A 200ms retry window covers
   * this without adding perceptible delay to the login flow.
   */
  const fetchAndSetPlayerData = useCallback(async () => {
    const applyLeagueData = (leaguesData) => {
      const players = leaguesData?.players || [];
      setUserPlayers(players);

      if (players.length > 0) {
        // Restore active player from localStorage or default to first
        const savedActiveId = localStorage.getItem('active_player_id');
        const restoredPlayer = savedActiveId
          ? players.find(p => p.player_id === savedActiveId)
          : null;

        const selectedPlayer = restoredPlayer || players[0];
        setActivePlayer(selectedPlayer);
        localStorage.setItem('active_player_id', selectedPlayer.player_id);
      } else {
        // User has no leagues yet
        setActivePlayer(null);
        localStorage.removeItem('active_player_id');
      }
    };

    try {
      const leaguesData = await UserServices.getUserLeagues();
      applyLeagueData(leaguesData);
    } catch (err) {
      if (err.status === 401) {
        // Cookie not committed yet — wait and retry once before giving up.
        await new Promise(resolve => setTimeout(resolve, 200));
        try {
          const leaguesData = await UserServices.getUserLeagues();
          applyLeagueData(leaguesData);
        } catch (retryErr) {
          if (retryErr.status === 401) {
            // Genuine session expiry after retry — trigger full sign-out and
            // abort the auth flow so currentUser is never set.
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
            throw retryErr;
          } else {
            console.error("Error fetching user leagues (retry):", retryErr);
            setUserPlayers([]);
            setActivePlayer(null);
          }
        }
      } else {
        console.error("Error fetching user leagues:", err);
        // Non-fatal: user can still use the app, just won't have league data
        setUserPlayers([]);
        setActivePlayer(null);
      }
    }
  }, []);

  /**
   * Switch the active player/league. Updates React state and persists
   * the selection in localStorage so it survives page reloads.
   */
  const switchActivePlayer = useCallback((playerId) => {
    const player = userPlayers.find(p => p.player_id === playerId);
    if (player) {
      setActivePlayer(player);
      localStorage.setItem('active_player_id', playerId);

      if (window.notify) {
        window.notify.success(`Switched to ${player.league_name}`);
      }
    }
  }, [userPlayers]);

  const clearIsNewUser = useCallback(() => {
    setIsNewUser(false);
  }, []);

  // Sign in with Google.
  // Session sync (syncUserWithDatabase), state updates, and league-data fetching are
  // all handled exclusively by onAuthStateChanged below. This function only starts
  // the popup flow, then waits for that auth pipeline to finish so callers can still
  // await "login is done" without reintroducing duplicate /auth/session_login calls.
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const completionPromise = new Promise((resolve, reject) => {
        interactiveSignInRef.current = { resolve, reject, uid: null };
      });
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (interactiveSignInRef.current) {
        interactiveSignInRef.current.uid = result.user.uid;
      }
      await completionPromise;
      return result;
    } catch (err) {
      interactiveSignInRef.current = null;
      setError(err.message || "Error signing in with Google");
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);

      // Clear server session cookie + localStorage (now async — calls /auth/logout)
      await UserServices.logout();

      // Clear authentication state
      setCurrentUser(null);
      setIsAdmin(false);
      setIsNewUser(false);
      sessionStorage.removeItem(PENDING_FIRST_LOGIN_WELCOME_KEY);

      // Clear multi-league state
      setUserPlayers([]);
      setActivePlayer(null);

      // Redirect user
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
      console.error("Error signing out", err);
      throw err;
    }
  };

  // Handle session expiry signalled by ApiClient's 401 handler.
  // ApiClient dispatches this event instead of redirecting directly, so that
  // we can call signOut(auth) here first — otherwise Firebase keeps the user
  // cached, onAuthStateChanged re-fires with the same user on the next page
  // load, and the app silently re-authenticates in an infinite 401 loop.
  useEffect(() => {
    const handleSessionExpired = async () => {
      try {
        await signOut(auth);
        await UserServices.logout();
      } catch (e) {
        // Silent — still need to redirect even if cleanup fails
      }
      setCurrentUser(null);
      setIsAdmin(false);
      setIsNewUser(false);
      sessionStorage.removeItem(PENDING_FIRST_LOGIN_WELCOME_KEY);
      setUserPlayers([]);
      setActivePlayer(null);
      if (window.notify) {
        window.notify.warning('Your session has expired. Please log in again.');
      }
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  // Subscribe to user on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Guard against React StrictMode's double-invoke of effects (dev only).
      // StrictMode mounts → unmounts → remounts, causing onAuthStateChanged to
      // fire twice with the same user. Without this guard, two concurrent auth
      // flows race each other, and the one that calls /user/leagues before the
      // other's session is established gets a 401.
      const uid = user?.uid ?? null;
      if (lastProcessedUid.current !== UNINITIALIZED.current && uid === lastProcessedUid.current) {
        return;
      }
      lastProcessedUid.current = uid;

      if (user) {
        // User is signed in - fetch their data from backend with retry logic
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 1000;
        let retryCount = 0;
        let syncSucceeded = false;

        while (retryCount <= MAX_RETRIES && !syncSucceeded) {
          try {
            const pendingInteractiveSignIn = interactiveSignInRef.current;
            const matchesPendingInteractiveSignIn = Boolean(pendingInteractiveSignIn)
              && (!pendingInteractiveSignIn.uid || pendingInteractiveSignIn.uid === user.uid);
            let userData = null;
            const hasCsrfCookie = document.cookie.includes('csrf_token=');

            // If a session already exists (page reload), try lightweight check first
            if (hasCsrfCookie) {
              try {
                userData = await UserServices.checkUserWithSession();
              } catch (error) {
                // If session is missing/invalid, fall back to session-login below
                if (error.status !== 401 && error.status !== 403) {
                  throw error;
                }
              }
            }

            if (!userData) {
              // Exchange Firebase token for session cookie via /auth/session_login.
              userData = await UserServices.syncUserWithDatabase(user, retryCount);
            }

            await fetchAndSetPlayerData();

            // Only touch the onboarding flag when syncUserWithDatabase() was the
            // data source (it returns isNewUser; checkUserWithSession() does not).
            // Only ever SET the flag here — never clear it from an API response.
            // Clearing is handled exclusively by the dialog close handler and sign-out
            // so that a concurrent 200 response cannot race away a 201-set flag.
            if ('isNewUser' in (userData ?? {})) {
              if (userData.isNewUser) {
                sessionStorage.setItem(PENDING_FIRST_LOGIN_WELCOME_KEY, 'true');
              }
              setIsNewUser(userData.isNewUser);
            }

            setError(null);
            setIsAdmin(userData?.is_admin || false);
            setCurrentUser({
              ...user,
              userData: userData
            });

            if (matchesPendingInteractiveSignIn && interactiveSignInRef.current) {
              interactiveSignInRef.current.resolve();
              interactiveSignInRef.current = null;
            }
            syncSucceeded = true;
          } catch (error) {
            const pendingInteractiveSignIn = interactiveSignInRef.current;
            const matchesPendingInteractiveSignIn = Boolean(pendingInteractiveSignIn)
              && (!pendingInteractiveSignIn.uid || pendingInteractiveSignIn.uid === user.uid);

            if (error.status) {
              // Server explicitly rejected auth with an HTTP error (e.g. 401 invalid token).
              // Do NOT set currentUser — the user has no valid server session.
              console.error(`Auth sync rejected by server (HTTP ${error.status}):`, error.code, error.message);
              setError('Sign in failed. Please try again.');
              if (matchesPendingInteractiveSignIn && interactiveSignInRef.current) {
                interactiveSignInRef.current.reject(error);
                interactiveSignInRef.current = null;
              }
              break;
            }

            // Network error — server unreachable. Retry with backoff.
            const isNetworkError = error.name === 'TypeError' ||
                 error.message.includes('ERR_CONNECTION_RESET') ||
                 error.message.includes('Failed to fetch');

            if (isNetworkError && retryCount < MAX_RETRIES) {
              console.log(`Failed to sync user data, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
              const delay = RETRY_DELAY * Math.pow(2, retryCount);
              await new Promise(resolve => setTimeout(resolve, delay));
              retryCount++;
            } else {
              // Network unreachable after retries — allow degraded access so the
              // user can still view cached content even if the server is down.
              console.error("Error syncing user data on auth state change:", error);
              if (window.notify && retryCount >= MAX_RETRIES) {
                window.notify.warning("Could not load user data. Some features may be unavailable.");
              }
              setError(null);
              setCurrentUser(user);
              setIsAdmin(false);
              if (matchesPendingInteractiveSignIn && interactiveSignInRef.current) {
                interactiveSignInRef.current.resolve();
                interactiveSignInRef.current = null;
              }
              break;
            }
          }
        }
      } else {
        // User is signed out
        if (interactiveSignInRef.current) {
          interactiveSignInRef.current.reject(new Error('Sign in was interrupted.'));
          interactiveSignInRef.current = null;
        }
        setCurrentUser(null);
        setIsAdmin(false);
        setIsNewUser(false);
        sessionStorage.removeItem(PENDING_FIRST_LOGIN_WELCOME_KEY);
        setUserPlayers([]);
        setActivePlayer(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchAndSetPlayerData]);

    // Add isAuthenticated derived property
    const isAuthenticated = !!currentUser;

  // Context values to be provided
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isNewUser,
    userPlayers,          // All user's players across leagues
    activePlayer,         // Currently selected player (contains player_id, league_id, etc.)
    switchActivePlayer,   // Method to switch between leagues
    refreshLeagueData: fetchAndSetPlayerData, // Re-fetch all leagues (call after joining/creating)
    clearIsNewUser,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
