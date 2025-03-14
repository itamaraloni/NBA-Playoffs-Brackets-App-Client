import { createContext, useContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';

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

  // Sign in with Google
const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("result:", result);

      // Sync with your database after successful Firebase auth and get player_id in userData if exists
      // Option 1 - Sync with database
      // const userData = await syncUserWithDatabase(result.user);

      // Option 2 - Dummy data for testing
      const isTestForUserWithPlayerId = false; // Set to false to test without player_id
      if (isTestForUserWithPlayerId) {
        localStorage.setItem('player_id', 'dummy-player-id');
      }
      else {
        // Save player_id to localStorage instead of currentUser
        if (userData?.player_id) {
          localStorage.setItem('player_id', userData.player_id);
        }
        else {
          localStorage.removeItem('player_id');
        }
      }

      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error signing in with Google", err);
      throw err;
    }
  };

// Syncing with database
// eslint-disable-next-line no-unused-vars
const syncUserWithDatabase = async (user) => {
    if (!user) return;
  
    // Get the Firebase token for backend authentication
    const idToken = await user.getIdToken();
    console.log("user_id: " + user.uid)
    console.log("email: " + user.email)
    // Call your backend API to create/update user in your database
    try {
      const response = await fetch('http://127.0.0.1:5000/user/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          user_id: user.uid,
          email: user.email
        })
      });
      
      if (!response.ok) throw new Error('Failed to sync user with database');
      
      return await response.json(); // Should include player_id if exists
    } catch (error) {
        // Handle error appropriately
      console.error("Error syncing user with database:", error);
      return null;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      // Clear player_id from localStorage on logout
      localStorage.removeItem('player_id');
      // Clear authentication state
      setCurrentUser(null);
      // Redirect user
      window.location.href = '/landing'; // Force page reload and redirect
    } catch (err) {
      setError(err.message);
      console.error("Error signing out", err);
      throw err;
    }
  };

  // Subscribe to user on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setCurrentUser(user);
    setLoading(false);
    // We're not adding player_id to currentUser anymore
  });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Context values to be provided
  const value = {
    currentUser,
    loading,
    error,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}