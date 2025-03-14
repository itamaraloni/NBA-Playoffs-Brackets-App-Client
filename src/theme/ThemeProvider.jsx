import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  ThemeProvider as MUIThemeProvider, 
  createTheme, 
  CssBaseline
} from '@mui/material';
import { getDesignTokens } from './theme';

// Create context
const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {}
});

// Custom hook to use the theme context
export const useAppTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  // Check if user has a saved preference in localStorage
  const getSavedTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme-mode');
      return savedTheme || 'light';
    } catch (error) {
      // In case localStorage is not available
      return 'light';
    }
  };

  const [mode, setMode] = useState(getSavedTheme);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Save theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('theme-mode', mode);
      
      // Optional: update HTML attribute for global CSS
      document.documentElement.setAttribute('data-theme', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, [mode]);

  // Create theme with current mode
  const theme = useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalize CSS */}
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;