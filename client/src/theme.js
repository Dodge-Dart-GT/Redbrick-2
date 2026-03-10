import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      // Light mode = Dark Red (#590016), Dark mode = Firebrick Red (#B22222)
      main: mode === 'light' ? '#590016' : '#B22222', 
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
  }
  // ... rest of components config
});