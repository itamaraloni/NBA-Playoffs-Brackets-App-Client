// NBA team colors for inspiration
const nbaColors = {
    primary: '#17408B', // NBA blue
    secondary: '#C9082A', // NBA red
    accent: '#FFFFFF'
  };
  
  // Theme configuration
  export const getDesignTokens = (mode) => ({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode
            primary: {
              main: nbaColors.primary,
            },
            secondary: {
              main: nbaColors.secondary,
            },
            background: {
              default: '#f5f7fa',
              paper: '#ffffff',
            },
            text: {
              primary: '#1a202c',
              secondary: '#4a5568',
            },
          }
        : {
            // Dark mode
            primary: {
              main: '#90caf9',
            },
            secondary: {
              main: '#f48fb1',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#e2e8f0',
              secondary: '#a0aec0',
            },
          }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        color: mode === 'light' ? '#1a202c' : '#e2e8f0',
      },
      h2: {
        fontWeight: 600,
        color: mode === 'light' ? '#1a202c' : '#e2e8f0',
      },
      h3: {
        fontWeight: 600,
        color: mode === 'light' ? '#1a202c' : '#e2e8f0',
      },
      h4: {
        fontWeight: 600,
        color: mode === 'light' ? '#1a202c' : '#e2e8f0',
      },
      h5: {
        fontWeight: 600,
        color: mode === 'light' ? '#1a202c' : '#e2e8f0',
      },
      h6: {
        fontWeight: 600,
        color: mode === 'light' ? '#1a202c' : '#e2e8f0',
      },
      body1: {
        color: mode === 'light' ? '#1a202c' : '#e2e8f0',
      },
      body2: {
        color: mode === 'light' ? '#4a5568' : '#a0aec0',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' 
              : 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            overflow: 'hidden',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      // Mobile optimizations
      MuiListItem: {
        styleOverrides: {
          root: {
            paddingTop: 10,
            paddingBottom: 10,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: 10, // Larger touch target
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px', // Larger click area
          },
        },
      },
    },
  });
  
  export default getDesignTokens;