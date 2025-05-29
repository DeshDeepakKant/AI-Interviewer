import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography, Grid } from "@mui/material";
function ComingSoon() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ mt: 12, textAlign: "center" }}
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
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
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

      <Grid 
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        container 
        spacing={4} 
        justifyContent="center"
      >
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
          <Grid 
            component={motion.div}
            variants={itemVariants}
            item 
            xs={12} 
            sm={6} 
            md={3} 
            key={index}
          >
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
      <br />
    </Box>
  );
}

export default ComingSoon;