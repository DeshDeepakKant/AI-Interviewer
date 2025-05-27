import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { name: 'Companies', path: '/comingSoon' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' }
];

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        background: 'rgba(10, 15, 26, 0.98)',
        backdropFilter: 'blur(10px)',
        color: '#ffffff',
        zIndex: 1200,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography 
            variant="h6" 
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: 'white',
              background: 'linear-gradient(90deg, #00bfa5, #00acc1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'none',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            AI Interviewer
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => (
              <Button 
                key={item.name}
                component={RouterLink}
                to={item.path}
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  px: 2,
                  '&:hover': {
                    color: '#00e5c9',
                    background: 'rgba(0, 191, 165, 0.15)',
                    borderRadius: 1,
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
            <Button 
              component={RouterLink}
              to="/login"
              sx={{
                ml: 1,
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#00e5c9',
                  background: 'rgba(0, 191, 165, 0.15)',
                  borderRadius: 1,
                },
              }}
            >
              Login
            </Button>
            <Button 
              variant="contained" 
              component={RouterLink}
              to="/login"
              sx={{
                ml: 2,
                background: 'linear-gradient(45deg, #00bfa5 30%, #00acc1 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00897b 30%, #00838f 90%)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>

          {/* Mobile Navigation */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton 
              edge="end" 
              onClick={handleMenu}
              sx={{
                color: '#e0e0e0',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu 
              anchorEl={anchorEl} 
              open={open} 
              onClose={handleClose} 
              keepMounted
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  overflow: 'hidden',
                  background: 'rgba(10, 15, 26, 0.98)',
                  backdropFilter: 'blur(20px)',
                },
              }}
            >
              {navItems.map((item) => (
                <MenuItem 
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  onClick={handleClose}
                  sx={{
                    px: 3,
                    py: 1.5,
                    color: '#e0e0e0',
                    '&:hover': {
                      background: 'rgba(0, 191, 165, 0.1)',
                      color: '#00bfa5',
                    },
                  }}
                >
                  {item.name}
                </MenuItem>
              ))}
              <MenuItem 
                component={RouterLink} 
                to="/login" 
                onClick={handleClose} 
                sx={{ 
                  color: '#e0e0e0', 
                  '&:hover': { 
                    background: 'rgba(0, 191, 165, 0.1)', 
                    color: '#00bfa5' 
                  } 
                }}
              >
                Login
              </MenuItem>
              <MenuItem 
                onClick={handleClose} 
                sx={{ 
                  '&:hover': { 
                    background: 'transparent' 
                  } 
                }}
              >
                <Button 
                  variant="contained" 
                  fullWidth
                  component={RouterLink}
                  to="/login"
                  sx={{
                    background: 'linear-gradient(90deg, #00bfa5, #00acc1)',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 191, 165, 0.3)',
                      background: 'linear-gradient(90deg, #00a591, #0097a7)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
