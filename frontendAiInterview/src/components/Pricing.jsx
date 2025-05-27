import React from 'react';
import {useEffect} from 'react';
import { Box, Container, Typography, Button, Grid, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Pricing = () => {
  const theme = useTheme();

  // Add smooth scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for beginners',
      features: [
        '10 Mock Interviews per week',
        'Basic Feedback',
        'Email Support',
        'Access to Community',
        'Limited Features'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'outlined'
    },
    {
      name: 'Pro',
      price: '₹199',
      period: '/month',
      description: 'Best for serious candidates',
      features: [
        'Unlimited Mock Interviews',
        'Detailed Feedback',
        'Priority Support',
        'Company-Specific Questions',
        'Access to All Features'
      ],
      popular: true,
      buttonText: 'Go Pro',
      buttonVariant: 'contained',
      highlight: true
    },
    {
      name: 'Annual',
      price: '₹1599',
      period: '/year',
      description: 'Best value - Save 33%',
      features: [
        'Everything in Pro',
        '12 Months Access',
        'Priority Support',
        'Progress Tracking',
        'Early Access to New Features'
      ],
      popular: false,
      buttonText: 'Save 33%',
      buttonVariant: 'outlined'
    }
  ];

  return (
    <Box 
      component="section" 
      id="pricing"
      sx={{
        minHeight: '100vh',
        py: 10,
        background: 'linear-gradient(180deg, #0a1929 0%, #0a0f1e 100%)',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.1) 0%, transparent 60%)',
          zIndex: 0,
        },
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box textAlign="center" mb={8}>
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
              mb: 2
            }}
          >
            {'Affordable Pricing'.split('').map((char, index) => (
              <motion.span
                key={index}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.05,
                  ease: [0.4, 0, 0.2, 1],
                }}
                style={{
                  display: 'inline-block',
                  color: index % 2 === 0 ? '#ffffff' : '#00e5c9',
                  minWidth: char === ' ' ? '0.5em' : 'auto',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ color: '#94a3b8', maxWidth: 700, mx: 'auto' }}>
            Choose the perfect plan for your interview preparation journey. All plans include a 7-day money-back guarantee.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {pricingPlans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={plan.highlight ? 8 : 2}
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: plan.highlight ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: plan.highlight 
                        ? `0 10px 30px -5px ${theme.palette.primary.main}40` 
                        : '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  {plan.popular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 20,
                        bgcolor: theme.palette.primary.main,
                        color: '#fff',
                        px: 2,
                        py: 0.5,
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Most Popular
                    </Box>
                  )}
                  <Box p={4}>
                    <Typography variant="h5" component="h3" sx={{ color: 'white', mb: 1, fontWeight: 700 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#94a3b8', mb: 3, minHeight: 40 }}>
                      {plan.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                      <Typography variant="h3" sx={{ color: 'white', fontWeight: 800 }}>
                        {plan.price}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ ml: 1, color: '#94a3b8' }}>
                        {plan.period}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant={plan.buttonVariant}
                      size="large"
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        mb: 3,
                        background: plan.highlight ? `linear-gradient(45deg, ${theme.palette.primary.main}, #00b0ff)` : 'transparent',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                        },
                      }}
                    >
                      {plan.buttonText}
                    </Button>

                    <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                      {plan.features.map((feature, i) => (
                        <Box 
                          key={i} 
                          component="li" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mb: 2,
                            color: '#e2e8f0',
                          }}
                        >
                          <CheckCircleIcon 
                            sx={{ 
                              color: theme.palette.primary.main, 
                              fontSize: '1.2rem',
                              mr: 1.5,
                              flexShrink: 0,
                            }} 
                          />
                          <Typography variant="body2">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={6}>
          <Typography variant="body2" color="text.secondary" sx={{ color: '#94a3b8' }}>
            Need a custom plan? Contact us at support@aiinterviewprep.com
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
      </Container>
    </Box>
  );
};

export default Pricing;
