// theme.js
import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    /* … */
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
