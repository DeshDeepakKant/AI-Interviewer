import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import axios from "axios";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

const scaleUp = {
  hover: { 
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.98 }
};

const navItems = [
  { name: "Companies", path: "/comingSoon" },
  { name: "Mock Interview", path: "/mockInterviewWay" },
  { name: "Features", path: "/features" },
  { name: "Pricing", path: "/pricing" },
];

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // Get user from localStorage to maintain during verification
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const open = Boolean(anchorEl);
  const profileMenuOpen = Boolean(profileAnchorEl);
  
  // Check if current path matches nav item path
  const isActive = (path) => {
    // Special handling for home path
    if (path === '/') {
      return location.pathname === path;
    }
    // For other paths, check if the current path starts with the item's path
    return location.pathname.startsWith(path);
  };

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfileMenuOpen = (e) => {
    e.stopPropagation();
    setProfileAnchorEl(e.currentTarget);
  };
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/v1/user/logout",
        {}, // Empty body
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear user state
      setUser(null);
      handleProfileMenuClose();
      
      // Navigate to login
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if there's an error, clear the local state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          "/api/v1/user/currentUser",
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        // HTTP‐level + JSON‐level success
        if (response.status === 200 && response.data.success) {
          const userData = response.data.data;
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        } else {
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "rgba(16, 20, 30, 0.98)",
        backdropFilter: "blur(10px)",
        color: "#fff",
        zIndex: 1200,
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "all 0.3s ease",
        '&:hover': {
          background: "rgba(20, 25, 35, 0.98)",
          boxShadow: "0 6px 35px rgba(0, 0, 0, 0.15)"
        }
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
              background: "linear-gradient(90deg, #00bfa5, #00acc1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textDecoration: "none",
              "&:hover": { opacity: 0.9 },
            }}
          >
            AI Interviewer
          </Typography>

          {/* Desktop Nav */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Button
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: active ? "#00e5c9" : "rgba(255,255,255,0.9)",
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: active ? 600 : 500,
                    px: 2,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: active ? '60%' : '0%',
                      height: '2px',
                      background: '#00e5c9',
                      borderRadius: '2px',
                      transition: 'all 0.3s ease',
                    },
                    '&:hover': {
                      color: "#00e5c9",
                      background: "rgba(0,191,165,0.1)",
                      borderRadius: 1,
                      '&:after': {
                        width: '60%',
                      }
                    },
                  }}
                >
                  {item.name}
                </Button>
              );
            })}

            {user !== null || isLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Notifications */}
                <Tooltip title="Notifications" arrow>
                  <motion.div whileHover="hover" whileTap="tap" variants={scaleUp}>
                    <IconButton
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        position: "relative",
                        "&:hover": { 
                          color: "#00e5c9",
                          background: "rgba(0,191,165,0.1)" 
                        }
                      }}
                    >
                      <Badge 
                        badgeContent={3} 
                        color="error" 
                        variant="dot"
                        overlap="circular"
                      >
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </motion.div>
                </Tooltip>
                
                {/* User Profile */}
                <Tooltip title="Account settings" arrow>
                  <motion.div 
                    variants={scaleUp}
                    whileHover="hover"
                    whileTap="tap"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Box 
                      onClick={handleProfileMenuOpen}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 0.5,
                        pr: 1.5,
                        borderRadius: 4,
                        border: `1px solid ${profileMenuOpen ? 'rgba(0,191,165,0.3)' : 'rgba(255,255,255,0.05)'}`,
                        background: profileMenuOpen ? 'rgba(0,191,165,0.1)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(0,191,165,0.15)',
                          borderColor: 'rgba(0,191,165,0.5)'
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "primary.main",
                          background: "linear-gradient(135deg, #00bfa5 0%, #00acc1 100%)",
                          fontWeight: 600,
                          fontSize: "1rem",
                          boxShadow: "0 4px 12px rgba(0,191,165,0.2)",
                          border: "2px solid rgba(255,255,255,0.1)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {user?.fullName
                          ? user.fullName.charAt(0).toUpperCase()
                          : isLoading
                            ? '...'
                            : <AccountCircle />}
                      </Avatar>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.9)",
                            lineHeight: 1.2,
                            fontSize: '0.85rem'
                          }}
                        >
                          {user?.fullName || (isLoading ? 'Loading...' : 'User')}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            color: "rgba(255,255,255,0.6)",
                            fontSize: '0.7rem',
                            lineHeight: 1.2
                          }}
                        >
                          {user?.email || (isLoading ? 'Verifying...' : 'Premium Member')}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Tooltip>
                <Menu
                  anchorEl={profileAnchorEl}
                  open={profileMenuOpen}
                  onClose={handleProfileMenuClose}
                  onClick={handleProfileMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      minWidth: 220,
                      overflow: "visible",
                      filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.2))",
                      mt: 1.5,
                      background: "rgba(22, 28, 42, 0.98)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: '12px',
                      py: 0.5,
                      "& .MuiMenuItem-root": {
                        px: 2,
                        py: '10px',
                        color: "rgba(255,255,255,0.8)",
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(0, 191, 165, 0.1)',
                          color: '#00e5c9',
                          '& .MuiSvgIcon-root': {
                            color: '#00e5c9',
                          }
                        },
                      },
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: -6,
                        right: 20,
                        width: 12,
                        height: 12,
                        bgcolor: "rgba(22, 28, 42, 0.98)",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        borderLeft: "1px solid rgba(255,255,255,0.1)",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  TransitionComponent={Fade}
                  transitionDuration={150}
                >
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle2" sx={{ color: '#00e5c9', fontWeight: 600, fontSize: '0.9rem' }}>
                      {user?.fullName || 'Welcome Back'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '0.75rem' }}>
                      {user?.email || 'Premium Member'}
                    </Typography>
                  </Box>
                  
                  <MenuItem 
                    component={motion.div}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText onClick={() => {
                      handleProfileMenuClose();
                      navigate("/dashboard");
                    }}>My Profile</ListItemText>
                  </MenuItem>
                  
                  <Divider sx={{ my: 0.5, bgcolor: 'rgba(255,255,255,0.05)' }} />
                  
                  <MenuItem 
                    component={motion.div}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleLogout}
                    sx={{ color: '#ff6b6b' }}
                  >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <>
              {!isLoading && !user ? (
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{
                    ml: 1,
                    color: "rgba(255,255,255,0.9)",
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      color: "#00e5c9",
                      background: "rgba(0,191,165,0.15)",
                      borderRadius: 1,
                    },
                  }}
                >
                  Login
                </Button>
              ) : null}
              {!isLoading && !user ? (
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    ml: 2,
                    background:
                      "linear-gradient(45deg, #00bfa5 30%, #00acc1 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #00897b 30%, #00838f 90%)",
                    },
                  }}
                >
                  Sign Up
                </Button>
                 ) : null}
              </>
            )}
          </Box>

          {/* Mobile Nav */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton edge="end" onClick={handleMenu} sx={{ color: "#e0e0e0" }}>
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
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  background: "rgba(10, 15, 26, 0.98)",
                  backdropFilter: "blur(20px)",
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
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    color: isActive(item.path) ? "#00e5c9" : "#e0e0e0",
                    fontWeight: isActive(item.path) ? 600 : 400,
                    "&:hover": { 
                      background: "rgba(0,191,165,0.1)", 
                      color: "#00e5c9" 
                    },
                  }}
                >
                  {item.name}
                </MenuItem>
              ))}
              
              {user !== null || isLoading ? (
                <>
                  <Divider sx={{ my: 0.5, bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate("/dashboard");
                    }}
                    sx={{
                      px: 3,
                      py: 1.5,
                      minHeight: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      color: "#e0e0e0",
                      "&:hover": { 
                        background: "rgba(0,191,165,0.1)", 
                        color: "#00e5c9" 
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40, margin: 0 }}>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <span>Profile</span>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      handleLogout();
                    }}
                    sx={{
                      px: 3,
                      py: 1.5,
                      minHeight: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      color: "#e0e0e0",
                      "&:hover": { 
                        background: "rgba(0,191,165,0.1)", 
                        color: "#00e5c9" 
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40, margin: 0 }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <span>Logout</span>
                  </MenuItem>
                </> 
              ) : !isLoading && user === null ? (
                <>
                  <MenuItem
                    component={RouterLink}
                    to="/login"
                    onClick={handleClose}
                    sx={{
                      px: 3,
                      py: 1.5,
                      minHeight: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      color: "#e0e0e0",
                      "&:hover": { 
                        background: "rgba(0,191,165,0.1)", 
                        color: "#00e5c9" 
                      },
                    }}
                  >
                    <span>Login</span>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <Button
                      variant="contained"
                      fullWidth
                      component={RouterLink}
                      to="/signup"
                      sx={{
                        background:
                          "linear-gradient(45deg, #00bfa5 30%, #00acc1 90%)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #00897b 30%, #00838f 90%)",
                        },
                      }}
                    >
                      Sign Up
                    </Button>
                  </MenuItem>
                </>
              ) : null}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
