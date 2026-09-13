import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  InputAdornment,
  Grid,
} from "@mui/material";
import {
  Work as WorkIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  ContentCopy as ContentCopyIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const brutalCardStyle = {
  backgroundColor: "#FFFFFF",
  border: "2px solid #111111",
  borderRadius: 0,
  boxShadow: "4px 4px 0 #111111",
  p: { xs: 2.5, sm: 3.5 },
  mb: 3,
};

const monoCaptionStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontWeight: 700,
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#0044CC",
};

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: 0 = Candidates, 1 = Invite, 2 = Campaigns
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "invite" ? 1 : tabParam === "jobs" ? 2 : 0;
  const [tab, setTab] = useState(initialTab);

  // Data states
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeCampaigns: 0,
    averageScore: 0.0,
    completedInterviews: 0,
  });
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");

  // Selected candidate report modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
    candidateName: "",
    candidateEmail: "",
    jobId: "",
    jobTitle: "",
    experienceLevel: "Mid Level",
    numberOfQuestions: 5,
    requiredSkills: "Python, FastAPI, System Design",
  });
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [createdInviteLink, setCreatedInviteLink] = useState("");

  // Create Job Dialog State
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    description: "",
    requiredSkills: "Python, React, Machine Learning",
    experienceLevel: "Mid Level",
    numberOfQuestions: 5,
  });
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  // Fetch all recruiter data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, candidatesRes, jobsRes, invRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/employer/stats`, { withCredentials: true }).catch(() => ({ data: { data: {} } })),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/employer/candidates`, { withCredentials: true }).catch(() => ({ data: { data: [] } })),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/employer/jobs`, { withCredentials: true }).catch(() => ({ data: { data: [] } })),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/employer/invitations`, { withCredentials: true }).catch(() => ({ data: { data: [] } })),
      ]);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
      if (candidatesRes.data?.data) {
        setCandidates(candidatesRes.data.data);
      }
      if (jobsRes.data?.data) {
        setJobs(jobsRes.data.data);
        // Pre-select first job in invite form if empty
        if (jobsRes.data.data.length > 0 && !inviteForm.jobId) {
          setInviteForm((prev) => ({ ...prev, jobId: jobsRes.data.data[0]._id }));
        }
      }
      if (invRes.data?.data) {
        setInvitations(invRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load recruiter portal data:", err);
      toast.error("Failed to load recruitment data.");
    } finally {
      setLoading(false);
    }
  }, [inviteForm.jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Synchronize tab state when searchParams change in URL (e.g. from navbar buttons)
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab === "invite") {
      setTab(1);
    } else if (currentTab === "jobs") {
      setTab(2);
    } else {
      setTab(0);
    }
  }, [searchParams]);

  const handleTabChange = (e, newTab) => {
    setTab(newTab);
    const tabName = newTab === 1 ? "invite" : newTab === 2 ? "jobs" : "candidates";
    setSearchParams({ tab: tabName });
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Interview invite link copied to clipboard!");
  };

  // Open candidate dossier modal
  const handleOpenReport = (candidate) => {
    setSelectedReport(candidate);
    setReportModalOpen(true);
  };

  // Submit interview invite
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.candidateEmail || !inviteForm.candidateName) {
      toast.error("Candidate name and email are required.");
      return;
    }

    try {
      setIsSubmittingInvite(true);
      const payload = {
        candidateName: inviteForm.candidateName,
        candidateEmail: inviteForm.candidateEmail,
        jobId: inviteForm.jobId || undefined,
        jobTitle: inviteForm.jobTitle || undefined,
        experienceLevel: inviteForm.experienceLevel,
        numberOfQuestions: Number(inviteForm.numberOfQuestions),
        requiredSkills: inviteForm.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/employer/invite`, payload, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(`Invitation dispatched to ${inviteForm.candidateEmail}!`);
        setCreatedInviteLink(res.data.data?.inviteLink || "");
        // Refresh invites list and stats
        fetchData();
        // Reset name and email
        setInviteForm((prev) => ({
          ...prev,
          candidateName: "",
          candidateEmail: "",
        }));
      }
    } catch (err) {
      console.error("Failed to send invitation:", err);
      toast.error(err.response?.data?.detail || "Failed to dispatch invitation.");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Create new job campaign
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJobForm.title.trim()) {
      toast.error("Job title is required.");
      return;
    }

    try {
      setIsCreatingJob(true);
      const payload = {
        title: newJobForm.title,
        description: newJobForm.description || `Assessment pipeline for ${newJobForm.title}`,
        requiredSkills: newJobForm.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        experienceLevel: newJobForm.experienceLevel,
        numberOfQuestions: Number(newJobForm.numberOfQuestions),
      };

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/employer/jobs`, payload, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(`Job campaign "${newJobForm.title}" created successfully!`);
        setJobModalOpen(false);
        setNewJobForm({
          title: "",
          description: "",
          requiredSkills: "Python, React, Machine Learning",
          experienceLevel: "Mid Level",
          numberOfQuestions: 5,
        });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create job campaign:", err);
      toast.error(err.response?.data?.detail || "Failed to create campaign.");
    } finally {
      setIsCreatingJob(false);
    }
  };

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const q = searchQuery.toLowerCase();
    return candidates.filter(
      (c) =>
        (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
        (c.candidateEmail && c.candidateEmail.toLowerCase().includes(q)) ||
        (c.position && c.position.toLowerCase().includes(q)) ||
        (c.interviewName && c.interviewName.toLowerCase().includes(q))
    );
  }, [candidates, searchQuery]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "var(--dark-bg)", pt: { xs: 12, md: 14 }, pb: 8, px: { xs: 2, sm: 3 } }}>
      <Container maxWidth="lg">
        {/* MASTHEAD HEADER */}
        <Box sx={{ mb: 4, textAlign: "left" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={monoCaptionStyle}>
                [ RECRUITMENT COMMAND CENTER // TALENT INTELLIGENCE PIPELINE ]
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  color: "#111111",
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  lineHeight: 1.1,
                  mt: 0.5,
                }}
              >
                Employer Portal
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  color: "#555555",
                  fontSize: "0.9rem",
                  mt: 0.5,
                }}
              >
                Recruiter: <strong>{user?.fullName || "Sarah Jenkins"}</strong> ({user?.email || "employer@demo.ai"}) // ROLE: RECRUITER
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Button
                variant="outlined"
                onClick={fetchData}
                disabled={loading}
                startIcon={<RefreshIcon />}
                sx={{
                  borderRadius: 0,
                  borderColor: "#111111",
                  color: "#111111",
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  py: 1,
                  px: 2,
                  "&:hover": { backgroundColor: "#111111", color: "#FFFFFF", borderColor: "#111111" },
                }}
              >
                Sync Data
              </Button>
              <Button
                variant="contained"
                onClick={() => setJobModalOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 0,
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                  border: "1px solid #111111",
                  boxShadow: "3px 3px 0 #111111",
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  py: 1,
                  px: 2.5,
                  "&:hover": { backgroundColor: "#0044CC", borderColor: "#0044CC" },
                }}
              >
                New Campaign
              </Button>
            </Box>
          </Box>
        </Box>

        {/* RECRUITMENT KPI METRIC TILES */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2.5, mb: 4 }}>
          {/* Tile 1 */}
          <Paper elevation={0} sx={{ ...brutalCardStyle, p: 2.5, mb: 0 }}>
            <Typography variant="caption" sx={monoCaptionStyle}>
              TOTAL CANDIDATES
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, color: "#111111", my: 0.5 }}>
              {stats.totalCandidates || candidates.length}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#666666", fontSize: "0.75rem" }}>
              Evaluated via AI LangGraph
            </Typography>
          </Paper>

          {/* Tile 2 */}
          <Paper elevation={0} sx={{ ...brutalCardStyle, p: 2.5, mb: 0 }}>
            <Typography variant="caption" sx={monoCaptionStyle}>
              ACTIVE CAMPAIGNS
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, color: "#0044CC", my: 0.5 }}>
              {stats.activeCampaigns || jobs.length}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#666666", fontSize: "0.75rem" }}>
              Targeted job positions
            </Typography>
          </Paper>

          {/* Tile 3 */}
          <Paper elevation={0} sx={{ ...brutalCardStyle, p: 2.5, mb: 0 }}>
            <Typography variant="caption" sx={monoCaptionStyle}>
              AVERAGE SCORE
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, color: "#111111", my: 0.5 }}>
              {stats.averageScore ? `${stats.averageScore}/10` : "8.8/10"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#666666", fontSize: "0.75rem" }}>
              Holistic technical rubric
            </Typography>
          </Paper>

          {/* Tile 4 */}
          <Paper elevation={0} sx={{ ...brutalCardStyle, p: 2.5, mb: 0 }}>
            <Typography variant="caption" sx={monoCaptionStyle}>
              INVITATIONS SENT
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, color: "#111111", my: 0.5 }}>
              {invitations.length}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#666666", fontSize: "0.75rem" }}>
              Direct email & magic links
            </Typography>
          </Paper>
        </Box>

        {/* PRIMARY NAVIGATION TABS */}
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            border: "2px solid #111111",
            backgroundColor: "#ECECE9",
            p: 0.5,
            minHeight: 46,
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab
            label="01. Candidate Pipeline & Reports"
            sx={{
              borderRadius: 0,
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              color: tab === 0 ? "#FFFFFF !important" : "#111111",
              backgroundColor: tab === 0 ? "#111111" : "transparent",
              minHeight: 38,
              py: 1,
              px: 2.5,
              transition: "all 0.15s ease",
            }}
          />
          <Tab
            label="02. Schedule & Invite Candidate"
            sx={{
              borderRadius: 0,
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              color: tab === 1 ? "#FFFFFF !important" : "#111111",
              backgroundColor: tab === 1 ? "#111111" : "transparent",
              minHeight: 38,
              py: 1,
              px: 2.5,
              transition: "all 0.15s ease",
            }}
          />
          <Tab
            label="03. Job Campaigns"
            sx={{
              borderRadius: 0,
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              color: tab === 2 ? "#FFFFFF !important" : "#111111",
              backgroundColor: tab === 2 ? "#111111" : "transparent",
              minHeight: 38,
              py: 1,
              px: 2.5,
              transition: "all 0.15s ease",
            }}
          />
        </Tabs>

        {/* TAB 0: CANDIDATE PIPELINE & EVALUATION DOSSIERS */}
        {tab === 0 && (
          <Box>
            {/* Search filter bar */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                placeholder="Search candidates by name, email, target position, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#111111" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: "#FFFFFF",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    fontFamily: '"Courier New", Courier, monospace',
                    fontSize: "0.9rem",
                    "& fieldset": { borderColor: "#111111", borderWidth: "2px" },
                    "&:hover fieldset": { borderColor: "#0044CC" },
                    "&.Mui-focused fieldset": { borderColor: "#0044CC" },
                  },
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#111111" }} />
                <Typography sx={{ mt: 2, fontFamily: '"Courier New", Courier, monospace' }}>
                  Loading Candidate Pipeline...
                </Typography>
              </Box>
            ) : filteredCandidates.length === 0 ? (
              <Paper elevation={0} sx={{ ...brutalCardStyle, textAlign: "center", py: 6 }}>
                <AssignmentTurnedInIcon sx={{ fontSize: 50, color: "#999999", mb: 1.5 }} />
                <Typography variant="h5" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, textTransform: "uppercase" }}>
                  No Candidate Interviews Found
                </Typography>
                <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#666666", mt: 1, mb: 3 }}>
                  Invite candidates to take an AI interview or create a job campaign to begin collecting evaluations.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setTab(1)}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: "#111111",
                    color: "#FFFFFF",
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontWeight: 700,
                    textTransform: "uppercase",
                    py: 1.2,
                    px: 3,
                    boxShadow: "3px 3px 0 #111111",
                    "&:hover": { backgroundColor: "#0044CC" },
                  }}
                >
                  Schedule Candidate Interview
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {filteredCandidates.map((candidate, idx) => {
                  const rating = candidate.overAllRating || 0;
                  const isHighPerformer = rating >= 8.0;

                  return (
                    <Paper key={candidate._id || idx} elevation={0} sx={brutalCardStyle}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                        {/* Candidate Bio & Role */}
                        <Box sx={{ flex: 1, minWidth: 260 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
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
                              {candidate.candidateName || "Alex Carter (Candidate)"}
                            </Typography>
                            {isHighPerformer && (
                              <Chip
                                label="RECOMMENDED"
                                size="small"
                                sx={{
                                  borderRadius: 0,
                                  border: "1px solid #111111",
                                  backgroundColor: "#0044CC",
                                  color: "#FFFFFF",
                                  fontFamily: '"Courier New", Courier, monospace',
                                  fontWeight: 700,
                                  fontSize: "0.65rem",
                                }}
                              />
                            )}
                          </Box>

                          <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#555555", mb: 1 }}>
                            EMAIL: {candidate.candidateEmail || "student@demo.ai"} // ROLE: {candidate.position || "Technical Engineer"}
                          </Typography>

                          {candidate.resumeSummary && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: '"Courier New", Courier, monospace',
                                color: "#333333",
                                backgroundColor: "#F6F6F4",
                                p: 1.5,
                                borderLeft: "3px solid #111111",
                                fontSize: "0.82rem",
                                lineHeight: 1.4,
                                mb: 1.5,
                              }}
                            >
                              {candidate.resumeSummary}
                            </Typography>
                          )}

                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Chip
                              label={`EXP: ${candidate.experienceLevel || "Mid Level"}`}
                              size="small"
                              sx={{ borderRadius: 0, border: "1px solid #111111", backgroundColor: "#FFFFFF", fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, fontSize: "0.7rem" }}
                            />
                            <Chip
                              label={`QUESTIONS: ${candidate.numberOfQuestions || (candidate.qaItems ? candidate.qaItems.length : 4)}`}
                              size="small"
                              sx={{ borderRadius: 0, border: "1px solid #111111", backgroundColor: "#FFFFFF", fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, fontSize: "0.7rem" }}
                            />
                            <Chip
                              label={`DATE: ${candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "Recent"}`}
                              size="small"
                              sx={{ borderRadius: 0, border: "1px solid #111111", backgroundColor: "#FFFFFF", fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, fontSize: "0.7rem" }}
                            />
                          </Box>
                        </Box>

                        {/* Scores & Report Button */}
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", sm: "flex-end" }, gap: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                            <Typography variant="caption" sx={monoCaptionStyle}>
                              OVERALL EVALUATION:
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                                fontWeight: 800,
                                color: rating >= 8 ? "#0044CC" : rating >= 6 ? "#E67E22" : "#D32F2F",
                              }}
                            >
                              {rating ? `${rating.toFixed(1)}/10` : "N/A"}
                            </Typography>
                          </Box>

                          {/* Sub-dimension Pills */}
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {candidate.overallTechnicalKnowledge && (
                              <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: "0.72rem", color: "#555555" }}>
                                TECH: <strong>{candidate.overallTechnicalKnowledge.toFixed(1)}</strong>
                              </Typography>
                            )}
                            {candidate.overallProblemSolving && (
                              <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: "0.72rem", color: "#555555" }}>
                                SOLVING: <strong>{candidate.overallProblemSolving.toFixed(1)}</strong>
                              </Typography>
                            )}
                            {candidate.overallCommunicationClarity && (
                              <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: "0.72rem", color: "#555555" }}>
                                CLARITY: <strong>{candidate.overallCommunicationClarity.toFixed(1)}</strong>
                              </Typography>
                            )}
                          </Box>

                          <Button
                            variant="contained"
                            onClick={() => handleOpenReport(candidate)}
                            startIcon={<AssessmentIcon />}
                            sx={{
                              borderRadius: 0,
                              backgroundColor: "#111111",
                              color: "#FFFFFF",
                              border: "1px solid #111111",
                              boxShadow: "3px 3px 0 #111111",
                              fontFamily: '"Helvetica Neue", Arial, sans-serif',
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              textTransform: "uppercase",
                              py: 1,
                              px: 2,
                              mt: 1,
                              "&:hover": { backgroundColor: "#0044CC", borderColor: "#0044CC" },
                            }}
                          >
                            Inspect Full Dossier
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* TAB 1: SCHEDULE & INVITE CANDIDATE */}
        {tab === 1 && (
          <Box>
            <Paper elevation={0} sx={brutalCardStyle}>
              <Typography variant="caption" sx={monoCaptionStyle}>
                [ DISPATCH OFFICIAL INTERVIEW INVITATION ]
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#111111",
                  mt: 0.5,
                  mb: 1,
                }}
              >
                Invite Candidate to Interview
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#555555", mb: 3 }}>
                Enter the candidate's details. The system generates a dedicated magic link, configures the LangGraph rubric, and dispatches an invitation email to the candidate.
              </Typography>

              {createdInviteLink && (
                <Box
                  sx={{
                    mb: 4,
                    p: 2.5,
                    backgroundColor: "#E8F0FE",
                    border: "2px solid #0044CC",
                    boxShadow: "3px 3px 0 #0044CC",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 800, color: "#0044CC", mb: 0.5 }}>
                    ✓ INVITATION GENERATED & DISPATCHED
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#111111", mb: 1.5 }}>
                    Candidate magic link:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={createdInviteLink}
                      InputProps={{ readOnly: true }}
                      sx={{
                        backgroundColor: "#FFFFFF",
                        "& .MuiOutlinedInput-root": { borderRadius: 0, fontFamily: '"Courier New", Courier, monospace', fontSize: "0.85rem" },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleCopyLink(createdInviteLink)}
                      startIcon={<ContentCopyIcon />}
                      sx={{
                        borderRadius: 0,
                        backgroundColor: "#0044CC",
                        color: "#FFFFFF",
                        fontFamily: '"Helvetica Neue", Arial, sans-serif',
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        py: 1,
                        "&:hover": { backgroundColor: "#111111" },
                      }}
                    >
                      Copy Link
                    </Button>
                  </Box>
                </Box>
              )}

              <Box component="form" onSubmit={handleSendInvite}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                  <TextField
                    label="Candidate Full Name"
                    required
                    fullWidth
                    value={inviteForm.candidateName}
                    onChange={(e) => setInviteForm({ ...inviteForm, candidateName: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' },
                    }}
                  />

                  <TextField
                    label="Candidate Email Address"
                    required
                    type="email"
                    fullWidth
                    value={inviteForm.candidateEmail}
                    onChange={(e) => setInviteForm({ ...inviteForm, candidateEmail: e.target.value })}
                    placeholder="e.g. elena@example.com"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' },
                    }}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                  <TextField
                    select
                    label="Select Active Job Campaign"
                    fullWidth
                    value={inviteForm.jobId}
                    onChange={(e) => {
                      const selectedJob = jobs.find((j) => j._id === e.target.value);
                      setInviteForm({
                        ...inviteForm,
                        jobId: e.target.value,
                        jobTitle: selectedJob ? selectedJob.title : inviteForm.jobTitle,
                        experienceLevel: selectedJob ? selectedJob.experienceLevel : inviteForm.experienceLevel,
                        numberOfQuestions: selectedJob ? selectedJob.numberOfQuestions : inviteForm.numberOfQuestions,
                      });
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' },
                    }}
                  >
                    {jobs.map((job) => (
                      <MenuItem key={job._id} value={job._id}>
                        {job.title} ({job.experienceLevel})
                      </MenuItem>
                    ))}
                    <MenuItem value="">-- Specify Custom Role Below --</MenuItem>
                  </TextField>

                  <TextField
                    label="Target Position / Job Title"
                    required
                    fullWidth
                    value={inviteForm.jobTitle}
                    onChange={(e) => setInviteForm({ ...inviteForm, jobTitle: e.target.value })}
                    placeholder="e.g. Senior Distributed Systems Engineer"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' },
                    }}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                  <TextField
                    select
                    label="Experience Level"
                    fullWidth
                    value={inviteForm.experienceLevel}
                    onChange={(e) => setInviteForm({ ...inviteForm, experienceLevel: e.target.value })}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' },
                    }}
                  >
                    <MenuItem value="Entry Level">Entry Level (0-2 years)</MenuItem>
                    <MenuItem value="Mid Level">Mid Level (3-5 years)</MenuItem>
                    <MenuItem value="Senior Level">Senior Level (6+ years)</MenuItem>
                    <MenuItem value="Lead / Architect">Lead / Principal Architect</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Number of Interview Questions"
                    fullWidth
                    value={inviteForm.numberOfQuestions}
                    onChange={(e) => setInviteForm({ ...inviteForm, numberOfQuestions: e.target.value })}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' },
                    }}
                  >
                    <MenuItem value={3}>3 Questions (Fast Screen)</MenuItem>
                    <MenuItem value={5}>5 Questions (Standard Deep-Dive)</MenuItem>
                    <MenuItem value={7}>7 Questions (Comprehensive Assessment)</MenuItem>
                    <MenuItem value={10}>10 Questions (Exhaustive Technical)</MenuItem>
                  </TextField>
                </Box>

                <TextField
                  label="Required Core Skills (comma-separated)"
                  fullWidth
                  value={inviteForm.requiredSkills}
                  onChange={(e) => setInviteForm({ ...inviteForm, requiredSkills: e.target.value })}
                  placeholder="e.g. Python, FastAPI, Docker, Distributed Systems, Raft"
                  variant="outlined"
                  helperText="The AI interviewer will dynamically calibrate drill-down questions around these competencies."
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": { borderRadius: 0, fontFamily: '"Courier New", Courier, monospace' },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmittingInvite}
                  startIcon={<SendIcon />}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: "#111111",
                    color: "#FFFFFF",
                    border: "1px solid #111111",
                    boxShadow: "4px 4px 0 #111111",
                    py: 1.6,
                    px: 4,
                    fontWeight: 700,
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    "&:hover": { backgroundColor: "#0044CC", borderColor: "#0044CC" },
                  }}
                >
                  {isSubmittingInvite ? "Dispatching Invitation..." : "Send Candidate Invitation"}
                </Button>
              </Box>
            </Paper>

            {/* Recent Invitations List */}
            {invitations.length > 0 && (
              <Paper elevation={0} sx={brutalCardStyle}>
                <Typography variant="caption" sx={monoCaptionStyle}>
                  [ DISPATCH LOG // PENDING & COMPLETED INVITATIONS ]
                </Typography>
                <Typography variant="h5" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, textTransform: "uppercase", my: 1 }}>
                  Recent Invitations
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
                  {invitations.map((inv, i) => (
                    <Box
                      key={inv._id || i}
                      sx={{
                        p: 2,
                        backgroundColor: "#F6F6F4",
                        border: "1px solid #111111",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}>
                          {inv.candidateName} ({inv.candidateEmail})
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#666666" }}>
                          ROLE: {inv.jobTitle} // SENT: {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "Recent"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Chip
                          label={inv.status || "INVITED"}
                          size="small"
                          sx={{
                            borderRadius: 0,
                            border: "1px solid #111111",
                            backgroundColor: inv.status === "Completed" ? "#0044CC" : "#FFFFFF",
                            color: inv.status === "Completed" ? "#FFFFFF" : "#111111",
                            fontFamily: '"Courier New", Courier, monospace',
                            fontWeight: 700,
                          }}
                        />
                        {inv.inviteLink && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleCopyLink(inv.inviteLink)}
                            sx={{
                              borderRadius: 0,
                              borderColor: "#111111",
                              color: "#111111",
                              fontFamily: '"Courier New", Courier, monospace',
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              "&:hover": { backgroundColor: "#111111", color: "#FFFFFF" },
                            }}
                          >
                            Copy Link
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* TAB 2: JOB CAMPAIGNS */}
        {tab === 2 && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, textTransform: "uppercase" }}>
                Active Job Campaigns ({jobs.length})
              </Typography>
              <Button
                variant="contained"
                onClick={() => setJobModalOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 0,
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                  border: "1px solid #111111",
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 700,
                  textTransform: "uppercase",
                  py: 1,
                  px: 2.5,
                  boxShadow: "3px 3px 0 #111111",
                  "&:hover": { backgroundColor: "#0044CC" },
                }}
              >
                Create Campaign
              </Button>
            </Box>

            {jobs.length === 0 ? (
              <Paper elevation={0} sx={{ ...brutalCardStyle, textAlign: "center", py: 6 }}>
                <WorkIcon sx={{ fontSize: 50, color: "#999999", mb: 1.5 }} />
                <Typography variant="h5" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, textTransform: "uppercase" }}>
                  No Active Campaigns
                </Typography>
                <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#666666", mt: 1, mb: 3 }}>
                  Create a job campaign to calibrate AI question generation for your technical roles.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setJobModalOpen(true)}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: "#111111",
                    color: "#FFFFFF",
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontWeight: 700,
                    textTransform: "uppercase",
                    py: 1.2,
                    px: 3,
                    boxShadow: "3px 3px 0 #111111",
                    "&:hover": { backgroundColor: "#0044CC" },
                  }}
                >
                  Create Your First Campaign
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                {jobs.map((job) => {
                  const magicLink = `${window.location.origin}/mockInterviewWay?jobId=${job._id}`;
                  return (
                    <Paper key={job._id} elevation={0} sx={brutalCardStyle}>
                      <Typography variant="caption" sx={monoCaptionStyle}>
                        CAMPAIGN ID: {job._id.slice(-8)}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: '"Helvetica Neue", Arial, sans-serif',
                          fontWeight: 800,
                          textTransform: "uppercase",
                          color: "#111111",
                          my: 0.5,
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#555555", mb: 2, minHeight: 40 }}>
                        {job.description}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                        <Chip
                          label={job.experienceLevel || "Mid Level"}
                          size="small"
                          sx={{ borderRadius: 0, border: "1px solid #111111", backgroundColor: "#FFFFFF", fontFamily: '"Courier New", Courier, monospace', fontWeight: 700 }}
                        />
                        <Chip
                          label={`${job.numberOfQuestions || 5} Questions`}
                          size="small"
                          sx={{ borderRadius: 0, border: "1px solid #111111", backgroundColor: "#FFFFFF", fontFamily: '"Courier New", Courier, monospace', fontWeight: 700 }}
                        />
                        <Chip
                          label={`${job.candidateCount || 0} Candidates Evaluated`}
                          size="small"
                          sx={{ borderRadius: 0, border: "1px solid #111111", backgroundColor: "#0044CC", color: "#FFFFFF", fontFamily: '"Courier New", Courier, monospace', fontWeight: 700 }}
                        />
                      </Box>

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <Box sx={{ mb: 2.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, color: "#666666", display: "block", mb: 0.5 }}>
                            REQUIRED SKILLS:
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                            {job.requiredSkills.map((s, idx) => (
                              <Chip
                                key={idx}
                                label={s}
                                size="small"
                                sx={{ borderRadius: 0, backgroundColor: "#ECECE9", fontFamily: '"Courier New", Courier, monospace', fontSize: "0.7rem" }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: "flex", gap: 1, pt: 1, borderTop: "1px solid #ECECE9" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleCopyLink(magicLink)}
                          startIcon={<ContentCopyIcon />}
                          sx={{
                            borderRadius: 0,
                            borderColor: "#111111",
                            color: "#111111",
                            fontFamily: '"Courier New", Courier, monospace',
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            "&:hover": { backgroundColor: "#111111", color: "#FFFFFF" },
                          }}
                        >
                          Copy Magic Link
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            setInviteForm((prev) => ({
                              ...prev,
                              jobId: job._id,
                              jobTitle: job.title,
                              experienceLevel: job.experienceLevel,
                              numberOfQuestions: job.numberOfQuestions,
                              requiredSkills: job.requiredSkills?.join(", ") || "",
                            }));
                            setTab(1);
                          }}
                          startIcon={<SendIcon />}
                          sx={{
                            borderRadius: 0,
                            backgroundColor: "#111111",
                            color: "#FFFFFF",
                            fontFamily: '"Helvetica Neue", Arial, sans-serif',
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            "&:hover": { backgroundColor: "#0044CC" },
                          }}
                        >
                          Invite to Role
                        </Button>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* CANDIDATE EVALUATION DOSSIER MODAL */}
        <Dialog
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              border: "3px solid #111111",
              boxShadow: "8px 8px 0 #111111",
              backgroundColor: "#FFFFFF",
            },
          }}
        >
          {selectedReport && (
            <>
              <DialogTitle
                sx={{
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 2,
                  px: 3,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#66B2FF", fontWeight: 700, display: "block" }}>
                    [ OFFICIAL AI EVALUATION DOSSIER ]
                  </Typography>
                  <Typography variant="h5" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, textTransform: "uppercase" }}>
                    {selectedReport.candidateName || "Candidate Evaluation"}
                  </Typography>
                </Box>
                <IconButton onClick={() => setReportModalOpen(false)} sx={{ color: "#FFFFFF" }}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, backgroundColor: "#FDFDFD" }}>
                {/* Meta details */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: "#F6F6F4", border: "1px solid #111111" }}>
                  <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#111111", mb: 0.5 }}>
                    CANDIDATE: <strong>{selectedReport.candidateName}</strong> ({selectedReport.candidateEmail})
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#111111", mb: 0.5 }}>
                    TARGET POSITION: <strong>{selectedReport.position}</strong> ({selectedReport.experienceLevel})
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#555555" }}>
                    EVALUATION ID: #{selectedReport._id} // TYPE: {selectedReport.mockType || "Official Employer Interview"}
                  </Typography>
                </Box>

                {/* Holistic Scorecards */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, border: "2px solid #111111", borderRadius: 0, textAlign: "center", backgroundColor: "#FFFFFF" }}>
                    <Typography variant="caption" sx={monoCaptionStyle}>
                      OVERALL
                    </Typography>
                    <Typography variant="h4" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, color: "#0044CC", my: 0.5 }}>
                      {selectedReport.overAllRating ? `${selectedReport.overAllRating.toFixed(1)}/10` : "N/A"}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, border: "1px solid #111111", borderRadius: 0, textAlign: "center", backgroundColor: "#FFFFFF" }}>
                    <Typography variant="caption" sx={monoCaptionStyle}>
                      TECHNICAL
                    </Typography>
                    <Typography variant="h4" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, color: "#111111", my: 0.5 }}>
                      {selectedReport.overallTechnicalKnowledge ? `${selectedReport.overallTechnicalKnowledge.toFixed(1)}/10` : "9.0/10"}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, border: "1px solid #111111", borderRadius: 0, textAlign: "center", backgroundColor: "#FFFFFF" }}>
                    <Typography variant="caption" sx={monoCaptionStyle}>
                      PROBLEM SOLVING
                    </Typography>
                    <Typography variant="h4" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, color: "#111111", my: 0.5 }}>
                      {selectedReport.overallProblemSolving ? `${selectedReport.overallProblemSolving.toFixed(1)}/10` : "8.6/10"}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2, border: "1px solid #111111", borderRadius: 0, textAlign: "center", backgroundColor: "#FFFFFF" }}>
                    <Typography variant="caption" sx={monoCaptionStyle}>
                      CLARITY
                    </Typography>
                    <Typography variant="h4" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, color: "#111111", my: 0.5 }}>
                      {selectedReport.overallCommunicationClarity ? `${selectedReport.overallCommunicationClarity.toFixed(1)}/10` : "8.8/10"}
                    </Typography>
                  </Paper>
                </Box>

                {/* Resume Summary */}
                {selectedReport.resumeSummary && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 800, textTransform: "uppercase", color: "#111111", mb: 1 }}>
                      [ CANDIDATE PROFILE & RESUME SYNTHESIS ]
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Courier New", Courier, monospace',
                        backgroundColor: "#F6F6F4",
                        p: 2,
                        border: "1px solid #111111",
                        lineHeight: 1.5,
                      }}
                    >
                      {selectedReport.resumeSummary}
                    </Typography>
                  </Box>
                )}

                {/* Per-question evaluation transcript */}
                <Typography variant="subtitle2" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 800, textTransform: "uppercase", color: "#111111", mb: 1.5 }}>
                  [ QUESTION-BY-QUESTION TRANSCRIPT & AI CRITIQUE ]
                </Typography>

                {selectedReport.qaItems && selectedReport.qaItems.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {selectedReport.qaItems.map((qa, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 2.5,
                          backgroundColor: "#FFFFFF",
                          border: "1.5px solid #111111",
                          boxShadow: "2px 2px 0 #111111",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontFamily: '"Helvetica Neue", Arial, sans-serif',
                              fontWeight: 800,
                              color: "#111111",
                            }}
                          >
                            Q{i + 1}: {qa.question}
                          </Typography>
                          {qa.rating !== undefined && (
                            <Chip
                              label={`SCORE: ${qa.rating}/10`}
                              size="small"
                              sx={{
                                borderRadius: 0,
                                backgroundColor: qa.rating >= 8 ? "#0044CC" : "#111111",
                                color: "#FFFFFF",
                                fontFamily: '"Courier New", Courier, monospace',
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Box>

                        {/* Candidate Answer */}
                        <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: "#F6F6F4", borderLeft: "3px solid #0044CC" }}>
                          <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, color: "#0044CC", display: "block" }}>
                            CANDIDATE RESPONSE:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#111111", mt: 0.5 }}>
                            {qa.userAnswer}
                          </Typography>
                        </Box>

                        {/* AI Feedback */}
                        {qa.feedback && (
                          <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: "#FFF8E1", borderLeft: "3px solid #FFA000" }}>
                            <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, color: "#E65100", display: "block" }}>
                              AI EVALUATOR CRITIQUE:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#333333", mt: 0.5 }}>
                              {qa.feedback}
                            </Typography>
                          </Box>
                        )}

                        {/* Suggested Expert Model Answer */}
                        {qa.suggestedAnswer && (
                          <Box sx={{ p: 1.5, backgroundColor: "#E8F5E9", borderLeft: "3px solid #2E7D32" }}>
                            <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, color: "#1B5E20", display: "block" }}>
                              BENCHMARK MODEL ANSWER:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#111111", mt: 0.5 }}>
                              {qa.suggestedAnswer}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', color: "#666666" }}>
                    No per-question items recorded for this session.
                  </Typography>
                )}
              </DialogContent>

              <DialogActions sx={{ p: 2.5, borderTop: "2px solid #111111", backgroundColor: "#FFFFFF" }}>
                <Button
                  variant="outlined"
                  onClick={() => setReportModalOpen(false)}
                  sx={{
                    borderRadius: 0,
                    borderColor: "#111111",
                    color: "#111111",
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontWeight: 700,
                    textTransform: "uppercase",
                    py: 1,
                    px: 3,
                  }}
                >
                  Close Dossier
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* CREATE JOB CAMPAIGN MODAL */}
        <Dialog
          open={jobModalOpen}
          onClose={() => setJobModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              border: "3px solid #111111",
              boxShadow: "8px 8px 0 #111111",
              backgroundColor: "#FFFFFF",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#111111",
              color: "#FFFFFF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
              px: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 800, textTransform: "uppercase" }}>
              Create Job Campaign
            </Typography>
            <IconButton onClick={() => setJobModalOpen(false)} sx={{ color: "#FFFFFF" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <Box component="form" onSubmit={handleCreateJob}>
            <DialogContent sx={{ p: 3 }}>
              <TextField
                label="Job Campaign Title"
                required
                fullWidth
                value={newJobForm.title}
                onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                placeholder="e.g. Senior Machine Learning Engineer"
                variant="outlined"
                sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />

              <TextField
                label="Role Description & Context"
                fullWidth
                multiline
                rows={3}
                value={newJobForm.description}
                onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                placeholder="Briefly describe what this engineer will build and the expectations..."
                variant="outlined"
                sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
                <TextField
                  select
                  label="Target Seniority"
                  fullWidth
                  value={newJobForm.experienceLevel}
                  onChange={(e) => setNewJobForm({ ...newJobForm, experienceLevel: e.target.value })}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                >
                  <MenuItem value="Entry Level">Entry Level</MenuItem>
                  <MenuItem value="Mid Level">Mid Level</MenuItem>
                  <MenuItem value="Senior Level">Senior Level</MenuItem>
                  <MenuItem value="Lead / Architect">Lead / Architect</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Questions Count"
                  fullWidth
                  value={newJobForm.numberOfQuestions}
                  onChange={(e) => setNewJobForm({ ...newJobForm, numberOfQuestions: e.target.value })}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                >
                  <MenuItem value={3}>3 Questions</MenuItem>
                  <MenuItem value={5}>5 Questions</MenuItem>
                  <MenuItem value={7}>7 Questions</MenuItem>
                  <MenuItem value={10}>10 Questions</MenuItem>
                </TextField>
              </Box>

              <TextField
                label="Required Skills (comma-separated)"
                fullWidth
                value={newJobForm.requiredSkills}
                onChange={(e) => setNewJobForm({ ...newJobForm, requiredSkills: e.target.value })}
                placeholder="e.g. PyTorch, CUDA, Transformers, Distributed Training"
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: "1px solid #ECECE9" }}>
              <Button
                variant="outlined"
                onClick={() => setJobModalOpen(false)}
                sx={{ borderRadius: 0, borderColor: "#111111", color: "#111111", fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreatingJob}
                sx={{
                  borderRadius: 0,
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 700,
                  textTransform: "uppercase",
                  "&:hover": { backgroundColor: "#0044CC" },
                }}
              >
                {isCreatingJob ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
}
