import React, { memo } from "react";
import { NavLink } from "react-router";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import QuizIcon from "@mui/icons-material/Quiz";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PsychologyIcon from "@mui/icons-material/Psychology";
import WhatshotIcon from "@mui/icons-material/Whatshot";

import {
  Typography,
  Box,
  Container,
  Grid,
  Button
} from "@mui/material";

const HeroSection = memo(() => {
  return (
    <Box 
      sx={{ 
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: { xs: 2, sm: 4, md: 8 },
        minHeight: { xs: '70vh', md: '80vh' },
        borderBottom: "2px solid #111",
        backgroundColor: "var(--dark-bg)"
      }}
      component="section"
      aria-label="Hero section"
    >
      <Container maxWidth="lg" sx={{ px: 0 }}>
        <Typography
          variant="h1"
          gutterBottom
          sx={{
            color: "var(--text-primary)",
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            mb: 4,
            fontSize: { xs: '3.5rem', sm: '4.5rem', md: '6rem' },
            lineHeight: 0.9,
          }}
        >
          AI <br />
          INTERVIEW <br />
          DOSSIER.
        </Typography>
        
        <Typography
          variant="h6"
          paragraph
          sx={{
            mb: 6,
            maxWidth: "500px",
            color: "var(--text-secondary)",
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 400,
            lineHeight: 1.6,
            fontFamily: '"Courier New", Courier, monospace',
            borderLeft: "2px solid #111",
            pl: 3
          }}
        >
          Upload your resume, select a field, take an AI interview, and get one step closer to the job. Systematic preparation for serious candidates.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            component={NavLink}
            to="/mockInterviewWay"
            endIcon={<SchoolIcon />}
            sx={{
              borderRadius: 0,
              border: "2px solid #111",
              color: "#111",
              backgroundColor: "#FFF",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: "4px 4px 0 #111",
              transition: "all 0.1s ease",
              "&:hover": {
                backgroundColor: "#111",
                color: "#FFF",
                boxShadow: "2px 2px 0 #111",
                transform: "translate(2px, 2px)"
              }
            }}
          >
            Commence Interview
          </Button>
        </Box>
      </Container>
    </Box>
  );
});

const FEATURES_DATA = [
  {
    title: "1. Select Position",
    description: "Choose from various roles like Frontend, Backend, Fullstack, DevOps, AI/ML, Data Science, UI/UX, and more.",
    icon: WorkIcon,
  },
  {
    title: "2. Experience Level",
    description: "Select your experience level from Student/Fresher to 10+ years to get appropriate questions.",
    icon: BarChartIcon,
  },
  {
    title: "3. Interview Mode",
    description: "Choose between Guided Mode for structured guidance or Hard Mode for challenging questions.",
    icon: SettingsIcon,
  },
  {
    title: "4. Question Count",
    description: "Customize your practice session with 5, 10, 15, 20, or 25+ questions based on your needs.",
    icon: QuizIcon,
  },
  {
    title: "5. Upload Resume",
    description: "Upload your resume and let our AI analyze your skills and experience to ask relevant questions.",
    icon: UploadFileIcon,
  },
  {
    title: "6. AI Practice",
    description: "Practice with our AI interviewer tailored to your selected position, experience, preferences, and resume-based questions for a personalized interview experience.",
    icon: PsychologyIcon,
  },
];

const FeatureCard = memo(({ feature, index }) => {
  return (
    <Grid item xs={12} sm={6} md={4} sx={{ display: "flex" }}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          p: 4,
          border: "1px solid #111",
          backgroundColor: "#FFF",
          width: "100%",
          position: "relative",
          "&:hover": {
            backgroundColor: "var(--darker-bg)",
          }
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "#111",
            mb: 2,
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%"
          }}
        >
          {feature.title}
          <feature.icon sx={{ color: "var(--primary-color)" }} />
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "var(--text-secondary)",
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: "0.95rem",
            lineHeight: 1.5,
          }}
        >
          {feature.description}
        </Typography>
      </Box>
    </Grid>
  );
});

const FeaturesSection = memo(() => {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4, md: 8 },
        backgroundColor: "var(--surface-color)",
        color: "var(--text-primary)",
      }}
      aria-label="Process section"
    >
      <Container maxWidth="lg" sx={{ px: 0 }}>
        <Box mb={{ xs: 6, sm: 8 }} borderBottom="2px solid #111" pb={4}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: "#111"
            }}
          >
            Standard Operating Procedure
          </Typography>
        </Box>

        <Grid container spacing={0} sx={{ borderTop: "1px solid #111", borderLeft: "1px solid #111" }}>
          {FEATURES_DATA.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx} sx={{ borderRight: "1px solid #111", borderBottom: "1px solid #111", display: 'flex' }}>
              <Box sx={{ p: 4, width: '100%', '&:hover': { backgroundColor: 'var(--darker-bg)' } }}>
                 <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
                   {feature.title}
                   <feature.icon sx={{ color: '#0044CC' }} />
                 </Typography>
                 <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '0.9rem', color: '#555' }}>
                   {feature.description}
                 </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box mt={{ xs: 8, sm: 10 }} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              Proceed to Assessment
            </Typography>
            <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#555", mt: 1 }}>
              System is ready for your input.
            </Typography>
          </Box>
          <Button
            variant="contained"
            component={NavLink}
            to="/mockInterviewWay"
            sx={{
              borderRadius: 0,
              backgroundColor: "#111",
              color: "#FFF",
              px: 4,
              py: 2,
              fontWeight: 700,
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              "&:hover": {
                backgroundColor: "#0044CC",
              }
            }}
          >
            Initialize
          </Button>
        </Box>
      </Container>
    </Box>
  );
});

HeroSection.displayName = 'HeroSection';
FeaturesSection.displayName = 'FeaturesSection';
FeatureCard.displayName = 'FeatureCard';

const HomePage = memo(() => {
  return (
    <main role="main" style={{ minHeight: '100vh', backgroundColor: 'var(--surface-color)' }}>
      <HeroSection />
      <FeaturesSection />
    </main>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;