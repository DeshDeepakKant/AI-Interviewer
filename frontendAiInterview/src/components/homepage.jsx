// HomePage.jsx
// Ensure you have these packages installed:
// npm install @mui/material @mui/icons-material @emotion/react @emotion/styled framer-motion

import React from 'react';
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
  Grid,
  Card,
  CardContent,
  CardActions,
  Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BusinessIcon from '@mui/icons-material/Business';
import { motion } from 'framer-motion';

const Navbar = () => {
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
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: 'white',
              background: 'linear-gradient(90deg, #00bfa5, #00acc1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI Interviewer
          </Typography>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {['Companies', 'Features', 'Pricing'].map((item) => (
              <Button 
                key={item} 
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
                {item}
              </Button>
            ))}
            <Button 
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
              sx={{
                ml: 2,
                background: 'linear-gradient(45deg, #00c7ae, #00bcd4)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(0, 191, 165, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00d7bd, #00ccff)',
                  boxShadow: '0 6px 20px rgba(0, 191, 165, 0.6)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>

          {/* Mobile Nav */}
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
                },
              }}
            >
              {['Companies', 'Features', 'Pricing', 'Login'].map((item) => (
                <MenuItem 
                  key={item} 
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
                  {item}
                </MenuItem>
              ))}
              <MenuItem onClick={handleClose}>
                <Button 
                  variant="contained" 
                  fullWidth
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

const HeroSection = () => (
  <Box className="page-background" sx={{ textAlign: 'center', py: 8 }}>
    <Container maxWidth="md">
      <Typography 
        variant="h3" 
        align="center" 
        gutterBottom 
        sx={{ 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 0.5,
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          mb: 4
        }}
      >
        {'AI INTERVIEW'.split('').map((char, index) => (
          <motion.span
            key={index}
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.2, 1],
              textShadow: [
                '0 2px 10px rgba(0, 0, 0, 0.2)',
                '0 5px 20px rgba(0, 199, 174, 0.5)',
                '0 2px 10px rgba(0, 0, 0, 0.2)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.05,
              ease: [0.4, 0, 0.2, 1],
              times: [0, 0.5, 1]
            }}
            style={{
              display: 'inline-block',
              color: index % 2 === 0 ? '#ffffff' : '#00e5c9',
              minWidth: char === ' ' ? '0.5em' : 'auto',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </Typography>
      <Typography variant="h6" align="center" paragraph sx={{ 
        mb: 4, 
        maxWidth: '700px', 
        mx: 'auto',
        color: 'rgba(255, 255, 255, 0.85)' 
      }}>
        Select a company, take an AI interview, and get one step closer to the job.
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        startIcon={
          <BusinessIcon sx={{ 
            fontSize: '1.3rem',
            transition: 'transform 0.3s ease',
            'button:hover &': {
              transform: 'scale(1.1)'
            }
          }} />
        }
        sx={{
          background: 'linear-gradient(45deg, #00c7ae, #00bcd4)',
          color: 'white',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1.1rem',
          px: 4,
          py: 1.5,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 199, 174, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 199, 174, 0.4)',
            background: 'linear-gradient(45deg, #00d7bd, #00ccff)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transition: '0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        Explore Companies
      </Button>
    </Container>
  </Box>
);

// Update the features array
const features = [
  {
    title: 'Select Companies',
    description: 'Choose from top companies that match your skills and experience level.',
    icon: '🎯'
  },
  {
    title: 'Upload Resume',
    description: 'Upload your resume and let our AI analyze your skills and experience.',
    icon: '📄'
  },
  {
    title: 'AI Interview Prep',
    description: 'Practice with our AI interviewer tailored to your target company.',
    icon: '🤖'
  }
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 50
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box
      component={motion.div}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="page-background"
      sx={{
        py: 10,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 2,
        color: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          sx={{
            mb: 8,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1565c0, #1e88e5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          How It Works
        </Typography>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {features.map((feature, idx) => (
            <Grid
              item
              xs={12}
              sm={4}
              md={4}
              key={feature.title}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <motion.div
                variants={cardVariants}
                style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4,
                    p: 4,
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    maxWidth: 340,
                    mx: 'auto',
                    background: 'linear-gradient(145deg, rgba(40, 50, 80, 0.4), rgba(20, 30, 50, 0.5))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px 0 rgba(0, 0, 0, 0.5)',
                      '&::before, &::after': {
                        opacity: 1
                      }
                    },
                    '&::before, &::after': {
                      content: '""',
                      position: 'absolute',
                      pointerEvents: 'none',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: 0.6
                    },
                    '&::before': {
                      top: '-50%',
                      left: '-50%',
                      right: '-50%',
                      bottom: '-50%',
                      background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                      transform: 'rotate(45deg)',
                    },
                    '&::after': {
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 'inherit',
                      background: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
                      boxShadow: 'inset 0 0 100px rgba(255, 255, 255, 0.05)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: '2.5rem',
                      mb: 3,
                      background: 'linear-gradient(135deg, #1e88e5, #1565c0)',
                      boxShadow: '0 4px 20px rgba(26, 115, 232, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        right: '-50%',
                        bottom: '-50%',
                        background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                        transform: 'rotate(45deg)',
                        pointerEvents: 'none',
                        transition: 'all 0.5s ease',
                        opacity: 0.7
                      },
                      '&:hover::before': {
                        left: '100%',
                        right: '-100%',
                        transition: 'all 0.8s ease'
                      }
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    align="center"
                    sx={{
                      mb: 3,
                      lineHeight: 1.7,
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '1rem'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const Footer = () => (
  <Box
    component="footer"
    sx={{
      py: 3,
      mt: 'auto',
      position: 'relative',
      zIndex: 2,
      background: 'rgba(10, 15, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      color: 'rgba(255, 255, 255, 0.9)'
    }}
  >
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          py: 1
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          © {new Date().getFullYear()} AI Interviewer
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Link
            href="#"
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              '&:hover': { 
                color: '#00e5c9',
                textDecoration: 'underline' 
              },
              transition: 'all 0.2s',
              px: 1,
              fontSize: '0.875rem'
            }}
          >
            Privacy
          </Link>
          <Box sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</Box>
          <Link
            href="#"
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              '&:hover': { 
                color: '#00e5c9',
                textDecoration: 'underline' 
              },
              transition: 'all 0.2s',
              px: 1,
              fontSize: '0.875rem'
            }}
          >
            Terms
          </Link>
          <Box sx={{ color: 'rgba(255, 255, 255, 0.1)' }}>•</Box>
          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
              <IconButton
                href="https://github.com"
                target="_blank"
                size="small"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    color: '#00e5c9',
                    background: 'rgba(0, 229, 201, 0.15)'
                  },
                  transition: 'all 0.2s',
                  width: 32,
                  height: 32
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton
                href="https://linkedin.com"
                target="_blank"
                size="small"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    color: '#00e5c9',
                    background: 'rgba(0, 229, 201, 0.15)'
                  },
                  transition: 'all 0.2s',
                  width: 32,
                  height: 32
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', pt: 8 }}> 
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </Box>
  );
}
