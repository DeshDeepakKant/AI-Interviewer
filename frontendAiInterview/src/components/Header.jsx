import React, { useState, useEffect, useCallback } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SchoolIcon from "@mui/icons-material/School";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

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

const getNavItems = (role) => {
  if (role === "employer" || role === "admin") {
    return [
      { name: "Candidate Pipeline", path: "/employer", tab: "candidates" },
      { name: "Schedule Interview", path: "/employer?tab=invite", tab: "invite" },
      { name: "Job Campaigns", path: "/employer?tab=jobs", tab: "jobs" },
    ];
  }
  return [
    { name: "Mock Interview", path: "/mockInterviewWay" },
    { name: "Features", path: "/features" },
  ];
};

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, isLoading, isAuthenticated, logout: authLogout } = useAuth();
  const navItems = getNavItems(user?.role);

  const navigate = useNavigate();
  const location = useLocation();
  const open = Boolean(anchorEl);
  const profileMenuOpen = Boolean(profileAnchorEl);
  
  const isActive = (item) => {
    const itemPath = typeof item === 'string' ? item : item.path;
    const currentTab = new URLSearchParams(location.search).get("tab");
    
    if (location.pathname === "/employer") {
      if (item?.tab === "invite") return currentTab === "invite";
      if (item?.tab === "jobs") return currentTab === "jobs";
      if (item?.tab === "candidates" || itemPath === "/employer") return !currentTab || currentTab === "candidates";
    }

    if (itemPath === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(itemPath);
  };

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfileMenuOpen = (e) => {
    e.stopPropagation();
    setProfileAnchorEl(e.currentTarget);
  };
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);

    markNotificationsAsRead();
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const markNotificationsAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const loadNotifications = useCallback(() => {
    if (user) {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);

          const notificationsWithDates = parsed.map(notification => ({
            ...notification,
            timestamp: new Date(notification.timestamp)
          }));
          setNotifications(notificationsWithDates);
          setUnreadCount(notificationsWithDates.filter(n => !n.read).length);
        } catch (error) {
          console.error('Error parsing saved notifications:', error);
          fetchInitialNotifications();
        }
      } else {
        fetchInitialNotifications();
      }
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (notifications.length > 0) {
      const notificationsForStorage = notifications.map(notification => ({
        ...notification,
        timestamp: notification.timestamp.toISOString()
      }));
      localStorage.setItem('notifications', JSON.stringify(notificationsForStorage));
    }
  }, [notifications]);

  const fetchInitialNotifications = async () => {
    setLoadingNotifications(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockNotifications = [
        {
          id: 1,
          title: 'New Interview Scheduled',
          message: 'Your mock interview for Senior Frontend Engineer is scheduled for tomorrow at 2:00 PM',
          type: 'interview',
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: 2,
          title: 'Feedback Available',
          message: 'Your interview feedback is now available for review',
          type: 'feedback',
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          id: 3,
          title: 'New Feature Released',
          message: 'Check out our new practice questions for system design interviews',
          type: 'announcement',
          read: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      ];
      
      setNotifications(mockNotifications);
      const unread = mockNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      handleProfileMenuClose();
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "#FFFFFF",
        color: "#111111",
        zIndex: 1200,
        boxShadow: "none",
        borderBottom: "2px solid #111111",
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
              fontWeight: 800,
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              color: "#111111",
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              textDecoration: "none",
              "&:hover": { color: "#0044CC" },
            }}
          >
            AI Interviewer
          </Typography>

          {/* Desktop Nav */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: active ? "#0044CC" : "#111111",
                    textTransform: "uppercase",
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontSize: "0.85rem",
                    fontWeight: active ? 800 : 600,
                    letterSpacing: "0.03em",
                    px: 1.8,
                    py: 1,
                    position: "relative",
                    borderRadius: 0,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: active ? "rgba(0, 68, 204, 0.05)" : "transparent",
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: active ? "80%" : "0%",
                      height: "3px",
                      background: "#0044CC",
                      transition: "all 0.2s ease",
                    },
                    "&:hover": {
                      color: "#0044CC",
                      background: "rgba(0, 68, 204, 0.08)",
                      boxShadow: "none",
                      transform: "none",
                      "&:after": {
                        width: "80%",
                      },
                    },
                  }}
                >
                  {item.name}
                </Button>
              );
            })}

            {isAuthenticated ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
                {/* Notifications */}
                <Tooltip title="Notifications" arrow>
                  <IconButton
                    onClick={handleNotificationOpen}
                    sx={{
                      borderRadius: 0,
                      border: "1px solid #111111",
                      boxShadow: notificationAnchorEl ? "1px 1px 0 #111111" : "2px 2px 0 #111111",
                      backgroundColor: notificationAnchorEl ? "#ECECE9" : "#FFFFFF",
                      color: "#111111",
                      p: 1,
                      transform: notificationAnchorEl ? "translate(1px, 1px)" : "none",
                      transition: "all 0.1s ease",
                      "&:hover": { 
                        backgroundColor: "#ECECE9",
                        color: "#0044CC",
                      }
                    }}
                  >
                    <Badge 
                      badgeContent={unreadCount > 0 ? unreadCount : null} 
                      sx={{
                        "& .MuiBadge-badge": {
                          borderRadius: 0,
                          backgroundColor: "#0044CC",
                          color: "#FFFFFF",
                          fontFamily: '"Courier New", Courier, monospace',
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          height: 18,
                          minWidth: 18,
                        },
                      }}
                    >
                      {unreadCount > 0 ? <NotificationsActiveIcon sx={{ fontSize: 20, color: "#0044CC" }} /> : <NotificationsIcon sx={{ fontSize: 20 }} />}
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                {/* Notifications Dropdown */}
                <Menu
                  anchorEl={notificationAnchorEl}
                  open={Boolean(notificationAnchorEl)}
                  onClose={handleNotificationClose}
                  onClick={(e) => e.stopPropagation()}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 1.5,
                      width: 360,
                      maxHeight: 480,
                      overflow: 'hidden',
                      borderRadius: 0,
                      boxShadow: '6px 6px 0 #111111',
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #111111',
                      color: '#111111',
                      p: 0,
                      '& .MuiMenu-list': {
                        p: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  TransitionComponent={Fade}
                  transitionDuration={150}
                >
                  <Box sx={{ p: 2, backgroundColor: '#111111', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      [ NOTIFICATION FEED ]
                    </Typography>
                    {unreadCount > 0 && (
                      <Box sx={{ px: 1, py: 0.2, backgroundColor: '#0044CC', color: '#FFFFFF', fontFamily: '"Courier New", Courier, monospace', fontSize: '0.75rem', fontWeight: 700 }}>
                        {unreadCount} NEW
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
                    {loadingNotifications ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={24} sx={{ color: '#0044CC' }} />
                      </Box>
                    ) : notifications.length > 0 ? (
                      <List dense sx={{ p: 0 }}>
                        <AnimatePresence>
                          {notifications.map((notification) => (
                            <Box key={notification.id}>
                              <ListItemButton 
                                sx={{
                                  py: 1.5,
                                  px: 2,
                                  borderBottom: '1px solid #ECECE9',
                                  backgroundColor: !notification.read ? '#F6F9FF' : '#FFFFFF',
                                  borderLeft: !notification.read ? '4px solid #0044CC' : '4px solid transparent',
                                  '&:hover': {
                                    backgroundColor: '#ECECE9',
                                  },
                                }}
                              >
                                <ListItemAvatar sx={{ minWidth: 40, mr: 1 }}>
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: '#111111',
                                      color: '#FFFFFF',
                                    }}
                                  >
                                    {notification.type === 'interview' && <EventAvailableIcon fontSize="small" />}
                                    {notification.type === 'feedback' && <MarkEmailReadIcon fontSize="small" />}
                                    {notification.type === 'announcement' && <AnnouncementIcon fontSize="small" />}
                                  </Box>
                                </ListItemAvatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography 
                                    variant="subtitle2" 
                                    sx={{
                                      fontWeight: 700,
                                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                                      color: '#111111',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      fontSize: '0.85rem',
                                      mb: 0.25,
                                    }}
                                  >
                                    {notification.title}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{
                                      color: '#555555',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      fontSize: '0.78rem',
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {notification.message}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{
                                      display: 'block',
                                      color: '#888888',
                                      fontFamily: '"Courier New", Courier, monospace',
                                      fontSize: '0.68rem',
                                      mt: 0.5,
                                    }}
                                  >
                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                  </Typography>
                                </Box>
                              </ListItemButton>
                            </Box>
                          ))}
                        </AnimatePresence>
                      </List>
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 36, color: '#999999', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#555555', fontFamily: '"Courier New", Courier, monospace', fontWeight: 600 }}>
                          [ NO PENDING ALERTS ]
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Menu>
                
                {/* User Profile */}
                <Tooltip title="Account session" arrow>
                  <Box 
                    onClick={handleProfileMenuOpen}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      py: 0.6,
                      px: 1.2,
                      borderRadius: 0,
                      border: '1px solid #111111',
                      boxShadow: profileMenuOpen ? '1px 1px 0 #111111' : '3px 3px 0 #111111',
                      backgroundColor: profileMenuOpen ? '#ECECE9' : '#FFFFFF',
                      cursor: 'pointer',
                      transform: profileMenuOpen ? 'translate(1px, 1px)' : 'none',
                      transition: 'all 0.1s ease',
                      '&:hover': {
                        backgroundColor: '#ECECE9',
                        borderColor: '#0044CC',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 0,
                        backgroundColor: '#111111',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: '"Courier New", Courier, monospace',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                      }}
                    >
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                      <Typography 
                        sx={{ 
                          fontWeight: 800,
                          fontFamily: '"Helvetica Neue", Arial, sans-serif',
                          color: '#111111',
                          lineHeight: 1.1,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {user?.fullName || (isLoading ? 'Loading...' : 'User')}
                      </Typography>
                      <Typography 
                        sx={{ 
                          display: 'block', 
                          color: '#0044CC',
                          fontFamily: '"Courier New", Courier, monospace',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          lineHeight: 1.1,
                          textTransform: 'uppercase',
                        }}
                      >
                        [{user?.role || 'CANDIDATE'}]
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
                
                <Menu
                  anchorEl={profileAnchorEl}
                  open={profileMenuOpen}
                  onClose={handleProfileMenuClose}
                  onClick={handleProfileMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      minWidth: 240,
                      borderRadius: 0,
                      boxShadow: '6px 6px 0 #111111',
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #111111',
                      color: '#111111',
                      p: 0,
                      mt: 1.5,
                      '& .MuiMenuItem-root': {
                        fontFamily: '"Helvetica Neue", Arial, sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        px: 2.5,
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#ECECE9',
                          color: '#0044CC',
                        },
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  TransitionComponent={Fade}
                  transitionDuration={150}
                >
                  <Box sx={{ p: 2, backgroundColor: '#111111', color: '#FFFFFF' }}>
                    <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '0.7rem', color: '#66B2FF', fontWeight: 700, letterSpacing: '0.06em' }}>
                      [ AUTHENTICATED SESSION ]
                    </Typography>
                    <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF', textTransform: 'uppercase', mt: 0.5 }}>
                      {user?.fullName || 'Active User'}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '0.75rem', color: '#AAAAAA' }}>
                      {user?.email || 'No email recorded'}
                    </Typography>
                  </Box>
                  
                  <MenuItem 
                    onClick={() => {
                      handleProfileMenuClose();
                      if (user?.role === "employer" || user?.role === "admin") {
                        navigate("/employer");
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    sx={{
                      borderBottom: '1px solid #ECECE9',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                      {user?.role === "employer" || user?.role === "admin" ? <BusinessCenterIcon fontSize="small" /> : <SchoolIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary={user?.role === "employer" || user?.role === "admin" ? "Employer Command Center" : "Candidate Dossier"} />
                  </MenuItem>
                  
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      color: '#D32F2F !important',
                      '&:hover': {
                        backgroundColor: '#FFF0F0 !important',
                        color: '#B71C1C !important',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: '#D32F2F' }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" />
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                {isLoading ? (
                  <Box sx={{ width: 100, height: 36, border: '1px solid #CCCCCC', bgcolor: '#F0F0F0' }} />
                ) : !isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => navigate("/login")}
                      startIcon={<LoginIcon sx={{ fontSize: '18px !important' }} />}
                      sx={{
                        borderRadius: 0,
                        backgroundColor: "transparent",
                        color: "#111111",
                        border: "1px solid #111111",
                        boxShadow: "2px 2px 0 #111111",
                        py: 0.8,
                        px: 2,
                        fontFamily: '"Helvetica Neue", Arial, sans-serif',
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        transition: "all 0.1s ease",
                        "&:hover": {
                          backgroundColor: "#111111",
                          color: "#FFFFFF",
                          boxShadow: "1px 1px 0 #111111",
                          transform: "translate(1px, 1px)",
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/login?tab=signup")}
                      startIcon={<PersonAddIcon sx={{ fontSize: '18px !important' }} />}
                      sx={{
                        ml: 1.5,
                        borderRadius: 0,
                        backgroundColor: "#0044CC",
                        color: "#FFFFFF",
                        border: "1px solid #111111",
                        boxShadow: "3px 3px 0 #111111",
                        py: 0.8,
                        px: 2.2,
                        fontFamily: '"Helvetica Neue", Arial, sans-serif',
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        transition: "all 0.1s ease",
                        "&:hover": {
                          backgroundColor: "#003399",
                          borderColor: "#111111",
                          boxShadow: "1px 1px 0 #111111",
                          transform: "translate(1px, 1px)",
                        },
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                ) : null}
              </Box>
            )}
          </Box>

          {/* Mobile Nav */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton edge="end" onClick={handleMenu} sx={{ color: "#111111" }}>
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
                  minWidth: 240,
                  borderRadius: 0,
                  border: "2px solid #111111",
                  boxShadow: "4px 4px 0 #111111",
                  backgroundColor: "#FFFFFF",
                  color: "#111111",
                  p: 0,
                },
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.name}
                  onClick={() => {
                    handleClose();
                    navigate(item.path);
                  }}
                  sx={{
                    px: 3,
                    py: 1.5,
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                    color: isActive(item) ? "#0044CC" : "#111111",
                    fontWeight: isActive(item) ? 800 : 600,
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    textTransform: "uppercase",
                    fontSize: "0.85rem",
                    letterSpacing: "0.03em",
                    borderBottom: "1px solid #ECECE9",
                    "&:hover": {
                      background: "#ECECE9",
                      color: "#0044CC",
                    },
                  }}
                >
                  {item.name}
                </MenuItem>
              ))}
              
              {isAuthenticated ? (
                <>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      if (user?.role === "employer" || user?.role === "admin") {
                        navigate("/employer");
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    sx={{
                      px: 3,
                      py: 1.5,
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                      color: "#111111",
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      fontWeight: 700,
                      gap: 1.5,
                      borderBottom: "1px solid #ECECE9",
                      "&:hover": {
                        background: "#ECECE9",
                        color: "#0044CC",
                      },
                    }}
                  >
                    {user?.role === "employer" || user?.role === "admin" ? <BusinessCenterIcon fontSize="small" /> : <SchoolIcon fontSize="small" />}
                    <span>{user?.role === "employer" || user?.role === "admin" ? "Recruiter Portal" : "Candidate Dossier"}</span>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      handleLogout();
                    }}
                    sx={{
                      px: 3,
                      py: 1.5,
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                      color: "#D32F2F",
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      fontWeight: 700,
                      gap: 1.5,
                      "&:hover": {
                        background: "#FFF0F0",
                        color: "#B71C1C",
                      },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                    <span>Sign Out</span>
                  </MenuItem>
                </>
              ) : !isLoading && !isAuthenticated ? (
                <Box sx={{ p: 2 }}>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate("/login");
                    }}
                    sx={{
                      py: 1.2,
                      display: "flex",
                      alignItems: "center",
                      color: "#111111",
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "0.85rem",
                      gap: 1.5,
                      border: "1px solid #111111",
                      boxShadow: "2px 2px 0 #111111",
                      mb: 1.5,
                      "&:hover": {
                        background: "#111111",
                        color: "#FFFFFF",
                      },
                    }}
                  >
                    <LoginIcon fontSize="small" />
                    <span>Login</span>
                  </MenuItem>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PersonAddIcon />}
                    onClick={() => {
                      handleClose();
                      navigate("/login?tab=signup");
                    }}
                    sx={{
                      borderRadius: 0,
                      backgroundColor: "#0044CC",
                      color: "#FFFFFF",
                      border: "1px solid #111111",
                      boxShadow: "3px 3px 0 #111111",
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      py: 1.2,
                      "&:hover": {
                        backgroundColor: "#003399",
                        borderColor: "#111111",
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              ) : null}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
