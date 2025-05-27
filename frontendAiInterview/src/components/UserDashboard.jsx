import React from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Code as CodeIcon,
  Work as WorkIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  History as HistoryIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Mock data - replace with actual data from your backend
const userData = {
  username: "johndoe",
  email: "john.doe@example.com",
  phoneNumber: "+1 (555) 123-4567",
  githubId: "johndoe",
  leetcodeId: "johndoe",
  linkedinId: "in/johndoe",
  profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
  interviews: [
    {
      id: 1,
      company: "Google",
      role: "Frontend Developer",
      date: "2023-05-15",
      status: "Completed",
      score: 85,
      feedback:
        "Strong technical skills but need to improve problem explanation.",
    },
    {
      id: 2,
      company: "Microsoft",
      role: "Software Engineer",
      date: "2023-05-20",
      status: "Completed",
      score: 92,
      feedback: "Excellent problem-solving skills and clear communication.",
    },
    {
      id: 3,
      company: "Amazon",
      role: "Full Stack Developer",
      date: "2023-06-01",
      status: "Scheduled",
      scheduledTime: "2023-06-10T14:30:00",
    },
  ],
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  marginBottom: theme.spacing(4),
  background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
  color: theme.palette.common.white,
  "&:hover": {
    transform: "translateY(-4px)",
    transition: "transform 0.3s ease-in-out",
  },
}));

const ProgressBar = ({ value }) => (
  <Box sx={{ width: "100%", mt: 1 }}>
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        height: 8,
        borderRadius: 5,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        "& .MuiLinearProgress-bar": {
          borderRadius: 5,
          background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
        },
      }}
    />
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        0%
      </Typography>
      <Typography variant="caption" color="text.secondary">
        100%
      </Typography>
    </Box>
  </Box>
);

const UserDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Side - Profile Card */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Avatar
                src={userData.profileImage}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  border: "3px solid #3b82f6",
                  boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
                }}
              />
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                {userData.username}
              </Typography>
              <Chip
                label="Free Plan"
                size="small"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(59, 130, 246, 0.2)",
                  color: "#3b82f6",
                  fontWeight: 600,
                }}
              />
            </Box>

            <Divider sx={{ my: 3, bgcolor: "rgba(255, 255, 255, 0.1)" }} />

            {/* User Details */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#94a3b8",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <EmailIcon sx={{ fontSize: 18, mr: 1 }} /> Email
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {userData.email}
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  color: "#94a3b8",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <PhoneIcon sx={{ fontSize: 18, mr: 1 }} /> Phone
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {userData.phoneNumber}
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  color: "#94a3b8",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <GitHubIcon sx={{ fontSize: 18, mr: 1 }} /> GitHub
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                github.com/{userData.githubId}
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  color: "#94a3b8",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CodeIcon sx={{ fontSize: 18, mr: 1 }} /> LeetCode
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                leetcode.com/{userData.leetcodeId}
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  color: "#94a3b8",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LinkedInIcon sx={{ fontSize: 18, mr: 1 }} /> LinkedIn
              </Typography>
              <Typography variant="body1">
                linkedin.com/in/{userData.linkedinId}
              </Typography>
            </Box>

            <Divider sx={{ my: 3, bgcolor: "rgba(255, 255, 255, 0.1)" }} />

            {/* Stats */}
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle2" sx={{ color: "#94a3b8" }}>
                  Profile Completion
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "white", fontWeight: 600 }}
                >
                  85%
                </Typography>
              </Box>
              <ProgressBar value={85} />
            </Box>
          </StyledPaper>
        </Grid>

        {/* Right Side - Interview History */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 700, display: "flex", alignItems: "center" }}
              >
                <HistoryIcon sx={{ mr: 1.5 }} /> Interview History
              </Typography>
              <Chip
                label={`${userData.interviews.length} Interviews`}
                size="small"
                sx={{
                  bgcolor: "rgba(34, 197, 94, 0.2)",
                  color: "#22c55e",
                  fontWeight: 600,
                }}
              />
            </Box>

            {userData.interviews.length > 0 ? (
              <Box>
                {userData.interviews.map((interview) => (
                  <Card
                    key={interview.id}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      "&:hover": {
                        transform: "translateX(4px)",
                        transition: "transform 0.2s ease-in-out",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            {interview.company} - {interview.role}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1.5 }}
                          >
                            {new Date(interview.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                            {interview.scheduledTime &&
                              ` • ${new Date(interview.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                          </Typography>

                          {interview.status === "Completed" && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1.5,
                              }}
                            >
                              <Box sx={{ width: "100%", maxWidth: 200, mr: 2 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={interview.score}
                                  sx={{
                                    height: 8,
                                    borderRadius: 5,
                                    "& .MuiLinearProgress-bar": {
                                      borderRadius: 5,
                                      background:
                                        "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                                    },
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "white" }}
                              >
                                {interview.score}%
                              </Typography>
                            </Box>
                          )}

                          {interview.feedback && (
                            <Typography
                              variant="body2"
                              sx={{ color: "#94a3b8", fontStyle: "italic" }}
                            >
                              "{interview.feedback}"
                            </Typography>
                          )}
                        </Box>

                        <Chip
                          label={interview.status}
                          size="small"
                          color={
                            interview.status === "Completed"
                              ? "success"
                              : "primary"
                          }
                          sx={{
                            fontWeight: 600,
                            bgcolor:
                              interview.status === "Completed"
                                ? "rgba(34, 197, 94, 0.2)"
                                : "rgba(59, 130, 246, 0.2)",
                            color:
                              interview.status === "Completed"
                                ? "#22c55e"
                                : "#3b82f6",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <HistoryIcon
                  sx={{
                    fontSize: 64,
                    color: "rgba(255, 255, 255, 0.1)",
                    mb: 2,
                  }}
                />
                <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
                  No Interview History
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", maxWidth: 400, mx: "auto" }}
                >
                  You haven't completed any mock interviews yet. Start
                  practicing to track your progress and improve your skills.
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard;
