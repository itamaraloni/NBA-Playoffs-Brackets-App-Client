import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import UserServices from '../services/UserServices';

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

  // Multi-league state: all user's players across leagues, and the currently active one
  const [userPlayers, setUserPlayers] = useState([]);
  const [activePlayer, setActivePlayer] = useState(null);

  /**
   * Fetch player/league data from /user/leagues and set active player.
   * Called after successful auth sync (both sign-in and auth state change).
   *
   * Uses localStorage 'active_player_id' as a hint to restore the user's
   * last selected league across page reloads. Falls back to first player.
   */
  const fetchAndSetPlayerData = async () => {
    try {
      const leaguesData = await UserServices.getUserLeagues();
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
    } catch (err) {
      console.error("Error fetching user leagues:", err);
      // Non-fatal: user can still use the app, just won't have league data
      setUserPlayers([]);
      setActivePlayer(null);
    }
  };

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

  // Sign in with Google with retry logic
  const signInWithGoogle = async () => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    let retryCount = 0;

    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Add a small delay to ensure Firebase has completed its processes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try syncing with retries
      while (retryCount <= MAX_RETRIES) {
        try {
          // Sync with database (using original method, no retry there)
          const userData = await UserServices.syncUserWithDatabase(user, retryCount);

          // Get token and store user data
          const idToken = await user.getIdToken();
          UserServices.storeUserData(userData, idToken);

          // Set admin status from server response
          setIsAdmin(userData?.is_admin || false);

          // Update currentUser
          setCurrentUser({
            ...user,
            userData: userData
          });

          // Fetch player/league data after successful auth
          await fetchAndSetPlayerData();

          return result;
        } catch (err) {
          // Only retry on network errors
          if ((err.name === 'TypeError' ||
               err.message.includes('ERR_CONNECTION_RESET') ||
               err.message.includes('Failed to fetch')) &&
              retryCount < MAX_RETRIES) {

            console.log(`Sync failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`);

            // Exponential backoff
            const delay = RETRY_DELAY * Math.pow(2, retryCount);
            await new Promise(resolve => setTimeout(resolve, delay));

            retryCount++;
            continue;
          }

          // If we've exhausted retries or it's not a network error
          throw err;
        }
      }
    } catch (err) {
      setError(err.message || "Error signing in with Google");

      if (window.notify) {
        window.notify.error("Error signing in with Google. Please try again.");
      }

      setTimeout(() => {
        window.location.href = '/';
      }, 2500);

      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);

      // Use the service for logout
      UserServices.logout();

      // Clear authentication state
      setCurrentUser(null);
      setIsAdmin(false);

      // Clear multi-league state
      setUserPlayers([]);
      setActivePlayer(null);
      localStorage.removeItem('active_player_id');

      // Redirect user
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
      console.error("Error signing out", err);
      throw err;
    }
  };

  // Subscribe to user on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in - fetch their data from backend with retry logic
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 1000;
        let retryCount = 0;
        let syncSucceeded = false;

        while (retryCount <= MAX_RETRIES && !syncSucceeded) {
          try {
            const idToken = await user.getIdToken();
            const userData = await UserServices.syncUserWithDatabase(user, retryCount);

            // Set admin status from server response
            setIsAdmin(userData?.is_admin || false);

            // Update current user with userData
            setCurrentUser({
              ...user,
              userData: userData
            });

            // Fetch player/league data after successful auth
            await fetchAndSetPlayerData();

            syncSucceeded = true;
          } catch (error) {
            // Only retry on network errors
            if ((error.name === 'TypeError' ||
                 error.message.includes('ERR_CONNECTION_RESET') ||
                 error.message.includes('Failed to fetch')) &&
                retryCount < MAX_RETRIES) {

              console.log(`Failed to sync user data, retrying (${retryCount + 1}/${MAX_RETRIES})...`);

              // Exponential backoff
              const delay = RETRY_DELAY * Math.pow(2, retryCount);
              await new Promise(resolve => setTimeout(resolve, delay));

              retryCount++;
            } else {
              // Non-network error or exhausted retries
              console.error("Error syncing user data on auth state change:", error);

              // Show notification on final failure
              if (window.notify && retryCount >= MAX_RETRIES) {
                window.notify.warning("Could not load user data. Some features may be unavailable.");
              }

              // Set user with safe defaults - allow them to continue using the app
              setCurrentUser(user);
              setIsAdmin(false);
              break;
            }
          }
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsAdmin(false);
        setUserPlayers([]);
        setActivePlayer(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

    // Add isAuthenticated derived property
    const isAuthenticated = !!currentUser;

  // Context values to be provided
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    userPlayers,        // All user's players across leagues
    activePlayer,       // Currently selected player (contains player_id, league_id, etc.)
    switchActivePlayer, // Method to switch between leagues
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
