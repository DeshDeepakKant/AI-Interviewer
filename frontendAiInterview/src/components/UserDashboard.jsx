import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Container,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Skeleton,
  Pagination,
  Stack,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import SchoolIcon from "@mui/icons-material/School";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CodeIcon from "@mui/icons-material/Code";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import EmployerDashboard from "./EmployerDashboard.jsx";

export default memo(function UserDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  if (!authLoading && (user?.role === "employer" || user?.role === "admin")) {
    return <EmployerDashboard />;
  }

  const [expandedInterview, setExpandedInterview] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    username: "",
    role: "",
  });

  const userStats = useMemo(() => {
    if (!interviewHistory.length) {
      return {
        completedInterviews: pagination.totalItems || 0,
        avgRating: "0.0",
        totalQuestions: 0,
        successRate: 0,
        goodInterviews: 0,
        totalInterviews: 0,
      };
    }

    const totalRating = interviewHistory.reduce((sum, item) => sum + (item.overAllRating || 0), 0);
    const avgRating = (totalRating / interviewHistory.length).toFixed(1);
    const totalQuestions = interviewHistory.reduce((sum, interview) => {
      return sum + (interview.numberOfQuestions || (interview.qaItems ? interview.qaItems.length : 0));
    }, 0);

    const totalInterviews = interviewHistory.length;
    const goodInterviews = interviewHistory.filter((i) => (i.overAllRating || 0) >= 7).length;
    const successRate = totalInterviews > 0 ? Math.round((goodInterviews / totalInterviews) * 100) : 0;

    return {
      completedInterviews: pagination.totalItems || totalInterviews,
      avgRating,
      totalQuestions,
      successRate,
      goodInterviews,
      totalInterviews,
    };
  }, [interviewHistory, pagination.totalItems]);

  useEffect(() => {
    if (!authLoading && user) {
      setUserData({
        name: user.fullName || user.username || "Candidate",
        email: user.email || "",
        username: user.username || "",
        role: user.role || "student",
      });
    }
  }, [user, authLoading]);

  const fetchInterviewHistory = useCallback(async (page = 1, limit = 10) => {
    const controller = new AbortController();

    try {
      setLoadingHistory(true);
      setHistoryError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/ai/aiHistory?page=${page}&limit=${limit}`,
        {
          withCredentials: true,
          signal: controller.signal,
          timeout: 10000,
        }
      );

      if (response.data.success && response.data.data?.data) {
        const historyArray = response.data.data.data.map((interview) => ({
          id: interview._id,
          ...interview,
          createdAt: new Date(interview.createdAt),
          overAllRating: parseFloat(interview.overAllRating) || 0,
        }));

        setInterviewHistory(historyArray);

        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error("Error fetching interview history:", err);
        setHistoryError("Failed to load interview history. Please verify your connection.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoadingHistory(false);
      }
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchInterviewHistory(1, 10);
  }, [fetchInterviewHistory]);

  const handlePageChange = useCallback(
    (event, newPage) => {
      fetchInterviewHistory(newPage, pagination.itemsPerPage);
      setExpandedInterview(null);
    },
    [fetchInterviewHistory, pagination.itemsPerPage]
  );

  const handleExpandInterview = useCallback((interviewId) => {
    setExpandedInterview((prev) => (prev === interviewId ? null : interviewId));
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#ECECE9",
        minHeight: "100vh",
        py: { xs: 5, md: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="lg">
        {/* MASTHEAD HEADER */}
        <Box sx={{ mb: 4, textAlign: "left" }}>
          <Typography
            variant="caption"
            sx={{
              display: "inline-block",
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "#0044CC",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            [ DOSSIER ARCHIVE // EVALUATION SYSTEM ]
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 800,
                color: "#111111",
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                fontSize: { xs: "2rem", md: "2.5rem" },
                lineHeight: 1.1,
              }}
            >
              Candidate Dossier
            </Typography>
            <Button
              component={RouterLink}
              to="/mockInterviewWay"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 0,
                backgroundColor: "#0044CC",
                color: "#FFFFFF",
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 800,
                fontSize: "0.85rem",
                px: 3,
                py: 1.25,
                border: "2px solid #111111",
                boxShadow: "3px 3px 0 #111111",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                "&:hover": {
                  backgroundColor: "#003399",
                  borderColor: "#111111",
                  boxShadow: "1px 1px 0 #111111",
                  transform: "translate(2px, 2px)",
                },
              }}
            >
              Start New Interview
            </Button>
          </Box>
        </Box>

        {/* CANDIDATE PROFILE DOSSIER CARD */}
        <Card
          sx={{
            borderRadius: 0,
            border: "2px solid #111111",
            boxShadow: "5px 5px 0 #111111",
            backgroundColor: "#FFFFFF",
            mb: 4,
            overflow: "visible",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#111111",
              color: "#FFFFFF",
              px: 3,
              py: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              PERSONA RECORD // {userData.role?.toUpperCase() || "CANDIDATE"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: "#0044CC",
                bgcolor: "#FFFFFF",
                px: 1,
                py: 0.2,
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            >
              STATUS: AUTHENTICATED
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 0,
                  border: "2px solid #111111",
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  fontSize: "1.75rem",
                }}
              >
                {userData.name ? userData.name.charAt(0).toUpperCase() : "C"}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      fontWeight: 800,
                      color: "#111111",
                      textTransform: "uppercase",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {userData.name}
                  </Typography>
                  <Chip
                    label={userData.role?.toUpperCase() || "STUDENT"}
                    size="small"
                    sx={{
                      borderRadius: 0,
                      border: "1px solid #111111",
                      backgroundColor: "#0044CC",
                      color: "#FFFFFF",
                      fontFamily: '"Courier New", Courier, monospace',
                      fontWeight: 700,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Courier New", Courier, monospace',
                    color: "#555555",
                    fontSize: "0.9rem",
                  }}
                >
                  EMAIL: {userData.email} {userData.username && `// HANDLE: @${userData.username}`}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  href="https://linkedin.com"
                  target="_blank"
                  sx={{
                    borderRadius: 0,
                    border: "1px solid #111111",
                    color: "#111111",
                    "&:hover": { backgroundColor: "#ECECE9" },
                  }}
                >
                  <LinkedInIcon fontSize="small" />
                </IconButton>
                <IconButton
                  href="https://github.com"
                  target="_blank"
                  sx={{
                    borderRadius: 0,
                    border: "1px solid #111111",
                    color: "#111111",
                    "&:hover": { backgroundColor: "#ECECE9" },
                  }}
                >
                  <CodeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  href="https://twitter.com"
                  target="_blank"
                  sx={{
                    borderRadius: 0,
                    border: "1px solid #111111",
                    color: "#111111",
                    "&:hover": { backgroundColor: "#ECECE9" },
                  }}
                >
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 4 STATS METRICS GRID */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 0,
                border: "2px solid #111111",
                boxShadow: "4px 4px 0 #111111",
                backgroundColor: "#FFFFFF",
                p: 2.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 700,
                  color: "#666666",
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                01 // COMPLETED
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  color: "#111111",
                  letterSpacing: "-0.03em",
                }}
              >
                {userStats.completedInterviews}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  color: "#555555",
                  mt: 0.5,
                  display: "block",
                }}
              >
                Interviews Administered
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 0,
                border: "2px solid #111111",
                boxShadow: "4px 4px 0 #111111",
                backgroundColor: "#FFFFFF",
                p: 2.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 700,
                  color: "#666666",
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                02 // MEAN SCORE
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  color: parseFloat(userStats.avgRating) >= 7 ? "#0044CC" : "#111111",
                  letterSpacing: "-0.03em",
                }}
              >
                {userStats.avgRating}
                <Typography component="span" sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#888888" }}>
                  /10
                </Typography>
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  color: "#555555",
                  mt: 0.5,
                  display: "block",
                }}
              >
                Benchmark Average
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 0,
                border: "2px solid #111111",
                boxShadow: "4px 4px 0 #111111",
                backgroundColor: "#FFFFFF",
                p: 2.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 700,
                  color: "#666666",
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                03 // QUESTIONS
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  color: "#111111",
                  letterSpacing: "-0.03em",
                }}
              >
                {userStats.totalQuestions}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  color: "#555555",
                  mt: 0.5,
                  display: "block",
                }}
              >
                Technical Prompts Evaluated
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 0,
                border: "2px solid #111111",
                boxShadow: "4px 4px 0 #111111",
                backgroundColor: "#FFFFFF",
                p: 2.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 700,
                  color: "#666666",
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                04 // PASS RATE (≥7.0)
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  color: userStats.successRate >= 70 ? "#008040" : "#111111",
                  letterSpacing: "-0.03em",
                }}
              >
                {userStats.successRate}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  color: "#555555",
                  mt: 0.5,
                  display: "block",
                }}
              >
                {userStats.goodInterviews} of {userStats.totalInterviews} sessions
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* EVALUATION HISTORY SECTION */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #111111",
              pb: 1.5,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <HistoryEduIcon sx={{ color: "#111111", fontSize: 26 }} />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#111111",
                  letterSpacing: "-0.02em",
                }}
              >
                Interview Evaluation Logs
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                fontWeight: 700,
                color: "#555555",
              }}
            >
              RECORDS: {interviewHistory.length} RETRIEVED
            </Typography>
          </Box>

          {loadingHistory ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress size={36} sx={{ color: "#111111", mb: 2 }} />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                LOADING DOSSIER SESSIONS FROM MOTOR / MONGODB...
              </Typography>
            </Box>
          ) : historyError ? (
            <Box
              sx={{
                border: "2px solid #D32F2F",
                backgroundColor: "#FFF5F5",
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  color: "#D32F2F",
                  fontWeight: 700,
                }}
              >
                {historyError}
              </Typography>
            </Box>
          ) : interviewHistory.length === 0 ? (
            <Box
              sx={{
                border: "2px dashed #111111",
                backgroundColor: "#FFFFFF",
                p: 6,
                textAlign: "center",
              }}
            >
              <FolderOpenIcon sx={{ fontSize: 48, color: "#666666", mb: 1.5 }} />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#111111",
                  mb: 1,
                }}
              >
                No Evaluation Records In System
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  color: "#555555",
                  maxWidth: "500px",
                  mx: "auto",
                  mb: 3,
                }}
              >
                Complete your initial technical assessment to view multi-dimensional scoring, diagnostic feedback, and suggested answers.
              </Typography>
              <Button
                component={RouterLink}
                to="/mockInterviewWay"
                variant="contained"
                sx={{
                  borderRadius: 0,
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                  border: "2px solid #111111",
                  boxShadow: "3px 3px 0 #111111",
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "#0044CC",
                    borderColor: "#0044CC",
                  },
                }}
              >
                Initialize First Assessment
              </Button>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {interviewHistory.map((interview) => {
                const isExpanded = expandedInterview === interview.id;
                const questions = interview.qaItems || [];

                return (
                  <Card
                    key={interview.id}
                    sx={{
                      borderRadius: 0,
                      border: "2px solid #111111",
                      boxShadow: isExpanded ? "6px 6px 0 #0044CC" : "4px 4px 0 #111111",
                      backgroundColor: "#FFFFFF",
                      transition: "box-shadow 0.15s ease",
                      overflow: "visible",
                    }}
                  >
                    {/* CARD HEADER CLICKABLE */}
                    <Box
                      onClick={() => handleExpandInterview(interview.id)}
                      sx={{
                        p: 2.5,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 2,
                        backgroundColor: isExpanded ? "#F4F7FF" : "#FFFFFF",
                        borderBottom: isExpanded ? "2px solid #111111" : "none",
                        "&:hover": {
                          backgroundColor: "#F9F9F8",
                        },
                      }}
                    >
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: '"Helvetica Neue", Arial, sans-serif',
                              fontWeight: 800,
                              color: "#111111",
                              textTransform: "uppercase",
                              fontSize: "1.1rem",
                            }}
                          >
                            {interview.interviewName || interview.position || "Technical Assessment"}
                          </Typography>
                          <Chip
                            label={interview.interviewMode || "Guided Mode"}
                            size="small"
                            sx={{
                              borderRadius: 0,
                              border: "1px solid #111111",
                              backgroundColor: "#ECECE9",
                              color: "#111111",
                              fontFamily: '"Courier New", Courier, monospace',
                              fontWeight: 700,
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: '"Courier New", Courier, monospace',
                            color: "#666666",
                          }}
                        >
                          DATE: {interview.createdAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          // PROMPTS: {questions.length} EVALUATED
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            border: "2px solid #111111",
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: interview.overAllRating >= 7 ? "#E6F4EA" : "#FFFFFF",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              fontFamily: '"Courier New", Courier, monospace',
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              color: "#555555",
                            }}
                          >
                            OVERALL
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontFamily: '"Helvetica Neue", Arial, sans-serif',
                              fontWeight: 800,
                              color: interview.overAllRating >= 7 ? "#008040" : "#111111",
                              lineHeight: 1,
                            }}
                          >
                            {interview.overAllRating}
                            <span style={{ fontSize: "0.7rem", color: "#888888" }}>/10</span>
                          </Typography>
                        </Box>

                        <ExpandMoreIcon
                          sx={{
                            color: "#111111",
                            transform: isExpanded ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* EXPANDED DOSSIER DRAWER */}
                    {isExpanded && (
                      <CardContent sx={{ p: { xs: 2.5, sm: 4 }, backgroundColor: "#FAF9F6" }}>
                        {/* RESUME CONTEXT */}
                        {interview.resumeSummary && (
                          <Box sx={{ mb: 3.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                fontFamily: '"Courier New", Courier, monospace',
                                fontWeight: 800,
                                color: "#111111",
                                borderBottom: "1px solid #111111",
                                pb: 0.5,
                                mb: 1.5,
                                textTransform: "uppercase",
                              }}
                            >
                              DOSSIER CONTEXT SUMMARY
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: '"Courier New", Courier, monospace',
                                color: "#333333",
                                backgroundColor: "#FFFFFF",
                                p: 2,
                                border: "1px solid #111111",
                                lineHeight: 1.6,
                              }}
                            >
                              {interview.resumeSummary}
                            </Typography>
                          </Box>
                        )}

                        {/* QUESTION TRANSCRIPT */}
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            fontFamily: '"Courier New", Courier, monospace',
                            fontWeight: 800,
                            color: "#111111",
                            borderBottom: "1px solid #111111",
                            pb: 0.5,
                            mb: 2,
                            textTransform: "uppercase",
                          }}
                        >
                          DIALOGUE TRANSCRIPT & EVALUATION
                        </Typography>

                        <Stack spacing={2}>
                          {questions.map((q, idx) => (
                            <Box
                              key={q._id || idx}
                              sx={{
                                border: "1px solid #111111",
                                backgroundColor: "#FFFFFF",
                                p: 2.5,
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1.5 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                                    fontWeight: 800,
                                    color: "#111111",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {idx + 1}. {q.question}
                                </Typography>
                                {q.rating !== undefined && (
                                  <Chip
                                    label={`${q.rating}/10`}
                                    size="small"
                                    sx={{
                                      borderRadius: 0,
                                      border: "1px solid #111111",
                                      backgroundColor: q.rating >= 7 ? "#E6F4EA" : "#FFF0F0",
                                      color: q.rating >= 7 ? "#008040" : "#D32F2F",
                                      fontFamily: '"Courier New", Courier, monospace',
                                      fontWeight: 800,
                                    }}
                                  />
                                )}
                              </Box>

                              {/* Candidate Answer */}
                              <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: "#ECECE9", borderLeft: "3px solid #111111" }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    fontFamily: '"Courier New", Courier, monospace',
                                    fontWeight: 700,
                                    color: "#111111",
                                    textTransform: "uppercase",
                                    mb: 0.5,
                                  }}
                                >
                                  Candidate Response:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: '"Courier New", Courier, monospace',
                                    color: "#222222",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {q.userAnswer || "No answer recorded."}
                                </Typography>
                              </Box>

                              {/* Feedback */}
                              <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: "#FFFFFF", border: "1px solid #E0E0DB" }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    fontFamily: '"Courier New", Courier, monospace',
                                    fontWeight: 700,
                                    color: "#0044CC",
                                    textTransform: "uppercase",
                                    mb: 0.5,
                                  }}
                                >
                                  Examiner Diagnostic Feedback:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: '"Courier New", Courier, monospace',
                                    color: "#444444",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {q.feedback || "No specific feedback generated."}
                                </Typography>
                              </Box>

                              {/* Score Breakdown Chips */}
                              {(q.technicalKnowledge !== undefined ||
                                q.problemSolvingSkills !== undefined ||
                                q.communicationClarity !== undefined) && (
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: 1 }}>
                                  {q.technicalKnowledge !== undefined && (
                                    <Chip
                                      label={`TECH ACCURACY: ${q.technicalKnowledge}/10`}
                                      size="small"
                                      sx={{
                                        borderRadius: 0,
                                        fontFamily: '"Courier New", Courier, monospace',
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        backgroundColor: "#ECECE9",
                                        border: "1px solid #111111",
                                      }}
                                    />
                                  )}
                                  {q.problemSolvingSkills !== undefined && (
                                    <Chip
                                      label={`REASONING: ${q.problemSolvingSkills}/10`}
                                      size="small"
                                      sx={{
                                        borderRadius: 0,
                                        fontFamily: '"Courier New", Courier, monospace',
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        backgroundColor: "#ECECE9",
                                        border: "1px solid #111111",
                                      }}
                                    />
                                  )}
                                  {q.communicationClarity !== undefined && (
                                    <Chip
                                      label={`CLARITY: ${q.communicationClarity}/10`}
                                      size="small"
                                      sx={{
                                        borderRadius: 0,
                                        fontFamily: '"Courier New", Courier, monospace',
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        backgroundColor: "#ECECE9",
                                        border: "1px solid #111111",
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    )}
                  </Card>
                );
              })}

              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 3 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={handlePageChange}
                    shape="rounded"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: 0,
                        border: "1px solid #111111",
                        fontFamily: '"Courier New", Courier, monospace',
                        fontWeight: 700,
                        "&.Mui-selected": {
                          backgroundColor: "#111111",
                          color: "#FFFFFF",
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
});
