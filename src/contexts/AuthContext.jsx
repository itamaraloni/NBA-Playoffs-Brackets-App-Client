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
    const user = result.user;
    
    // Sync with database and get userData
    const userData = await syncUserWithDatabase(user);
    
    // Get Firebase token
    const idToken = await user.getIdToken();
    
    // Save to localStorage
    localStorage.setItem('auth_token', idToken);
    
    if (userData?.is_admin) {
      localStorage.setItem('is_admin', userData.is_admin);
    }
    
    if (userData?.player?.player_id) {
      localStorage.setItem('player_id', userData.player.player_id);
    }
    
    if (userData?.league?.league_id) {
      localStorage.setItem('league_id', userData.league.league_id);
    }
    
    // Update currentUser with the enhanced data
    setCurrentUser({
      ...user,
      userData: userData // Store backend data with the user object
    });
    
    return result;
  } catch (err) {
    // Error handling remains the same
    throw err;
  }
};

// Syncing with database
const syncUserWithDatabase = async (user) => {
    if (!user) return;
  
    // Get the Firebase token for backend authentication
    const idToken = await user.getIdToken();
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
      
      return await response.json();
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

      // Save theme before clearing localStorage
      const theme = localStorage.getItem('theme-mode');

      // Clear localStorage
      localStorage.clear();

      // Restore theme
      localStorage.setItem('theme-mode', theme);
      
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
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}