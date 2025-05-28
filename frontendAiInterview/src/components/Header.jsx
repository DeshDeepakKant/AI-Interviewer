import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import axios from "axios";

const navItems = [
  { name: "Companies", path: "/comingSoon" },
  { name: "Features", path: "/features" },
  { name: "Pricing", path: "/pricing" },
];

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const profileMenuOpen = Boolean(profileAnchorEl);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfileMenuOpen = (e) => setProfileAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/v1/user/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      handleProfileMenuClose();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
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
          setUser(response.data.data);
        } else {
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
      elevation={0}
      sx={{
        background: "rgba(10, 15, 26, 0.98)",
        backdropFilter: "blur(10px)",
        color: "#fff",
        zIndex: 1200,
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
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
            {navItems.map((item) => (
              <Button
                key={item.name}
                component={RouterLink}
                to={item.path}
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  px: 2,
                  "&:hover": {
                    color: "#00e5c9",
                    background: "rgba(0,191,165,0.15)",
                    borderRadius: 1,
                  },
                }}
              >
                {item.name}
              </Button>
            ))}

            {!isLoading && user ? (
              <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={
                      profileMenuOpen ? "account-menu" : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={profileMenuOpen ? "true" : undefined}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        "&:hover": {
                          transform: "scale(1.1)",
                          transition: "transform 0.2s",
                        },
                      }}
                    >
                      {user.fullName
                        ? user.fullName.charAt(0).toUpperCase()
                        : <AccountCircle />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={profileAnchorEl}
                  id="account-menu"
                  open={profileMenuOpen}
                  onClose={handleProfileMenuClose}
                  onClick={handleProfileMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                      mt: 1.5,
                      background: "rgba(10, 15, 26, 0.98)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 2,
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={() => navigate("/profile")}>
                    <Avatar /> Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Avatar /> Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <>
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
                    color: "#e0e0e0",
                    "&:hover": { background: "rgba(0,191,165,0.1)", color: "#00bfa5" },
                  }}
                >
                  {item.name}
                </MenuItem>
              ))}

              {!isLoading && user ? (
                <>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate("/profile");
                    }}
                    sx={{
                      color: "#e0e0e0",
                      "&:hover": { background: "rgba(0,191,165,0.1)", color: "#00bfa5" },
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      handleLogout();
                    }}
                    sx={{
                      color: "#e0e0e0",
                      "&:hover": { background: "rgba(0,191,165,0.1)", color: "#00bfa5" },
                    }}
                  >
                    Logout
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem
                    component={RouterLink}
                    to="/login"
                    onClick={handleClose}
                    sx={{
                      color: "#e0e0e0",
                      "&:hover": { background: "rgba(0,191,165,0.1)", color: "#00bfa5" },
                    }}
                  >
                    Login
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
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
