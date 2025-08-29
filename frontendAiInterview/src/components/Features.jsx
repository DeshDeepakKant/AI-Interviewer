import React, { useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  RecordVoiceOver as VoiceIcon,
  UploadFile as UploadFileIcon,
  Psychology as PsychologyIcon,
  Work as WorkIcon,
  QuestionAnswer as QuestionAnswerIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

// Optimized animation variants with reduced complexity
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const fadeInUp = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Optimized Feature Card Component
const FeatureCard = React.memo(({ icon: IconComponent, title, description, index, color, isReversed }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Memoized styles to prevent recreation on each render
  const cardStyles = useMemo(() => ({
    flex: 1,
    p: { xs: 2, sm: 3 },
    background: `linear-gradient(145deg, ${color}15, ${color}05)`,
    borderRadius: 2,
    border: `1px solid ${color}20`,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: `0 8px 25px -5px ${color}33`,
    },
  }), [color]);

  const iconContainerStyles = useMemo(() => ({
    width: { xs: 60, sm: 80 },
    height: { xs: 60, sm: 80 },
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${color}30, ${color}10)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: { xs: 2, sm: 3 },
    mx: "auto",
  }), [color]);

  const placeholderStyles = useMemo(() => ({
    flex: 1,
    height: { xs: 200, sm: 250, md: 300 },
    background: `linear-gradient(145deg, ${color}10, ${color}05)`,
    borderRadius: 2,
    border: `1px solid ${color}20`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color,
    fontSize: { xs: "1.5rem", sm: "2rem" },
    fontWeight: "bold",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
    },
  }), [color]);

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : (isReversed ? "row-reverse" : "row"),
        alignItems: "center",
        marginBottom: "3rem",
        gap: "2rem",
        width: "100%",
      }}
    >
      <Box
        component={motion.div}
        whileHover={{ y: -4 }}
        sx={cardStyles}
      >
        <Box sx={iconContainerStyles}>
          <IconComponent sx={{ fontSize: { xs: 30, sm: 40 }, color: color }} />
        </Box>
        <Typography
          variant="h5"
          component="h3"
          sx={{ 
            color: "white", 
            mb: 2, 
            fontWeight: 600,
            textAlign: { xs: "center", md: "left" },
            fontSize: { xs: "1.25rem", sm: "1.5rem" }
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ 
            color: "rgba(255, 255, 255, 0.8)",
            textAlign: { xs: "center", md: "left" },
            fontSize: { xs: "0.9rem", sm: "1rem" }
          }}
        >
          {description}
        </Typography>
      </Box>

      <Box
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        sx={placeholderStyles}
      >
        {index + 1}
      </Box>
    </motion.div>
  );
});

const Features = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Memoized features data to prevent recreation
  const features = useMemo(() => [
    {
      icon: SchoolIcon,
      title: "Mock Interviews",
      description:
        "Practice with AI-powered mock interviews tailored to your target companies and roles.",
      color: "#00e5c9",
    },
    {
      icon: AssessmentIcon,
      title: "Performance Analysis",
      description:
        "Get detailed feedback on your answers, You can check all the feedback from your dashboard",
      color: "#00b8d4",
    },
    {
      icon: VoiceIcon,
      title: "AI Voice-Based Questions",
      description:
        "Experience realistic interviews with AI-generated voice questions and intelligent follow-up questions based on your previous answers.",
      color: "#00e5c9",
    },
    {
      icon: QuestionAnswerIcon,
      title: "Dynamic Follow-Up Questions",
      description:
        "AI intelligently asks follow-up questions based on your previous answers to dive deeper into your responses.",
      color: "#00b8d4",
    },
    {
      icon: UploadFileIcon,
      title: "Resume-Based Interviews",
      description:
        "Upload your resume and get personalized interview questions tailored to your skills and experience.",
      color: "#00b8d4",
    },
    {
      icon: WorkIcon,
      title: "Position-Specific Questions",
      description:
        "Select your target position and receive role-specific questions that match industry standards and scenarios.",
      color: "#00e5c9",
    },
    {
      icon: PsychologyIcon,
      title: "AI-Powered Analysis",
      description:
        "Get comprehensive feedback and actionable insights based on your resume, position, and experience level.",
      color: "#00b8d4",
    },
  ], []);

  // Optimized title animation with reduced complexity
  const titleChars = useMemo(() => "Key Features".split(""), []);

  // Memoized container styles
  const containerStyles = useMemo(() => ({
    position: "relative",
    py: { xs: 6, sm: 8, md: 10 },
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(circle at 20% 30%, ${theme.palette.primary.main}15 0%, transparent 40%)`,
      zIndex: -1,
    },
  }), [theme.palette.primary.main]);

  const titleStyles = useMemo(() => ({
    color: "white",
    display: "flex",
    justifyContent: "center",
    gap: 0.5,
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    mb: 4,
    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
    flexWrap: "wrap",
  }), []);

  return (
    <Box
      component={motion.section}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      id="features"
      sx={containerStyles}
    >
      <Container maxWidth="lg">
        <Box 
          component={motion.div}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          textAlign="center" 
          mb={{ xs: 4, sm: 6 }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={titleStyles}
          >
            {titleChars.map((char, index) => (
              <motion.span
                key={index}
                animate={!isMobile ? {
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                  textShadow: [
                    "0 2px 10px rgba(0, 0, 0, 0.2)",
                    "0 5px 20px rgba(0, 199, 174, 0.5)",
                    "0 2px 10px rgba(0, 0, 0, 0.2)",
                  ],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.05,
                  ease: [0.4, 0, 0.2, 1],
                  times: [0, 0.5, 1],
                }}
                style={{
                  display: "inline-block",
                  color: index % 2 === 0 ? "#ffffff" : "#00e5c9",
                  minWidth: char === " " ? "0.5em" : "auto",
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              maxWidth: 700,
              mx: "auto",
              mb: 2,
              px: { xs: 2, sm: 0 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Everything you need to ace your next technical interview
          </Typography>
        </Box>

        <Box 
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          sx={{ 
            width: "100%", 
            maxWidth: "1200px", 
            mx: "auto",
            px: { xs: 1, sm: 2 }
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={`${feature.title}-${index}`}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
              color={feature.color}
              isReversed={index % 2 !== 0}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Features;