import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Paper,
  Container,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Skeleton,
  Fade,
  Backdrop,
  Pagination
} from "@mui/material";
import { styled } from "@mui/system";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CodeIcon from '@mui/icons-material/Code';
import TwitterIcon from '@mui/icons-material/Twitter';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { teal, amber, green, red, orange } from '@mui/material/colors'; 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link as RouterLink } from "react-router";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  marginBottom: theme.spacing(3),
  background: 'rgba(26, 31, 46, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(29, 233, 182, 0.3)',
  boxShadow: '0 4px 20px rgba(29, 233, 182, 0.15)',
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(29, 233, 182, 0.05) 0%, rgba(29, 233, 182, 0.02) 100%)',
    zIndex: -1,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(29, 233, 182, 0.25)',
    borderColor: 'rgba(29, 233, 182, 0.5)',
  },
}));

const HistoryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  minHeight: '300px',
  background: 'rgba(26, 31, 46, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(29, 233, 182, 0.3)',
  boxShadow: '0 4px 20px rgba(29, 233, 182, 0.15)',
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(29, 233, 182, 0.03) 0%, rgba(29, 233, 182, 0.01) 100%)',
    zIndex: -1,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(29, 233, 182, 0.2)',
    borderColor: 'rgba(29, 233, 182, 0.4)',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(29, 233, 182, 0.08)',
  border: '1px solid rgba(29, 233, 182, 0.2)',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(29, 233, 182, 0.2)',
    background: 'rgba(29, 233, 182, 0.12)',
    borderColor: 'rgba(29, 233, 182, 0.3)',
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: '#fff',
  backgroundColor: 'rgba(29, 233, 182, 0.1)',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(29, 233, 182, 0.25)',
    transform: 'translateY(-1px)',
  },
  margin: theme.spacing(0, 0.5),
}));

const ModernAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  fontSize: '2rem',
  background: 'linear-gradient(135deg, #1de9b6, #0ea5e9)',
  border: '2px solid rgba(29, 233, 182, 0.5)',
  boxShadow: '0 4px 20px rgba(29, 233, 182, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 25px rgba(29, 233, 182, 0.4)',
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  color: '#ffffff',
  borderRadius: '12px',
  background: 'rgba(29, 233, 182, 0.03)',
  border: '2px dashed rgba(29, 233, 182, 0.2)',
  '& svg': {
    fontSize: '3rem',
    marginBottom: theme.spacing(2),
    color: 'rgba(29, 233, 182, 0.6)',
  },
}));

const InterviewCard = styled(Card)(({ theme, isExpanded }) => ({
  marginBottom: theme.spacing(1.5),
  background: isExpanded 
    ? 'rgba(29, 233, 182, 0.12)' 
    : 'rgba(26, 31, 46, 0.9)',
  border: isExpanded 
    ? '1px solid rgba(29, 233, 182, 0.5)' 
    : '1px solid rgba(29, 233, 182, 0.2)',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(29, 233, 182, 0.2)',
    borderColor: 'rgba(29, 233, 182, 0.4)',
    background: isExpanded 
      ? 'rgba(29, 233, 182, 0.15)' 
      : 'rgba(29, 233, 182, 0.08)',
  },
}));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

export default memo(function UserDashboard() {
  const { user, isLoading: authLoading } = useAuth();
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
    hasPrevPage: false
  });
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    stats: {
      completedInterviews: 0,
      avgRating: 0,
      lastInterview: '',
      totalQuestions: 0,
      successRate: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const filteredInterviews = useMemo(() => {
    return interviewHistory;
  }, [interviewHistory]);

  const userStats = useMemo(() => {
    if (!interviewHistory.length) {
      return {
        completedInterviews: 0,
        avgRating: '0.0',
        lastInterview: '',
        totalQuestions: 0,
        successRate: 0,
        successThreshold: 7,
        goodInterviews: 0,
        totalInterviews: 0
      };
    }

    const totalRating = interviewHistory.reduce((sum, item) => sum + (item.overAllRating || 0), 0);
    const avgRating = (totalRating / interviewHistory.length).toFixed(1);
    const totalQuestions = interviewHistory.reduce((sum, interview) => {
      return sum + (interview.numberOfQuestions || 0);
    }, 0);
    
    const successThreshold = 7;
    const totalInterviews = interviewHistory.length;
    const goodInterviews = interviewHistory.filter(interview => {
      const rating = interview.overAllRating || 0;
      return rating >= successThreshold;
    }).length;
    
    const successRate = totalInterviews > 0 ? 
      Math.round((goodInterviews / totalInterviews) * 100) : 0;

    return {
      completedInterviews: pagination.totalItems || interviewHistory.length,
      avgRating,
      lastInterview: interviewHistory[0]?.createdAt ? new Date(interviewHistory[0].createdAt).toLocaleDateString() : '',
      totalQuestions,
      successRate,
      successThreshold,
      goodInterviews,
      totalInterviews
    };
  }, [interviewHistory, pagination.totalItems]);
  useEffect(() => {
    if (!authLoading && user) {
      setUserData(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        role: user.role || '',
        stats: {
          ...prev.stats,
          ...userStats
        }
      }));
      setLoading(false);
    }
  }, [user, authLoading, userStats]);

  const fetchInterviewHistory = useCallback(async (page = 1, limit = 10) => {
    const controller = new AbortController();
    
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      
      const response = await axios.get(`/api/v1/ai/aiHistory?page=${page}&limit=${limit}`, {
        signal: controller.signal,
        timeout: 10000
      });
      
      if (response.data.success && response.data.data?.data) {
        const historyArray = response.data.data.data.map((interview) => ({
          id: interview._id,
          ...interview,
          createdAt: new Date(interview.createdAt),
          overAllRating: parseFloat(interview.overAllRating) || 0
        }));
          
        setInterviewHistory(historyArray);
        
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error("Error fetching interview history:", err);
        setHistoryError("Failed to load interview history. Please try again later.");
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

  const handlePageChange = useCallback((event, newPage) => {
    fetchInterviewHistory(newPage, pagination.itemsPerPage);
    setExpandedInterview(null);
  }, [fetchInterviewHistory, pagination.itemsPerPage]);

  const handleExpandInterview = useCallback((interviewId) => {
    setExpandedInterview(prev => prev === interviewId ? null : interviewId);
  }, []);

  const getRatingColor = useCallback((rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return green[500];
    if (numRating >= 6) return amber[500];
    return red[500];
  }, []);

  const StatsCardComponent = memo(({ icon, title, value, subtitle, color = teal[300] }) => (
    <StatsCard>
      <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2 }}>
        <Box sx={{ color, mb: 1.5 }}>
          {icon}
        </Box>
  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 0.25 }}>
          {value}
        </Typography>
  <Typography variant="body2" sx={{ color: '#fff', mb: 0.25 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </StatsCard>
  ));

  const LoadingSkeleton = memo(() => (
    <Box>
      <Skeleton 
        variant="rectangular" 
        height={200} 
        sx={{ 
          bgcolor: 'rgba(29, 233, 182, 0.1)', 
          borderRadius: '16px',
          mb: 3 
        }} 
      />
      {[...Array(3)].map((_, index) => (
        <Skeleton 
          key={index}
          variant="rectangular" 
          height={120} 
          sx={{ 
            bgcolor: 'rgba(29, 233, 182, 0.05)', 
            borderRadius: '12px',
            mb: 2 
          }} 
        />
      ))}
    </Box>
  ));

  const renderQuestionItem = useCallback((questionData) => {
    return (
      <Card key={questionData.Question} sx={{ 
        mb: 2, 
        bgcolor: 'rgba(29, 233, 182, 0.08)', 
        borderLeft: `4px solid ${getRatingColor(questionData.Rating)}`,
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: 'rgba(29, 233, 182, 0.12)',
          transform: 'translateX(8px)'
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
            {questionData.Question}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.6 
          }}>
            <strong style={{ color: '#1de9b6' }}>Your Answer:</strong> {questionData['Your Answer']}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              flex: 1,
              minWidth: '200px'
            }}>
              <strong style={{ color: '#1de9b6' }}>Feedback:</strong> {questionData.Feedback}
            </Typography>
            <Chip 
              label={`${questionData.Rating}/10`} 
              size="small" 
              sx={{ 
                backgroundColor: `${getRatingColor(questionData.Rating)}20`,
                color: getRatingColor(questionData.Rating),
                fontWeight: 'bold',
                border: `1px solid ${getRatingColor(questionData.Rating)}40`
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  }, [getRatingColor]);

  const renderInterviewCard = useCallback((interview) => {
    const questions = interview.qaItems || [];
    const isExpanded = expandedInterview === interview.id;

    return (
      <motion.div
        key={interview.id}
        layout
        variants={itemVariants}
        onClick={() => handleExpandInterview(interview.id)}
        style={{ 
          cursor: 'pointer',
          marginBottom: '16px',
          width: '100%'
        }}
      >
        <InterviewCard isExpanded={isExpanded}>
          <CardHeader
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ 
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  {interview.interviewName || 'NA'}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={interview.interviewMode || 'Guided Mode'} 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(29, 233, 182, 0.2)',
                      color: '#1de9b6',
                      fontWeight: 'bold',
                      border: '1px solid rgba(29, 233, 182, 0.3)',
                      fontSize: '0.7rem',
                      mr: 1
                    }} 
                  />
                  <Chip 
                    label={`${interview.overAllRating}/10`} 
                    size="small" 
                    sx={{ 
                      backgroundColor: `${getRatingColor(interview.overAllRating)}25`,
                      color: getRatingColor(interview.overAllRating),
                      fontWeight: 'bold',
                      border: `1px solid ${getRatingColor(interview.overAllRating)}50`,
                      fontSize: '0.75rem'
                    }} 
                  />
                  <motion.div
                    animate={{ 
                      rotate: isExpanded ? 180 : 0,
                      scale: isExpanded ? 1.2 : 1
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <ExpandMoreIcon sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '1.5rem'
                    }} />
                  </motion.div>
                </Box>
              </Box>
            }
            subheader={
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.85rem'
                }}>
                  {interview.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <AssessmentIcon fontSize="small" />
                  {questions.length} Questions
                </Typography>
              </Box>
            }
            sx={{ 
              pb: 1,
              '& .MuiCardHeader-content': {
                overflow: 'hidden'
              }
            }}
          />
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                <CardContent sx={{ pt: 3, px: 3, pb: 3 }}>
                  {/* Resume Summary Section */}
                  {interview.resumeSummary && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ 
                        color: '#1de9b6', 
                        fontWeight: 600, 
                        mb: 1 
                      }}>
                        Resume Summary:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        p: 2,
                        bgcolor: 'rgba(29, 233, 182, 0.05)',
                        borderRadius: '8px',
                        borderLeft: '3px solid rgba(29, 233, 182, 0.3)',
                        lineHeight: 1.6
                      }}>
                        {interview.resumeSummary}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Explanations Section */}
                  {interview.explanations && interview.explanations.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ 
                        color: '#1de9b6', 
                        fontWeight: 600, 
                        mb: 2 
                      }}>
                        AI Explanations:
                      </Typography>
                      {interview.explanations.map((explanation, index) => (
                        <Card key={explanation._id || index} sx={{ 
                          mb: 2, 
                          bgcolor: 'rgba(255, 255, 255, 0.02)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px'
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#1de9b6', 
                              fontWeight: 600, 
                              mb: 1 
                            }}>
                              Question: {explanation.question}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255, 255, 255, 0.8)',
                              lineHeight: 1.6
                            }}>
                              {explanation.explanation}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                  
                  {/* Questions and Answers Section */}
                  <Typography variant="subtitle2" sx={{ 
                    color: '#1de9b6', 
                    fontWeight: 600, 
                    mb: 2 
                  }}>
                    Questions & Answers:
                  </Typography>
                  <List dense sx={{ maxHeight: '400px', overflowY: 'auto', pr: 2, scrollbarGutter: 'stable' }}>
                    {questions.map((q, index) => (
                      <motion.div
                        key={q._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ListItem sx={{ 
                          px: 0, 
                          py: 2,
                          alignItems: 'flex-start',
                          borderBottom: index < questions.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                          borderRadius: '8px',
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(29, 233, 182, 0.05)'
                          }
                        }}>
                          <ListItemIcon sx={{ 
                            minWidth: 40,
                            mt: 0.5
                          }}>
                            <Box sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: 'rgba(29, 233, 182, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              color: '#1de9b6',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </Box>
                          </ListItemIcon>
                          <ListItemText 
                            primary={q.question} 
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              sx: { 
                                color: '#ffffff',
                                fontWeight: 600,
                                lineHeight: 1.6,
                                mb: 2
                              }
                            }}
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography component="div" sx={{ 
                                  color: 'rgba(255, 255, 255, 0.9)',
                                  fontSize: '0.9rem',
                                  lineHeight: 1.7,
                                  mb: 2,
                                  p: 2,
                                  bgcolor: 'rgba(29, 233, 182, 0.05)',
                                  borderRadius: '8px',
                                  borderLeft: '3px solid rgba(29, 233, 182, 0.3)'
                                }}>
                                  <Box component="span" sx={{ 
                                    color: '#1de9b6', 
                                    fontWeight: 600,
                                    display: 'block',
                                    mb: 1
                                  }}>
                                    Your Answer:
                                  </Box>
                                  {q.userAnswer || 'No answer provided'}
                                </Typography>
                                
                                <Typography component="div" sx={{ 
                                  color: 'rgba(255, 255, 255, 0.85)', 
                                  fontSize: '0.85rem',
                                  lineHeight: 1.6,
                                  p: 2,
                                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                                  borderRadius: '8px',
                                  mb: 2
                                }}>
                                  <Box component="span" sx={{ 
                                    color: '#1de9b6', 
                                    fontWeight: 600,
                                    display: 'block',
                                    mb: 1
                                  }}>
                                    AI Feedback:
                                  </Box>
                                  {q.feedback || 'No feedback available'}
                                </Typography>
                                
                                {/* Technical Breakdown */}
                                {(q.technicalKnowledge !== undefined || q.problemSolvingSkills !== undefined || q.communicationClarity !== undefined) && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ 
                                      color: '#1de9b6', 
                                      fontWeight: 600,
                                      display: 'block',
                                      mb: 1
                                    }}>
                                      Detailed Scores:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                      {q.technicalKnowledge !== undefined && (
                                        <Chip 
                                          label={`Tech: ${q.technicalKnowledge}/10`} 
                                          size="small" 
                                          sx={{ 
                                            backgroundColor: `${getRatingColor(q.technicalKnowledge)}20`,
                                            color: getRatingColor(q.technicalKnowledge),
                                            fontSize: '0.65rem',
                                            fontWeight: 600
                                          }} 
                                        />
                                      )}
                                      {q.problemSolvingSkills !== undefined && (
                                        <Chip 
                                          label={`Problem Solving: ${q.problemSolvingSkills}/10`} 
                                          size="small" 
                                          sx={{ 
                                            backgroundColor: `${getRatingColor(q.problemSolvingSkills)}20`,
                                            color: getRatingColor(q.problemSolvingSkills),
                                            fontSize: '0.65rem',
                                            fontWeight: 600
                                          }} 
                                        />
                                      )}
                                      {q.communicationClarity !== undefined && (
                                        <Chip 
                                          label={`Communication: ${q.communicationClarity}/10`} 
                                          size="small" 
                                          sx={{ 
                                            backgroundColor: `${getRatingColor(q.communicationClarity)}20`,
                                            color: getRatingColor(q.communicationClarity),
                                            fontSize: '0.65rem',
                                            fontWeight: 600
                                          }} 
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                )}
                                
                                <Chip 
                                  label={`Overall Score: ${q.rating || 'N/A'}/10`} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: `${getRatingColor(q.rating)}20`,
                                    color: getRatingColor(q.rating),
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    border: `1px solid ${getRatingColor(q.rating)}40`,
                                    borderRadius: '6px'
                                  }} 
                                />
                              </Box>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                        </ListItem>
                      </motion.div>
                    ))}
                  </List>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </InterviewCard>
      </motion.div>
    );
  }, [expandedInterview, handleExpandInterview, getRatingColor]);

  return (
    <Box 
      className="page-background" 
      sx={{ 
        minHeight: '100vh', 
        pt: 10, 
        pb: 2, 
        background: 'linear-gradient(-45deg, #0a0f1a, #1a1a2e, #16213e, #0d1b2a)', 
        backgroundSize: '400% 400%'
      }}
    >
  <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Enhanced Profile Section */}
          <motion.div variants={itemVariants}>
            <ProfilePaper elevation={0}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <ModernAvatar alt={userData.name}>
                    {userData.name ? userData.name.charAt(0).toUpperCase() : ''}
                  </ModernAvatar>
                </Grid>
                <Grid item xs>
                  <Box display="flex" alignItems="center" mb={1.5}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold', 
                      mr: 2, 
                      color: '#fff'
                    }}>
                      {loading ? 'Loading...' : userData.name || 'User'}
                    </Typography>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { 
                          color: '#1de9b6'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body1" sx={{ 
                    mb: 1, 
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>
                    {userData.email}
                  </Typography>
                  
                  {userData.username && (
                    <Typography variant="body2" sx={{ 
                      mb: 1.5, 
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      @{userData.username}
                    </Typography>
                  )}
                  
                  {userData.role && (
                    <Chip
                      label={userData.role}
                      size="small"
                      sx={{ 
                        color: '#1de9b6',
                        bgcolor: 'rgba(29, 233, 182, 0.15)',
                        border: '1px solid rgba(29, 233, 182, 0.3)',
                        textTransform: 'capitalize',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Grid>
                
                <Grid item>
                  <Box display="flex" gap={1}>
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

          {/* Enhanced Stats Cards */}
          <motion.div variants={itemVariants}>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              sx={{ mt: 1, mb: 2, mx: 'auto', maxWidth: 1200 }}
            >
              <Grid item xs={12} sm={6} md={3}>
                <StatsCardComponent
                  icon={<AssessmentIcon fontSize="large" />}
                  title="Total Interviews"
                  value={userData.stats.completedInterviews}
                  subtitle="Completed"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCardComponent
                  icon={<StarIcon fontSize="large" />}
                  title="Average Rating"
                  value={userData.stats.avgRating}
                  subtitle="Out of 10"
                  color={amber[400]}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCardComponent
                  icon={<CheckCircleOutlineIcon fontSize="large" />}
                  title="Total Questions"
                  value={userData.stats.totalQuestions}
                  subtitle="Answered"
                  color={green[400]}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCardComponent
                  icon={<TrendingUpIcon fontSize="large" />}
                  title="Success Rate"
                  value={`${userData.stats.successRate}%`}
                  subtitle={userData.stats.totalInterviews > 0 ? 
                    `${userData.stats.goodInterviews} of ${userData.stats.totalInterviews} interviews scored ≥7` :
                    `Interviews scoring ≥7 out of 10`
                  }
                  color={userData.stats.successRate >= 70 ? green[400] : userData.stats.successRate >= 50 ? orange[400] : red[400]}
                />
              </Grid>
            </Grid>
          </motion.div>

          {/* Enhanced History Section */}
          <motion.div variants={itemVariants}>
            <HistoryPaper elevation={0} sx={{ mt: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}>
                  <HistoryIcon sx={{ color: teal[300] }} />
                  Mock Interview History
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box component="span" sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#1de9b6',
                    display: 'inline-block'
                  }} />
                  Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Box>
              
              <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', mb: 4 }} />
              
              {loadingHistory ? (
                <LoadingSkeleton />
              ) : historyError ? (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    '& .MuiAlert-message': {
                      color: '#fff'
                    }
                  }}
                >
                  {historyError}
                  <Button 
                    size="small" 
                    onClick={fetchInterviewHistory}
                    sx={{ ml: 2, color: '#1de9b6' }}
                  >
                    Retry
                  </Button>
                </Alert>
              ) : filteredInterviews.length === 0 ? (
                <EmptyState>
                  <HistoryIcon />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    No mock interviews yet
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    maxWidth: '500px', 
                    mb: 3, 
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6
                  }}>
                    Ready to ace your next interview? Start practicing with our AI-powered mock interview system and get instant feedback.
                  </Typography>
                  <Button 
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to="/mockInterviewWay"
                    sx={{ 
                      background: 'linear-gradient(135deg, #1de9b6, #0ea5e9)',
                      color: '#fff',
                      fontWeight: 600,
                      py: 1.5,
                      px: 4,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 8px 24px rgba(29, 233, 182, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0ea5e9, #1de9b6)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(29, 233, 182, 0.4)'
                      }
                    }}
                  >
                    Start Your First Interview
                  </Button>
                </EmptyState>
              ) : (
                <motion.div variants={containerVariants}>
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      mb: 3,
                      gap: 2
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.85rem'
                      }}>
                        Page {pagination.currentPage} of {pagination.totalPages} 
                        ({pagination.totalItems} total interviews)
                      </Typography>
                      <Pagination
                        count={pagination.totalPages}
                        page={pagination.currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="medium"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                              backgroundColor: 'rgba(29, 233, 182, 0.1)',
                              borderColor: '#1de9b6',
                              color: '#1de9b6'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#1de9b6',
                              color: '#000000',
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: '#1de9b6'
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  )}
                  <AnimatePresence mode="wait">
                    {filteredInterviews.map(renderInterviewCard)}
                  </AnimatePresence>
                </motion.div>
              )}
            </HistoryPaper>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
});
