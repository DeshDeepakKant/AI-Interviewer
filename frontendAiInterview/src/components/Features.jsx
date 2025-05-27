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
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 2,
        transition: "transform 0.3s, box-shadow 0.3s",
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
      component="section"
      id="features"
      sx={{
        position: "relative",
        py: 10,
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
        <Box textAlign="center" mb={6}>
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

        <Box sx={{ width: "100%", maxWidth: "1200px", mx: "auto" }}>
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                alignItems: "center",
                mb: 8,
                gap: 4,
                "&:last-child": {
                  mb: 0,
                },
                "@media (max-width: 900px)": {
                  flexDirection: "column",
                  textAlign: "center",
                },
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  p: 4,
                  background: `linear-gradient(145deg, ${feature.color}15, ${feature.color}05)`,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: `${feature.color}20`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 10px 30px -5px ${feature.color}33`,
                  },
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
              </Box>

              <Box
                sx={{
                  flex: 1,
                  height: "300px",
                  background: `linear-gradient(145deg, ${feature.color}10, ${feature.color}05)`,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: `${feature.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: feature.color,
                  fontSize: "2rem",
                  fontWeight: "bold",
                  "@media (max-width: 900px)": {
                    width: "100%",
                    height: "200px",
                  },
                }}
              >
                {index + 1}
              </Box>
            </Box>
          ))}

          {/* Upcoming Features Section */}
          <Box sx={{ mt: 12, textAlign: "center" }}>
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
              {"Coming Soon".split("").map((char, index) => (
                <motion.span
                  key={index}
                  animate={{
                    y: [0, -15, 0],
                    scale: [1, 1.2, 1],
                    textShadow: [
                      "0 2px 10px rgba(0, 0, 0, 0.2)",
                      "0 5px 20px rgba(199, 0, 10, 0.5)",
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

            <Grid container spacing={4} justifyContent="center">
              {[
                {
                  title: "Coding Challenges",
                  description:
                    "Practice with real-world coding problems and get instant feedback on your solutions.",
                  icon: "💻",
                  color: "#ff6b6b",
                },
                {
                  title: "Company-Specific Mocks",
                  description:
                    "Prepare for interviews at top tech companies with our specialized mock interviews.",
                  icon: "🏢",
                  color: "#4ecdc4",
                },
                {
                  title: "AI-Powered Feedback",
                  description:
                    "Get detailed analysis of your problem-solving approach.",
                  icon: "🤖",
                  color: "#ff9f43",
                },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box
                    sx={{
                      p: 3,
                      height: "100%",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        background: "rgba(255, 255, 255, 0.05)",
                        boxShadow: `0 10px 20px -5px ${feature.color}20`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: `${feature.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        mb: 2,
                        mx: "auto",
                        border: `1px solid ${feature.color}30`,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ color: "white", mb: 1.5, fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Features;
