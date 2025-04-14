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
          
          // Update currentUser
          setCurrentUser({
            ...user,
            userData: userData
          });
          
          return result;
        } catch (err) {
          // Only retry on network errors
          if ((err.name === 'TypeError' || 
               err.message.includes('ERR_CONNECTION_RESET') || 
               err.message.includes('Failed to fetch')) && 
              retryCount < MAX_RETRIES) {
            
            console.log(`Sync failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
            
            // if (window.notify && retryCount === 0) {
            //   window.notify.warning("Connection issue detected. Retrying...");
            // }
            
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