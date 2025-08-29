import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  RecordVoiceOver as VoiceIcon,
  Code as CodeIcon,
  Feedback as FeedbackIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
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
    scale: 1.02,
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

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const theme = useTheme();

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      custom={index}
      style={{ height: "100%" }}
    >
      <Card
        component={motion.div}
        whileHover="hover"
        whileTap="tap"
        variants={{
          hover: { y: -5 },
          tap: { scale: 0.98 }
        }}
        sx={{
          height: "100%",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: `0 10px 30px -5px ${theme.palette.primary.main}33`,
          },
        }}
      >
      <CardContent sx={{ p: 3, height: "100%" }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.primary.main}10)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Icon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
        </Box>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{ color: "white", fontWeight: 600, mb: 1.5 }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
    </motion.div>
  );
};

const Features = () => {
  const theme = useTheme();

  const features = [
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
      title: "Speech Recognition",
      description:
        "Our advanced speech-to-text technology accurately captures your responses.",
      color: "#00e5c9",
    },
    {
      icon: FeedbackIcon,
      title: "Instant Feedback",
      description:
        "Receive immediate, actionable feedback to improve your interview skills.",
      color: "#00b8d4",
    },
  ];

  return (
    <Box
      component={motion.section}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      id="features"
      sx={{
        position: "relative",
        py: 10,
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
      }}
    >
      <Container maxWidth="lg">
        <Box 
          component={motion.div}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          textAlign="center" 
          mb={6}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              color: "white",
              display: "flex",
              justifyContent: "center",
              gap: 0.5,
              fontFamily:
                '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              mb: 4,
            }}
          >
            {"Key Features".split("").map((char, index) => (
              <motion.span
                key={index}
                animate={{
                  y: [0, -15, 0],
                  scale: [1, 1.2, 1],
                  textShadow: [
                    "0 2px 10px rgba(0, 0, 0, 0.2)",
                    "0 5px 20px rgba(0, 199, 174, 0.5)",
                    "0 2px 10px rgba(0, 0, 0, 0.2)",
                  ],
                }}
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
          viewport={{ once: true, margin: "-100px" }}
          sx={{ 
            width: "100%", 
            maxWidth: "1200px", 
            mx: "auto" 
          }}
        >
          <AnimatePresence>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              style={{
                display: "flex",
                flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                alignItems: "center",
                marginBottom: "2rem",
                gap: "2rem",
              }}
              sx={{
                mb: 8,
                "&:last-child": {
                  mb: 0,
                },
                "@media (max-width: 900px)": {
                  flexDirection: "column",
                  textAlign: "center",
                },
              }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '2rem',
                  background: `linear-gradient(145deg, ${feature.color}15, ${feature.color}05)`,
                  borderRadius: '1rem',
                  border: "1px solid",
                  borderColor: `${feature.color}20`,
                  transition: "all 0.3s ease",
                }}
                sx={{
                  "@media (max-width: 900px)": {
                    width: "100%",
                    textAlign: "center",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}10)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    mx: index % 2 === 0 ? "auto" : { xs: "auto", md: "auto" },
                    "@media (min-width: 900px)": {
                      ml: index % 2 === 0 ? 0 : "auto",
                      mr: index % 2 === 0 ? "auto" : 0,
                    },
                  }}
                >
                  <feature.icon sx={{ fontSize: 40, color: feature.color }} />
                </Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ color: "white", mb: 2, fontWeight: 600 }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  {feature.description}
                </Typography>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  height: "300px",
                  background: `linear-gradient(145deg, ${feature.color}10, ${feature.color}05)`,
                  borderRadius: '1rem',
                  border: "1px solid",
                  borderColor: `${feature.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: feature.color,
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
                sx={{
                  "@media (max-width: 900px)": {
                    width: "100%",
                    height: "200px",
                  },
                }}
              >
                {index + 1}
              </motion.div>
            </motion.div>
          ))}
          </AnimatePresence>

        </Box>
      </Container>
    </Box>
  );
};

export default Features;
