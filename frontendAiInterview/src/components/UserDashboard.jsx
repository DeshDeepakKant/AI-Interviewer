import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Avatar,
  Link,
  Box,
  Paper,
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Divider,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert
} from "@mui/material";
import { styled } from "@mui/system";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CodeIcon from '@mui/icons-material/Code';
import TwitterIcon from '@mui/icons-material/Twitter';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import StarIcon from '@mui/icons-material/Star';
import { teal, amber, green, red, blueGrey } from '@mui/material/colors'; 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link as RouterLink } from "react-router";
import { motion } from 'framer-motion';

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  marginBottom: theme.spacing(4),
  background: 'rgba(26, 31, 46, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(29, 233, 182, 0.3)',
  boxShadow: '0 4px 20px rgba(29, 233, 182, 0.1)',
  color: '#fff',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(29, 233, 182, 0.2)',
    borderColor: 'rgba(29, 233, 182, 0.6)',
  },
}));

const HistoryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  minHeight: '300px',
  background: 'rgba(26, 31, 46, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(29, 233, 182, 0.3)',
  boxShadow: '0 4px 20px rgba(29, 233, 182, 0.1)',
  color: '#fff',
  position: 'relative',
  zIndex: 1,
  marginBottom: theme.spacing(4),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 30px rgba(29, 233, 182, 0.15)',
    borderColor: 'rgba(29, 233, 182, 0.5)',
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: '1px solid rgba(29, 233, 182, 0.5)',
    color: '#ffffff',
    '&.Mui-selected': {
      background: 'rgba(29, 233, 182, 0.2)',
      color: '#1de9b6',
      '&:hover': {
        background: 'rgba(29, 233, 182, 0.3)',
      },
    },
    '&:hover': {
      background: 'rgba(29, 233, 182, 0.1)',
    },
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: '#fff',
  backgroundColor: 'rgba(29, 233, 182, 0.1)',
  transition: 'all 0.3s ease-in-out',
  transform: 'scale(1)',
  '&:hover': {
    backgroundColor: 'rgba(29, 233, 182, 0.3)',
    transform: 'scale(1.1) translateY(-2px)',
    boxShadow: '0 4px 10px rgba(29, 233, 182, 0.3)',
  },
  margin: theme.spacing(0, 0.5),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  color: '#ffffff',
  transition: 'all 0.5s ease-in-out',
  '& svg': {
    fontSize: '3rem',
    marginBottom: theme.spacing(2),
    color: '#ffffff',
    transition: 'all 0.3s ease-in-out',
  },
  '&:hover': {
    '& svg': {
      transform: 'scale(1.2) rotate(10deg)',
      color: 'rgba(29, 233, 182, 0.8)',
    },
    '& h6': {
      color: '#fff',
    },
    '& p': {
      color: '#ffffff',
    }
  },
}));

export default function UserDashboard() {
  const [interviewType, setInterviewType] = useState('mock');
  const [expandedInterview, setExpandedInterview] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    stats: {
      completedInterviews: 0,
      avgRating: 0,
      lastInterview: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Check if user data exists in localStorage
      const cachedUserData = localStorage.getItem('userData');
      
      if (cachedUserData) {
        try {
          // Parse and use cached data
          const parsedData = JSON.parse(cachedUserData);
          setUserData(parsedData);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing cached user data:', error);
          // If there's an error parsing, we'll fetch fresh data
        }
      }

      // If no cached data or error parsing, fetch from API
      try {
        const response = await axios.get("/api/v1/user/currentUser");
        if (response.data.success) {
          const { fullName, email, username, role } = response.data.data;
          const userData = {
            name: fullName,
            email,
            username,
            role,
            stats: {
              completedInterviews: 0, // You can update this with actual stats if available
              avgRating: 0, // You can update this with actual stats if available
              lastInterview: ''
            },
            lastFetched: new Date().toISOString() // Add timestamp
          };
          
          // Save to state
          setUserData(userData);
          
          // Cache the data in localStorage
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch interview history
  useEffect(() => {
    const fetchInterviewHistory = async () => {
      try {
        setLoadingHistory(true);
        const response = await axios.get("https://backend-ai-interview.vercel.app/api/v1/ai/aiHistory");
        
        if (response.data.success && response.data.data?.histories) {
          // Convert histories object to array and sort by date (newest first)
          const historyArray = Object.entries(response.data.data.histories)
            .map(([key, value]) => ({
              id: key,
              ...value,
              createdAt: new Date(value.createdAt),
              overallRating: parseFloat(value.overAllRating) || 0
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
            
          setInterviewHistory(historyArray);
          
          // Update user stats if we have history
          if (historyArray.length > 0) {
            const totalRating = historyArray.reduce((sum, item) => sum + item.overallRating, 0);
            const avgRating = (totalRating / historyArray.length).toFixed(1);
            
            setUserData(prev => ({
              ...prev,
              stats: {
                ...prev.stats,
                completedInterviews: historyArray.length,
                avgRating,
                lastInterview: historyArray[0].createdAt.toLocaleDateString()
              }
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching interview history:", err);
        setHistoryError("Failed to load interview history. Please try again later.");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchInterviewHistory();
  }, []);

  const handleExpandInterview = (interviewId) => {
    setExpandedInterview(expandedInterview === interviewId ? null : interviewId);
  };

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return green[500];
    if (numRating >= 6) return amber[500];
    return red[500];
  };

  const renderQuestionItem = (questionData) => {
    return (
      <Card key={questionData.Question} sx={{ mb: 2, bgcolor: 'rgba(29, 233, 182, 0.05)', borderLeft: `3px solid ${getRatingColor(questionData.Rating)}` }}>
        <CardContent>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {questionData.Question}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Your Answer:</strong> {questionData['Your Answer']}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary">
                <strong>Feedback:</strong> {questionData.Feedback}
              </Typography>
            </Box>
            <Chip 
              label={`Rating: ${questionData.Rating}/10`} 
              size="small" 
              sx={{ 
                backgroundColor: `${getRatingColor(questionData.Rating)}20`,
                color: getRatingColor(questionData.Rating),
                fontWeight: 'bold'
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderInterviewCard = (interview) => {
    const questions = interview.history ? Object.entries(interview.history).map(([key, value]) => ({
      id: key,
      ...value
    })) : [];

    return (
      <Card key={interview.id} sx={{ mb: 2, bgcolor: 'rgba(26, 31, 46, 0.8)', border: '1px solid rgba(29, 233, 182, 0.2)' }}>
        <CardHeader
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">
                {interview.mockType || 'Mock Interview'} - {interview.position || 'Full Stack'}
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={`${interview.overallRating}/10`} 
                  size="small" 
                  sx={{ 
                    backgroundColor: `${getRatingColor(interview.overallRating)}20`,
                    color: getRatingColor(interview.overallRating),
                    fontWeight: 'bold',
                    mr: 1
                  }} 
                />
                <IconButton 
                  size="small" 
                  onClick={() => handleExpandInterview(interview.id)}
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {expandedInterview === interview.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>
          }
          subheader={
            <Typography variant="caption" color="text.secondary">
              {interview.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          }
          sx={{ 
            '& .MuiCardHeader-content': {
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            },
            '& .MuiCardHeader-title': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }
          }}
        />
        <Collapse in={expandedInterview === interview.id} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <List dense>
              {questions.map((q) => (
                <ListItem key={q.id} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={q.Question} 
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondary={
                      <>
                        <Typography component="span" variant="caption" display="block" color="text.secondary">
                          <strong>Your Answer:</strong> {q['Your Answer'] || 'No answer provided'}
                        </Typography>
                        <Typography component="span" variant="caption" display="block" color="text.secondary">
                          <strong>Feedback:</strong> {q.Feedback || 'No feedback available'}
                        </Typography>
                        <Chip 
                          label={`Rating: ${q.Rating || 'N/A'}/10`} 
                          size="small" 
                          sx={{ 
                            mt: 0.5,
                            backgroundColor: `${getRatingColor(q.Rating)}20`,
                            color: getRatingColor(q.Rating),
                            fontSize: '0.65rem',
                            height: '20px'
                          }} 
                        />
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  const handleInterviewType = (event, newType) => {
    if (newType) {
      setInterviewType(newType);
    }
  };

  return (
    <Box className="page-background" sx={{ minHeight: '100vh', pt: 12, pb: 2, background: 'linear-gradient(-45deg, #0a0f1a, #1a1a2e, #16213e, #0d1b2a)', backgroundSize: '400% 400%' }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProfilePaper elevation={0}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar 
                alt={userData.name} 
                sx={{ 
                  width: 80, 
                  height: 80,
                  bgcolor: teal[500],
                  fontSize: '2rem',
                  border: `2px solid ${teal[500]}`,
                  boxShadow: `0 0 10px ${teal[500]}80`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 20px ${teal[500]}`, 
                    borderWidth: '3px'
                  }
                }}
              >
                {userData.name ? userData.name.charAt(0).toUpperCase() : ''}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 1, color: '#fff' }}>
                  {loading ? 'Loading...' : error || userData.name}
                </Typography>
                <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ mb: 1, color: '#ffffff' }}>
                {userData.email || ''}
              </Typography>
              {userData.username && (
                <Typography variant="body2" sx={{ mb: 1, color: '#ffffff' }}>
                  @{userData.username}
                </Typography>
              )}
              {userData.role && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1, 
                    color: teal[300],
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(29, 233, 182, 0.1)',
                    textTransform: 'capitalize',
                    fontSize: '0.875rem'
                  }}
                >
                  {userData.role}
                </Typography>
              )}
              <Box display="flex" gap={2}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#ffffff' }}>Interviews</Typography>
                  <Typography variant="h6" color={teal[300]}>{userData.stats.completedInterviews}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#ffffff' }}>Avg. Rating</Typography>
                  <Box display="flex" alignItems="center">
                    <StarIcon fontSize="small" sx={{ color: '#ffc107', mr: 0.5 }} />
                    <Typography variant="h6" color={teal[300]}>{userData.stats.avgRating}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex">
                <SocialIcon href="https://linkedin.com" target="_blank">
                  <LinkedInIcon />
                </SocialIcon>
                <SocialIcon href="https://leetcode.com" target="_blank">
                  <CodeIcon />
                </SocialIcon>
                <SocialIcon href="https://twitter.com" target="_blank">
                  <TwitterIcon />
                </SocialIcon>
              </Box>
            </Grid>
          </Grid>
          </ProfilePaper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Box textAlign="center" my={4}>
          <StyledToggleButtonGroup
            value={interviewType}
            exclusive
            onChange={handleInterviewType}
            aria-label="Interview Type"
            sx={{ 
              mb: 3,
              '& .MuiToggleButton-root': {
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(29, 233, 182, 0.2)'
                },
                '&.Mui-selected': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(29, 233, 182, 0.3)'
                }
              }
            }}
          >
            <ToggleButton value="company" aria-label="Company Interview">
              Company Interviews
            </ToggleButton>
            <ToggleButton value="mock" aria-label="Mock Interview">
              Mock Interviews
            </ToggleButton>
          </StyledToggleButtonGroup>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <HistoryPaper elevation={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, color: teal[300] }} />
              Interview History
            </Typography>
            <Typography variant="body2" sx={{ color: '#ffffff' }}>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
          
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
          
          {loadingHistory ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress color="primary" />
            </Box>
          ) : historyError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {historyError}
            </Alert>
          ) : interviewHistory.length === 0 ? (
            <EmptyState>
              <HistoryIcon />
              <Typography variant="h6" gutterBottom>No interviews yet</Typography>
              <Typography variant="body2" sx={{ maxWidth: '400px', mb: 2, color: '#ffffff' }}>
                You haven't completed any interviews yet. Start your first interview to see your history here.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                component={RouterLink}
                to="/mockInterviewWay"
                sx={{ 
                  color: '#1de9b6',
                  borderColor: 'rgba(29, 233, 182, 0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, rgba(29, 233, 182, 0.1), transparent)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  '&:hover': {
                    borderColor: '#1de9b6',
                    backgroundColor: 'rgba(29, 233, 182, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(29, 233, 182, 0.2)',
                    '&:before': {
                      transform: 'translateX(100%)',
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                Start Interview
              </Button>
            </EmptyState>
          ) : (
            <Box>
              {interviewHistory
                .filter(interview => interview.mockType?.toLowerCase().includes(interviewType === 'mock' ? 'mock' : 'company'))
                .map(renderInterviewCard)}
            </Box>
          )}
          </HistoryPaper>
        </motion.div>
      </Container>
    </Box>
  );
}
