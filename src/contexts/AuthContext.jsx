import { createContext, useContext, useState, useEffect } from 'react';
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

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Sync with database
      const userData = await syncUserWithDatabase(user);
      
      // Get token and store user data
      const idToken = await user.getIdToken();
      UserServices.storeUserData(userData, idToken);
      
      // Update currentUser
      setCurrentUser({
        ...user,
        userData: userData
      });
      
      return result;
    } catch (err) {
      throw err;
    }
  };

// Syncing with database
const syncUserWithDatabase = async (user) => {
  if (!user) return;
  try {
    return await UserServices.syncUserWithDatabase(user);
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return null;
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
      
      // Redirect user
      window.location.href = '/landing';
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