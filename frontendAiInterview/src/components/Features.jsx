import React, { useMemo, memo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  RecordVoiceOver as VoiceIcon,
  UploadFile as UploadFileIcon,
  Psychology as PsychologyIcon,
  Work as WorkIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { NavLink } from "react-router";

const MODULES_DATA = [
  {
    code: "MOD-01",
    title: "Adaptive Mock Interviews",
    icon: SchoolIcon,
    tag: "SIMULATION ENGINE",
    description:
      "Full-duplex technical simulation customized to target companies, engineering stacks, and candidate seniority levels.",
    specs: [
      { label: "LATENCY", value: "< 800ms" },
      { label: "DIFFICULTY", value: "DYNAMIC" },
      { label: "MODE", value: "GUIDED / HARD" },
    ],
  },
  {
    code: "MOD-02",
    title: "Performance Telemetry",
    icon: AssessmentIcon,
    tag: "DIAGNOSTIC",
    description:
      "Multidimensional answer evaluation parsing clarity, domain depth, architectural reasoning, and communication cadence.",
    specs: [
      { label: "METRICS", value: "ACCURACY / PACE" },
      { label: "RECORD", value: "SAVED TO DOSSIER" },
      { label: "SCORING", value: "STANDARDIZED" },
    ],
  },
  {
    code: "MOD-03",
    title: "Voice-Based Synthesis",
    icon: VoiceIcon,
    tag: "AUDIO SYNTHESIS",
    description:
      "Acoustic interviewer generation delivering questions naturally with realistic follow-ups to simulate live panel evaluations.",
    specs: [
      { label: "PROTOCOL", value: "AUDIO TTS / STT" },
      { label: "FIDELITY", value: "HIGH BITRATE" },
      { label: "ENVIRONMENT", value: "HANDS-FREE" },
    ],
  },
  {
    code: "MOD-04",
    title: "Dynamic Branching Questions",
    icon: QuestionAnswerIcon,
    tag: "CONTEXT TREE",
    description:
      "Non-linear follow-ups probing deeper into edge cases, architecture decisions, and potential flaws in candidate responses.",
    specs: [
      { label: "DEPTH", value: "RECURSIVE DRILL" },
      { label: "PROBING", value: "EDGE-CASE DETECTION" },
      { label: "LOGIC", value: "SEMANTIC CHAIN" },
    ],
  },
  {
    code: "MOD-05",
    title: "Resume Parsing & Ingestion",
    icon: UploadFileIcon,
    tag: "RESUME PARSER",
    description:
      "Automated extraction of prior achievements, tech stacks, and career milestones to calibrate interview difficulty and relevance.",
    specs: [
      { label: "INPUT", value: "PDF / DOCX" },
      { label: "PARSER", value: "STRUCTURAL NLP" },
      { label: "ALIGNMENT", value: "PROJECT-BASED" },
    ],
  },
  {
    code: "MOD-06",
    title: "Role & Position Calibration",
    icon: WorkIcon,
    tag: "TARGET MATRIX",
    description:
      "Fine-tuned evaluation standards targeting Frontend, Backend, Fullstack, DevOps, ML Engineering, and System Architecture.",
    specs: [
      { label: "COVERAGE", value: "10+ ROLES" },
      { label: "STANDARDS", value: "INDUSTRY PEER" },
      { label: "LEVELS", value: "JUNIOR TO PRINCIPAL" },
    ],
  },
  {
    code: "MOD-07",
    title: "Comprehensive Intelligence Dossier",
    icon: PsychologyIcon,
    tag: "EVALUATION REPORT",
    description:
      "Actionable debrief summarizing strengths, architectural blindspots, suggested study tracks, and transcript replays.",
    specs: [
      { label: "OUTPUT", value: "STRUCTURED AUDIT" },
      { label: "EXPORT", value: "DOSSIER ARCHIVE" },
      { label: "HISTORY", value: "LONGITUDINAL" },
    ],
  },
];

const FeatureModuleCard = memo(({ module }) => {
  const Icon = module.icon;
  return (
    <Grid item xs={12} md={6} lg={4}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 3.5,
          backgroundColor: "#FFFFFF",
          border: "1px solid #111111",
          boxShadow: "4px 4px 0 #111111",
          transition: "all 0.15s ease",
          "&:hover": {
            boxShadow: "2px 2px 0 #111111",
            transform: "translate(2px, 2px)",
            borderColor: "#0044CC",
          },
        }}
      >
        {/* Header bar of card */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #ECECE9",
            pb: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                fontWeight: 700,
                color: "#0044CC",
                fontSize: "0.85rem",
                letterSpacing: "0.05em",
              }}
            >
              [{module.code}]
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: "#666666",
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              {module.tag}
            </Typography>
          </Box>
          <Icon sx={{ color: "#111111", fontSize: 22 }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            fontSize: "1.25rem",
            letterSpacing: "-0.02em",
            color: "#111111",
            mb: 1.5,
            lineHeight: 1.25,
          }}
        >
          {module.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: "0.875rem",
            color: "#555555",
            lineHeight: 1.6,
            mb: 3,
            flexGrow: 1,
          }}
        >
          {module.description}
        </Typography>

        {/* Technical Specs Footer in Card */}
        <Box
          sx={{
            borderTop: "1px solid #111111",
            pt: 2,
            mt: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
          }}
        >
          {module.specs.map((spec, i) => (
            <Box key={i}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: "0.65rem",
                  color: "#777777",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                {spec.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: "0.72rem",
                  color: "#111111",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {spec.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Grid>
  );
});

FeatureModuleCard.displayName = "FeatureModuleCard";

const Features = () => {
  return (
    <Box
      component="section"
      id="features"
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "var(--dark-bg)",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg" sx={{ px: 0 }}>
        {/* Section Header */}
        <Box
          sx={{
            borderBottom: "2px solid #111111",
            pb: 4,
            mb: { xs: 5, md: 7 },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontFamily: '"Courier New", Courier, monospace',
              color: "#0044CC",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              mb: 1.5,
              textTransform: "uppercase",
            }}
          >
            SYS.SPEC // ARCHITECTURE OVERVIEW
          </Typography>
          
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontWeight: 800,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              textTransform: "uppercase",
              color: "#111111",
              mb: 3,
            }}
          >
            System Capabilities <br />& Specifications
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              color: "#555555",
              fontSize: { xs: "0.95rem", sm: "1.1rem" },
              maxWidth: "750px",
              lineHeight: 1.6,
              borderLeft: "2px solid #111111",
              pl: 2.5,
            }}
          >
            Comprehensive technical modules powering systematic candidate assessment, acoustic interview synthesis, and resume-driven probing.
          </Typography>
        </Box>

        {/* Module Grid */}
        <Grid container spacing={3.5} alignItems="stretch">
          {MODULES_DATA.map((module) => (
            <FeatureModuleCard key={module.code} module={module} />
          ))}
        </Grid>

        {/* Bottom CTA Dossier Strip */}
        <Box
          sx={{
            mt: { xs: 8, md: 10 },
            p: { xs: 3, sm: 5 },
            backgroundColor: "#FFFFFF",
            border: "2px solid #111111",
            boxShadow: "6px 6px 0 #111111",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: "#0044CC",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                display: "block",
                mb: 0.5,
              }}
            >
              READY TO COMMENCE EVALUATION?
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#111111",
                textTransform: "uppercase",
              }}
            >
              Configure Your Assessment Session
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: "#555555",
                fontSize: "0.875rem",
                mt: 1,
              }}
            >
              Select role, target difficulty level, upload documentation, and run live interview.
            </Typography>
          </Box>

          <Button
            component={NavLink}
            to="/mockInterviewWay"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: 0,
              backgroundColor: "#111111",
              color: "#FFFFFF",
              border: "1px solid #111111",
              boxShadow: "4px 4px 0 #111111",
              px: 4,
              py: 1.8,
              fontSize: "0.95rem",
              fontWeight: 700,
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              flexShrink: 0,
              "&:hover": {
                backgroundColor: "#0044CC",
                borderColor: "#0044CC",
                boxShadow: "2px 2px 0 #111111",
                transform: "translate(2px, 2px)",
              },
            }}
          >
            Launch Interview
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Features;