import React, { memo, useMemo, useCallback } from "react";
import { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { NavLink } from "react-router";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200
    }
  }
};

const bouncingAnimation = {
  y: [0, -8, 0],
  scale: [1, 1.05, 1],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut",
    times: [0, 0.5, 1],
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
  hover: {
    y: -10,
    transition: { duration: 0.3 },
  },
  tap: { scale: 0.98 },
};

const fadeInUp = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const featureItem = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for beginners",
    features: [
      "10 Mock Interviews per week",
      "Basic Feedback",
      "Email Support",
      "Access to Community",
      "Limited Features",
    ],
    popular: false,
    buttonText: "Get Started",
    buttonVariant: "outlined",
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/month",
    description: "Best for serious candidates",
    features: [
      "Unlimited Mock Interviews",
      "Detailed Feedback",
      "Priority Support",
      "Company-Specific Questions",
      "Access to All Features",
    ],
    popular: true,
    buttonText: "Go Pro",
    buttonVariant: "contained",
    highlight: true,
  },
  {
    name: "Annual",
    price: "₹1599",
    period: "/year",
    description: "Best value - Save 33%",
    features: [
      "Everything in Pro",
      "12 Months Access",
      "Priority Support",
      "Progress Tracking",
      "Early Access to New Features",
    ],
    popular: false,
    buttonText: "Save 33%",
    buttonVariant: "outlined",
  },
];

const FeatureItem = memo(({ feature, index, theme }) => (
  <Box
    component="li"
    sx={{
      display: "flex",
      alignItems: "center",
      mb: { xs: 1.5, sm: 2 },
      color: "#e2e8f0",
    }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.1 
      }}
    >
      <CheckCircleIcon
        sx={{
          color: theme.palette.primary.main,
          fontSize: { xs: "1rem", sm: "1.2rem" },
          mr: { xs: 1, sm: 1.5 },
          flexShrink: 0,
          filter: 'drop-shadow(0 0 5px rgba(0, 191, 165, 0.7))',
          transition: 'all 0.3s ease',
        }}
      />
    </motion.div>
    <Typography 
      variant="body2"
      sx={{ 
        fontSize: { xs: '0.8rem', sm: '0.875rem' }
      }}
    >
      {feature}
    </Typography>
  </Box>
));

const PricingCard = memo(({ plan, index, theme }) => {
  const paperStyles = useMemo(() => ({
    height: "100%",
    borderRadius: { xs: 3, sm: 4 },
    overflow: "hidden",
    border: plan.highlight
      ? `2px solid ${theme.palette.primary.main}`
      : "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(10px)",
    position: "relative",
    "&:hover": {
      boxShadow: plan.highlight
        ? `0 10px 30px -5px ${theme.palette.primary.main}40`
        : "0 10px 30px -5px rgba(0, 0, 0, 0.2)",
    },
  }), [plan.highlight, theme]);

  const buttonStyles = useMemo(() => ({
    py: { xs: 1.2, sm: 1.5 },
    borderRadius: 2,
    fontWeight: 600,
    mb: { xs: 2, sm: 3 },
    fontSize: { xs: '0.875rem', sm: '1rem' }, 
    background: plan.highlight
      ? `linear-gradient(45deg, ${theme.palette.primary.main}, #00b0ff)`
      : "rgba(255, 255, 255, 0.05)",
    border: plan.highlight 
      ? 'none' 
      : '1px solid rgba(255, 255, 255, 0.1)',
    color: plan.highlight ? '#fff' : '#e2e8f0',
    '&:hover': {
      background: plan.highlight
        ? `linear-gradient(45deg, ${theme.palette.primary.dark}, #0091ea)`
        : 'rgba(255, 255, 255, 0.1)',
      boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
    },
  }), [plan.highlight, theme]);

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover="hover"
      whileTap="tap"
      style={{ height: '100%' }}
    >
      <Paper elevation={plan.highlight ? 8 : 2} sx={paperStyles}>
        {plan.popular && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: { xs: 15, sm: 20 }, 
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              px: { xs: 1.5, sm: 2 },
              py: 0.5,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Most Popular
          </Box>
        )}
        <Box 
          p={{ xs: 3, sm: 4 }} 
          sx={{
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
              transform: 'translateX(-100%)',
              transition: 'transform 0.6s ease',
            },
            '&:hover::before': {
              transform: 'translateX(100%)',
            },
          }}
        >
          <Typography
            variant="h5"
            component="h3"
            sx={{ 
              color: "white", 
              mb: 1, 
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' } 
            }}
          >
            {plan.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              color: "#94a3b8", 
              mb: { xs: 2, sm: 3 },
              minHeight: { xs: 35, sm: 40 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {plan.description}
          </Typography>

          <Box
            sx={{ 
              display: "flex", 
              alignItems: "baseline", 
              mb: { xs: 2, sm: 3 } 
            }}
          >
            <Typography
              variant="h3"
              sx={{ 
                color: "white", 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              {plan.price}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                ml: 1, 
                color: "#94a3b8",
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {plan.period}
            </Typography>
          </Box>

          <NavLink to="/login" style={{ textDecoration: 'none' }}>
            <Button
              component={motion.button}
              fullWidth
              variant={plan.buttonVariant}
              size="large"
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              sx={buttonStyles}
            >
              {plan.buttonText}
            </Button>
          </NavLink>

          <Box 
            component="ul" 
            sx={{ 
              p: 0, 
              m: 0, 
              listStyle: "none"
            }}
          >
            {plan.features.map((feature, i) => (
              <FeatureItem 
                key={i} 
                feature={feature} 
                index={i} 
                theme={theme} 
              />
            ))}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
});

const Pricing = memo(() => {
  const theme = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const titleLetters = useMemo(() => 
    "AFFORDABLE PRICING".split("").map((char, index) => ({
      char: char === " " ? "\u00A0" : char,
      index,
      isSpace: char === " "
    })), []
  );

  const mainContainerStyles = useMemo(() => ({
    minHeight: "100vh",
    pt: { xs: 12, sm: 14, md: 16 },
    pb: { xs: 6, sm: 8, md: 10 }, 
    background: "linear-gradient(180deg, #0a1929 0%, #0a0f1e 100%)",
    position: "relative",
    overflowX: "hidden",
    overflowY: "auto",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "100%",
      background:
        "radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.1) 0%, transparent 60%)",
      zIndex: 0,
    },
  }), []);


  const titleStyles = useMemo(() => ({
    color: "white",
    display: "flex",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: { xs: 0.1, sm: 0.2, md: 0.3 },
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 700,
    letterSpacing: { xs: "0.01em", sm: "0.03em", md: "0.08em" }, 
    textTransform: "uppercase",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    mb: 3,
    fontSize: { xs: '1.4rem', sm: '2rem', md: '2.8rem', lg: '3.5rem' }, 
    lineHeight: { xs: 1.1, sm: 1.1 },
    width: "100%",
    overflow: "visible",
    minHeight: { xs: '60px', sm: '80px', md: 'auto' }, 
    padding: { xs: '10px 5px', sm: '15px 10px', md: '20px 15px' },
    whiteSpace: "nowrap",
  }), []);

  const subtitleStyles = useMemo(() => ({
    color: "#94a3b8",
    maxWidth: { xs: '90%', sm: 700 },
    fontSize: { xs: '1rem', sm: '1.25rem' },
    px: { xs: 2, sm: 0 },
  }), []);

  return (
    <Box
      component={motion.section}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      id="pricing"
      sx={mainContainerStyles}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          px: { xs: 2, sm: 3 },
        }}
      >
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ 
            textAlign: "center", 
            marginBottom: '3rem',
            padding: '0 10px', 
            overflow: 'visible',
            width: '100%'
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'visible',
              minHeight: { xs: '60px', sm: '80px' }
            }}
          >
            <Typography
              variant="h2"
              align="center"
              gutterBottom
              component={motion.h1}
              variants={titleVariants}
              initial="hidden"
              animate="visible"
              sx={titleStyles}
              role="heading"
              aria-level="1"
            >
              {titleLetters.map(({ char, index, isSpace }) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  animate={{
                    ...bouncingAnimation,
                    transition: {
                      ...bouncingAnimation.transition,
                      delay: index * 0.1,
                    }
                  }}
                  style={{
                    display: "inline-block",
                    color: index % 2 === 0 ? "#ffffff" : "#00e5c9",
                    minWidth: isSpace ? "0.3em" : "auto",
                    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                    willChange: "transform",
                    fontSize: "inherit", 
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    transition: { duration: 0.2 }
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </Typography>
          </Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={subtitleStyles}
            >
              Choose the perfect plan for your interview preparation journey. All
              plans include a 7-day money-back guarantee.
            </Typography>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{ width: '100%' }}
        >
          <Grid
            container
            spacing={{ xs: 3, sm: 4 }}
            justifyContent="center"
            alignItems="stretch"
          >
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PricingCard 
                  plan={plan} 
                  index={index} 
                  theme={theme} 
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ 
            textAlign: "center", 
            marginTop: '2.5rem',
            marginBottom: '1rem'
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              color: "#94a3b8",
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 0 } 
            }}
          >
            Need a custom plan? Contact us at deshdeepakkant@gmail.com
          </Typography>
        </motion.div>
        <Box sx={{ flexGrow: 1 }} />
      </Container>
    </Box>
  );
});

export default Pricing;
