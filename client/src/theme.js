import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#590016' : '#B22222', 
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff5252', 
    },
    background: {
      default: mode === 'light' ? '#f4f6f8' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
      secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    },
    action: {
      disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.5)',
      disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    },
  },
  // ADD THIS BLOCK: This forces the button to respect your primary colors
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          // Explicitly set the background to match your primary.main
          backgroundColor: mode === 'light' ? '#590016' : '#B22222',
          color: '#ffffff', // Ensures text is always white
          '&:hover': {
            // A slightly darker/different shade for the hover state
            backgroundColor: mode === 'light' ? '#3d000f' : '#8b0000', 
          },
        },
      },
    },
  },
});