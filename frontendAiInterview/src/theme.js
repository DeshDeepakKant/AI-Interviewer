// theme.js
import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6c63ff',
      light: '#9c95ff',
      dark: '#3a36cb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff9e9e',
      dark: '#c73e3e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0f1a',
      paper: '#1a1f2e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          position: 'relative',
          minHeight: '100vh',
          backgroundColor: '#0a0f1a',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '60vw',
            height: '60vw',
            background: 'radial-gradient(circle at center, #00bfa5, transparent 70%)',
            filter: 'blur(200px)',
            zIndex: 1,
          },
        },
        '#root': {
          height: '100%',
        },
      },
    },
  },
});

export default theme;
