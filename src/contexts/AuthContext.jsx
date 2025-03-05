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

      // Sync with your database after successful Firebase auth
      // await syncUserWithDatabase(result.user);

      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error signing in with Google", err);
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
      const response = await fetch('https://your-api.com/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync user with database');
      }
      
      // Optionally get additional user data from your backend
      const userData = await response.json();
      return userData;
    } catch (error) {
        // Handle error appropriately
      console.error("Error syncing user with database:", error);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      console.error("Error signing out", err);
      throw err;
    }
  };

  // Subscribe to user on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
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