import React, { memo, useMemo } from "react";
import { NavLink } from "react-router";
import GlowingButton from "../subComponents/GlowingButton";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";

import {
  Typography,
  Box,
  Container,
  Grid,
  Card,
  Stack,
} from "@mui/material";

import { motion } from "framer-motion";


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

// Optimized bouncing animation for letters - reduced movement for cleaner look
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

const buttonContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.6
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300
    }
  }
};

const HeroSection = memo(() => {
  // Memoize title letters to prevent recreation on every render
  const titleLetters = useMemo(() => 
    "AI INTERVIEW".split("").map((char, index) => ({
      char: char === " " ? "\u00A0" : char,
      index,
      isSpace: char === " "
    })), []
  );

  const titleStyles = useMemo(() => ({
    color: "white",
    display: "flex",
    justifyContent: "center",
    gap: 0.3,
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    mb: 3,
    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }, // Responsive sizing, much smaller
  }), []);

  return (
    <Box 
      sx={{ 
        textAlign: "center", 
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: { xs: 2, sm: 3 }, // Responsive horizontal padding
        minHeight: { xs: '80vh', md: '90vh' } // Adjust height for mobile
      }}
      component="section"
      aria-label="Hero section"
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
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
                  delay: index * 0.1, // Staggered delay for wave effect
                }
              }}
              style={{
                display: "inline-block",
                color: index % 2 === 0 ? "#ffffff" : "#00e5c9",
                minWidth: isSpace ? "0.5em" : "auto",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                // Use transform instead of animating position properties for better performance
                willChange: "transform"
              }}
              whileHover={{ 
                scale: 1.2,
                transition: { duration: 0.2 }
              }}
            >
              {char}
            </motion.span>
          ))}
        </Typography>
        
        <Typography
          variant="h6"
          align="center"
          paragraph
          component={motion.p}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          sx={{
            mb: { xs: 3, sm: 4 }, // Responsive margin
            maxWidth: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width
            mx: "auto",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, // Better responsive sizing
            fontWeight: 400,
            lineHeight: { xs: 1.4, sm: 1.5 }, // Better line height for mobile
          }}
        >
Upload your resume, select a field, take an AI interview, and get one step closer to the job
        </Typography>
        
        <Stack 
          direction={{ xs: "column", sm: "row" }} // Stack vertically on mobile
          spacing={{ xs: 2, sm: 3 }} // Adjust spacing based on screen size
          justifyContent="center"
          alignItems="center"
          component={motion.div}
          variants={buttonContainerVariants}
          initial="hidden"
          animate="visible"
          sx={{ 
            mt: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 0 } // Padding for mobile
          }}
        >
          {/* <motion.div
            variants={buttonVariants}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <GlowingButton
              name="Explore Companies"
              icon={BusinessIcon}
              component={NavLink}
              to="/comingSoon"
              aria-label="Navigate to explore companies page"
            />
          </motion.div> */}
          <motion.div
            variants={buttonVariants}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <GlowingButton
              name="Mock Interview"
              icon={SchoolIcon}
              component={NavLink}
              to="/mockInterviewWay"
              aria-label="Navigate to mock interview page"
            />
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
});

// Optimized features data - moved outside component and memoized
const FEATURES_DATA = [
  {
    title: "Select Companies",
    description:
      "Choose from top companies that match your skills and experience level.",
    icon: "🎯",
  },
  {
    title: "Upload Resume",
    description:
      "Upload your resume and let our AI analyze your skills and experience.",
    icon: "📄",
  },
  {
    title: "AI Interview Prep",
    description:
      "Practice with our AI interviewer tailored to your target company.",
    icon: "🤖",
  },
];

// Optimized animation variants for features section
const featuresContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    },
  },
};

const featureCardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.6
    },
  },
};

const FeatureCard = memo(({ feature, index }) => {
  const cardStyles = useMemo(() => ({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 4,
    p: { xs: 3, sm: 4 }, // Responsive padding
    position: "relative",
    overflow: "hidden",
    maxWidth: { xs: 320, sm: 340 }, // Responsive max width
    mx: "auto",
    background:
      "linear-gradient(145deg, rgba(40, 50, 80, 0.4), rgba(20, 30, 50, 0.5))",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    willChange: "transform",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 16px 48px 0 rgba(0, 0, 0, 0.5)",
    },
  }), []);

  const iconStyles = useMemo(() => ({
    width: { xs: 70, sm: 80 }, // Responsive icon size
    height: { xs: 70, sm: 80 },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontSize: { xs: "2rem", sm: "2.5rem" }, // Responsive font size
    mb: { xs: 2, sm: 3 }, // Responsive margin
    background: "linear-gradient(135deg, #1e88e5, #1565c0)",
    boxShadow: "0 4px 20px rgba(26, 115, 232, 0.3)",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.3s ease",
    willChange: "transform"
  }), []);

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={4}
      sx={{
        display: "flex",
        justifyContent: "center",
        mb: { xs: 2, sm: 0 }, // Bottom margin for mobile stacking
      }}
    >
      <motion.div
        variants={featureCardVariants}
        style={{ width: "100%", maxWidth: 340, margin: "0 auto" }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        <Card
          elevation={0}
          sx={cardStyles}
          role="article"
          aria-labelledby={`feature-title-${index}`}
        >
          <Box
            sx={iconStyles}
            component={motion.div}
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 }
            }}
            role="img"
            aria-label={`${feature.title} icon`}
          >
            {feature.icon}
          </Box>
          <Typography
            variant="h5"
            gutterBottom
            id={`feature-title-${index}`}
            sx={{
              fontWeight: 700,
              color: "white",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
              mb: { xs: 1.5, sm: 2 }, // Responsive margin
              textAlign: "center",
              fontSize: { xs: '1.1rem', sm: '1.25rem' }, // Responsive font size
            }}
          >
            {feature.title}
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              mb: { xs: 2, sm: 3 }, // Responsive margin
              lineHeight: { xs: 1.5, sm: 1.7 }, // Better line height
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: { xs: '0.9rem', sm: '1rem' }, // Responsive font size
              px: { xs: 1, sm: 0 }, // Padding for mobile
            }}
          >
            {feature.description}
          </Typography>
        </Card>
      </motion.div>
    </Grid>
  );
});

const FeaturesSection = memo(() => {
  const sectionStyles = useMemo(() => ({
    py: { xs: 6, sm: 8, md: 10 }, // Responsive padding
    px: { xs: 2, sm: 3 }, // Responsive horizontal padding
    overflow: "hidden",
    position: "relative",
    zIndex: 2,
    color: "rgba(255, 255, 255, 0.9)",
  }), []);

  const titleStyles = useMemo(() => ({
    mb: { xs: 4, sm: 6, md: 8 }, // Responsive margin
    fontWeight: "bold",
    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, // Responsive font size
    background: "linear-gradient(45deg, #1565c0, #1e88e5)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  }), []);

  return (
    <Box
      component={motion.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={featuresContainerVariants}
      sx={sectionStyles}
      aria-label="How it works section"
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          component={motion.h2}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={titleStyles}
        >
          How It Works
        </Typography>
        <Grid
          container
          spacing={{ xs: 3, sm: 4, md: 5 }} // Responsive spacing
          justifyContent="center"
          alignItems="stretch"
          component={motion.div}
          variants={featuresContainerVariants}
          sx={{ mt: { xs: 2, sm: 4 } }} // Responsive top margin
        >
          {FEATURES_DATA.map((feature, idx) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={idx}
            />
          ))}
        </Grid>
      </Container>
    </Box>
  );
});

// Add display names for debugging
HeroSection.displayName = 'HeroSection';
FeaturesSection.displayName = 'FeaturesSection';
FeatureCard.displayName = 'FeatureCard';

const HomePage = memo(() => {
  return (
    <main role="main" className="hero-background" style={{ minHeight: '100vh' }}>
      <HeroSection />
      <FeaturesSection />
    </main>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
