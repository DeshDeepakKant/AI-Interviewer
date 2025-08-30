import React, { memo, useMemo } from "react";
import { NavLink } from "react-router";
import GlowingButton from "../subComponents/GlowingButton";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import QuizIcon from "@mui/icons-material/Quiz";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PsychologyIcon from "@mui/icons-material/Psychology";

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
    title: "Select Position",
    description:
      "Choose from various roles like Frontend, Backend, Fullstack, DevOps, AI/ML, Data Science, UI/UX, and more.",
    icon: WorkIcon,
  },
  {
    title: "Experience Level",
    description:
      "Select your experience level from Student/Fresher to 10+ years to get appropriate questions.",
    icon: BarChartIcon,
  },
  {
    title: "Interview Mode",
    description:
      "Choose between Guided Mode (📚) for structured guidance or Hard Mode (🔥) for challenging questions.",
    icon: SettingsIcon,
  },
  {
    title: "Number of Questions",
    description:
      "Customize your practice session with 5, 10, 15, 20, or 25+ questions based on your needs.",
    icon: QuizIcon,
  },
  {
    title: "Upload Resume",
    description:
      "Upload your resume and let our AI analyze your skills and experience to ask relevant questions.",
    icon: UploadFileIcon,
  },
  {
    title: "AI Interview Practice",
    description:
      "Practice with our AI interviewer tailored to your selected position, experience, preferences, and resume-based questions for a personalized interview experience.",
    icon: PsychologyIcon,
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
    alignItems: "flex-start",
    borderRadius: "16px",
    p: { xs: 4, sm: 5 },
    position: "relative",
    overflow: "hidden",
    maxWidth: { xs: 350, sm: 380 },
    mx: "auto",
    background: "linear-gradient(145deg, rgba(40, 50, 80, 0.6), rgba(30, 40, 70, 0.7))",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(0, 229, 201, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    willChange: "transform",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 16px 48px rgba(0, 229, 201, 0.2)",
      border: "1px solid rgba(0, 229, 201, 0.4)",
      "& .step-number": {
        background: "linear-gradient(135deg, #00e5c9, #1e88e5)",
        transform: "scale(1.1)",
        boxShadow: "0 8px 25px rgba(0, 229, 201, 0.4)",
      },
    },
  }), []);

  const stepNumberStyles = useMemo(() => ({
    width: 48,
    height: 48,
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(0, 229, 201, 0.9), rgba(30, 136, 229, 0.8))",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1.5rem",
    mb: 3,
    transition: "all 0.3s ease",
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    boxShadow: "0 4px 15px rgba(0, 229, 201, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  }), []);

  const iconStyles = useMemo(() => ({
    position: "absolute",
    top: 20,
    right: 20,
    fontSize: "2rem",
    opacity: 0.15,
    color: "#00e5c9",
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
        mb: { xs: 3, sm: 0 },
      }}
    >
      <motion.div
        variants={featureCardVariants}
        style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}
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
            className="step-number"
            sx={stepNumberStyles}
          >
            {index + 1}
          </Box>

          <Box
            sx={iconStyles}
            role="img"
            aria-label={`${feature.title} icon`}
          >
            <feature.icon />
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            id={`feature-title-${index}`}
            sx={{
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
              mb: 2,
              textAlign: "left",
              fontSize: { xs: '1.25rem', sm: '1.4rem' },
              fontFamily: '"Inter", "Segoe UI", sans-serif',
              lineHeight: 1.3,
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
            }}
          >
            {feature.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.6,
              color: "rgba(255, 255, 255, 0.75)",
              fontSize: { xs: '0.95rem', sm: '1rem' },
              fontFamily: '"Inter", "Segoe UI", sans-serif',
              textAlign: "left",
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
    py: { xs: 8, sm: 10, md: 12 },
    px: { xs: 2, sm: 3 },
    overflow: "hidden",
    position: "relative",
    zIndex: 2,
    color: "rgba(255, 255, 255, 0.9)",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(ellipse at center, 
        rgba(0, 229, 201, 0.08) 0%, 
        rgba(30, 136, 229, 0.05) 50%, 
        transparent 70%)`,
      animation: "breathe 6s ease-in-out infinite",
      "@keyframes breathe": {
        "0%, 100%": { 
          transform: "scale(1)",
          opacity: 0.3 
        },
        "50%": { 
          transform: "scale(1.05)",
          opacity: 0.5 
        },
      }
    },
  }), []);

  const titleStyles = useMemo(() => ({
    mb: { xs: 2, sm: 3 },
    fontWeight: 700,
    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
    background: `linear-gradient(135deg, 
      #ffffff 0%, 
      #00e5c9 25%, 
      #1e88e5 50%, 
      #ffffff 75%, 
      #00e5c9 100%)`,
    backgroundSize: "300% 300%",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    animation: "gradientText 4s ease infinite",
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    textShadow: "0 2px 10px rgba(0, 229, 201, 0.3)",
    "@keyframes gradientText": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  }), []);

  const subtitleStyles = useMemo(() => ({
    mb: { xs: 6, sm: 8, md: 10 },
    fontSize: { xs: '1.1rem', sm: '1.25rem' },
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    maxWidth: "600px",
    mx: "auto",
    lineHeight: 1.5,
    fontWeight: 400,
  }), []);

  const containerStyles = useMemo(() => ({
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "2px",
      height: "100%",
      background: `linear-gradient(180deg, 
        transparent 0%, 
        rgba(0, 229, 201, 0.3) 20%, 
        rgba(30, 136, 229, 0.3) 50%,
        rgba(0, 229, 201, 0.3) 80%, 
        transparent 100%)`,
      zIndex: 0,
      display: { xs: "none", md: "block" },
      animation: "flowLine 3s ease-in-out infinite",
      "@keyframes flowLine": {
        "0%": { 
          opacity: 0.3,
          transform: "translateX(-50%) scaleY(0.8)"
        },
        "50%": { 
          opacity: 0.6,
          transform: "translateX(-50%) scaleY(1)"
        },
        "100%": { 
          opacity: 0.3,
          transform: "translateX(-50%) scaleY(0.8)"
        },
      }
    }
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
      <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 4 } }}>
        <Box textAlign="center" mb={{ xs: 6, sm: 8 }}>
          <Typography
            variant="h2"
            component={motion.h2}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            sx={titleStyles}
          >
            How It Works
          </Typography>
          
          <Typography
            variant="h6"
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            sx={subtitleStyles}
          >
            Get started with your AI interview preparation in just a few simple steps
          </Typography>
        </Box>

        <Grid
          container
          spacing={{ xs: 4, sm: 5, md: 6 }}
          justifyContent="center"
          alignItems="stretch"
          component={motion.div}
          variants={featuresContainerVariants}
          sx={containerStyles}
        >
          {FEATURES_DATA.map((feature, idx) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={idx}
            />
          ))}
        </Grid>

        {/* Call to Action */}
        <Box 
          textAlign="center" 
          mt={{ xs: 8, sm: 10 }}
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              fontFamily: '"Inter", "Segoe UI", sans-serif',
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            Ready to ace your next interview?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.75)",
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontFamily: '"Inter", "Segoe UI", sans-serif',
            }}
          >
            Join thousands of professionals who have improved their interview skills with AI Interview
          </Typography>
        </Box>
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