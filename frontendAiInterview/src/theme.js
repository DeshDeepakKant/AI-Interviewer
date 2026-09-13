import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0044CC',
      light: '#3366FF',
      dark: '#002299',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#111111',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ECECE9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111111',
      secondary: '#555555',
    }
  },
  typography: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.04em' },
    h2: { fontWeight: 800, letterSpacing: '-0.04em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700 },
    body1: { fontFamily: '"Courier New", Courier, monospace' },
    body2: { fontFamily: '"Courier New", Courier, monospace' },
    button: { fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 700, textTransform: 'uppercase' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          position: 'relative',
          minHeight: '100vh',
          backgroundColor: '#ECECE9',
          color: '#111111',
        },
        '#root': {
          height: '100%',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid #111',
          boxShadow: '4px 4px 0 #111',
          '&:hover': {
            boxShadow: '2px 2px 0 #111',
            transform: 'translate(2px, 2px)',
          }
        },
        contained: {
          backgroundColor: '#111',
          color: '#FFF',
          '&:hover': {
            backgroundColor: '#0044CC',
            borderColor: '#0044CC',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid #111',
          boxShadow: '4px 4px 0 #111',
        }
      }
    }
  },
});

export default theme;
