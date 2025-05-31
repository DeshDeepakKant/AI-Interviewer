import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Fade,
  Zoom,
  Slide,
  Grow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Animation keyframes
const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
  opacity: 0,
});

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px 0 rgba(0, 0, 0, 0.4)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 12,
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const UploadArea = styled(Paper)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: 12,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive ? 'rgba(0, 191, 165, 0.05)' : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(0, 191, 165, 0.05)',
  },
}));

const positions = [
   'Auto - AI will ask questions based on your resume',
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'DevOps Engineer',
  'Artificial Intelligence',
  'Machine Learning Engineer',
  'Data Scientist',
  'UI/UX Designer',
  'Product Manager',
];

const MockInterviewWay = () => {
  const [numQuestions, setNumQuestions] = useState('5');
  const [position, setPosition] = useState(positions[0]);
  const experienceLevels = ['Student/Fresher', '0-2 years', '2-5 years', '5-10 years', '10+ years'];
  const [experience, setExperience] = useState(experienceLevels[0]);
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleNumQuestionsChange = (event) => setNumQuestions(event.target.value);
  const handleExperienceChange = (event) => setExperience(event.target.value);
  const handlePositionChange = (event) => setPosition(event.target.value);
  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create a FileReader to read the file
      const reader = new FileReader();
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Simulate progress up to 90% while reading
          const newProgress = Math.min(prev + 10, 90);
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return newProgress;
        });
      }, 100);
      
      reader.onload = (e) => {
        // File is loaded
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Create a local URL for the file
        const fileUrl = URL.createObjectURL(file);
        
        // Set the file in state
        setResumeFile({
          file: file,
          url: fileUrl,
          name: file.name,
          size: file.size
        });
        
        // Clean up
        setTimeout(() => setIsUploading(false), 300);
      };
      
      reader.onerror = () => {
        clearInterval(progressInterval);
        alert('Error reading file. Please try again.');
        setIsUploading(false);
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveFile = () => setResumeFile(null);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!position) {
      alert('Please select a position');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      console.log({ numQuestions, position, resumeFile });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(-45deg, #0a0f1a, #1a1a2e, #16213e, #0d1b2a)',
        backgroundSize: '400% 400%',
        animation: `${gradient} 15s ease infinite`,
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: {
          xs: '140px 16px 40px',
          sm: '160px 24px 40px',
          md: '100px 32px 40px'
        },
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(to bottom, rgba(10, 15, 26, 0.98), rgba(10, 15, 26, 0.85), transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Decorative elements */}
      <Box sx={{
        position: 'fixed',
        top: '20%',
        right: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 191, 165, 0.15) 0%, rgba(0, 172, 193, 0) 70%)',
        zIndex: 0,
        animation: `${pulse} 8s ease-in-out infinite`,
      }} />
      <Box sx={{
        position: 'fixed',
        bottom: '10%',
        left: '5%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 172, 193, 0.1) 0%, rgba(0, 172, 193, 0) 70%)',
        zIndex: 0,
        animation: `${pulse} 10s ease-in-out infinite 2s`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3,
          ease: 'easeOut'
        }}
        style={{ 
          width: '100%', 
          maxWidth: '640px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <StyledCard sx={{
          position: 'relative',
          overflow: 'visible',
        }}>
          <Box
            sx={{
              background: 'linear-gradient(90deg, #00bfa5 0%, #00acc1 100%)',
              color: '#ffffff',
              p: { xs: 2, sm: 3 },
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  mb: 1,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}
              >
                AI-Powered Mock Interview
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  opacity: 0.9, 
                  fontWeight: 300,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  maxWidth: '90%',
                  mx: 'auto',
                }}
              >
                Get instant feedback on your interview performance
              </Typography>
            </motion.div>
          </Box>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3.5}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="position-label" sx={{ color: '#ffffff' }}>
                      Select Position
                    </InputLabel>
                    <Select
                      labelId="position-label"
                      id="position"
                      value={position}
                      onChange={handlePositionChange}
                      required
                      label="Select Position"
                      startAdornment={
                        <WorkIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                      }
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: '#1a1f2e',
                            color: '#ffffff',
                            '& .MuiMenuItem-root': {
                              padding: '8px 16px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 191, 165, 0.15)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(0, 191, 165, 0.25)',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 191, 165, 0.3)',
                                },
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        color: '#ffffff',
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 191, 165, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#00bfa5',
                        },
                      }}
                    >
                      {positions.map((pos) => (
                        <MenuItem 
                          key={pos} 
                          value={pos}
                          sx={{
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 191, 165, 0.15)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(0, 191, 165, 0.25)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 191, 165, 0.3)',
                              },
                            },
                          }}
                        >
                          {pos}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="experience-label" sx={{ color: '#ffffff' }}>
                      Experience Level
                    </InputLabel>
                    <Select
                      labelId="experience-label"
                      id="experience"
                      value={experience}
                      onChange={handleExperienceChange}
                      label="Experience Level"
                      startAdornment={
                        <BusinessIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                      }
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: '#1a1f2e',
                            color: '#ffffff',
                            '& .MuiMenuItem-root': {
                              padding: '8px 16px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 191, 165, 0.15)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(0, 191, 165, 0.25)',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 191, 165, 0.3)',
                                },
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        color: '#ffffff',
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 191, 165, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#00bfa5',
                        },
                        mb: 2
                      }}
                    >
                      {['Student/Fresher', '0-2 years', '2-5 years', '5-10 years', '10+ years'].map((exp) => (
                        <MenuItem 
                          key={exp} 
                          value={exp}
                          sx={{
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 191, 165, 0.15)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(0, 191, 165, 0.25)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 191, 165, 0.3)',
                              },
                            },
                          }}
                        >
                          {exp}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="num-questions-label" sx={{ color: '#ffffff' }}>
                      Number of Questions
                    </InputLabel>
                    <Select
                      labelId="num-questions-label"
                      id="num-questions"
                      value={numQuestions}
                      onChange={handleNumQuestionsChange}
                      label="Number of Questions"
                      startAdornment={
                        <QuizIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                      }
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: '#1a1f2e',
                            color: '#ffffff',
                            '& .MuiMenuItem-root': {
                              padding: '8px 16px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 191, 165, 0.15)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(0, 191, 165, 0.25)',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 191, 165, 0.3)',
                                },
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        color: '#ffffff',
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 191, 165, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#00bfa5',
                        },
                      }}
                    >
                      {['5', '10', '15', '20', '25+'].map((n) => (
                        <MenuItem 
                          key={n} 
                          value={n}
                          sx={{
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 191, 165, 0.15)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(0, 191, 165, 0.25)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 191, 165, 0.3)',
                              },
                            },
                          }}
                        >
                          {n} Questions
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom 
                      sx={{ 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 500
                      }}
                    >
                      <DescriptionIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                      Upload Your Resume (Optional)
                    </Typography>
                    {!resumeFile && !isUploading ? (
                      <UploadArea 
                        elevation={0}
                        isDragActive={isDragActive}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleUploadClick}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                        <Box sx={{ py: 2 }}>
                          <CloudUploadIcon sx={{ 
                            fontSize: 48, 
                            color: 'rgba(255, 255, 255, 0.9)',
                            mb: 1,
                            transition: 'all 0.3s ease',
                          }} />
                          <Typography variant="body2" color="rgba(255,255,255,0.85)" gutterBottom>
                            Drag & drop your resume here, or <Box component="span" sx={{ color: '#00e5ff', fontWeight: 600, textDecoration: 'underline' }}>browse</Box>
                          </Typography>
                          <Typography variant="caption" color="#ffffff" sx={{ display: 'block', mt: 1, opacity: 0.9, fontSize: '0.75rem' }}>
                            Supports PDF, DOC, DOCX (max 5MB)
                          </Typography>
                        </Box>
                      </UploadArea>
                    ) : isUploading ? (
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="rgba(255,255,255,0.8)">
                            Uploading...
                          </Typography>
                          <Typography variant="caption" color="rgba(255,255,255,0.8)">
                            {Math.round(uploadProgress)}%
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
                          <Box 
                            sx={{
                              height: 8,
                              width: `${uploadProgress}%`,
                              bgcolor: 'primary.main',
                              transition: 'width 0.3s ease',
                              borderRadius: 1,
                              background: 'linear-gradient(90deg, #00e5ff, #00b8d4)'
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                          {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                        </Typography>
                      </Box>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 2,
                            borderColor: 'rgba(0, 191, 165, 0.3)',
                            backgroundColor: 'rgba(0, 191, 165, 0.05)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'rgba(0, 191, 165, 0.15)', 
                                color: '#00bfa5',
                                width: 44,
                                height: 44,
                              }}
                            >
                              <DescriptionIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={900}>
                                {resumeFile.name.length > 20 
                                  ? `${resumeFile.name.substring(0, 17)}...${resumeFile.name.split('.').pop()}` 
                                  : resumeFile.name}
                              </Typography>
                              <Typography variant="caption" fontWeight={900} sx={{color: '#A0A0A0'}}>
                                {(resumeFile.size / 1024).toFixed(1)} KB • {resumeFile.name.split('.').pop().toUpperCase()}
                              </Typography>
                            </Box>
                          </Box>
                          <Button 
                            size="small"
                            
                            onClick={handleRemoveFile}
                            variant="outlined"
                            color="error"
                            startIcon={<CloseIcon />}
                            sx={{
                              minWidth: 'auto',
                              p: 1,
                              '& .MuiButton-startIcon': {
                                margin: 0,
                              },
                            }}
                          >
                            {!isMobile && 'Remove'}
                          </Button>
                        </Paper>
                      </motion.div>
                    )}
                  </Box>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.2,
                    delay: 0.4
                  }}
                >
                  <StyledButton
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isLoading || !position}
                    sx={{
                      py: 1.75,
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #00bfa5 0%, #00acc1 100%)',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 14px rgba(0, 191, 165, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #00a58e 0%, #0097a7 100%)',
                        boxShadow: '0 6px 20px rgba(0, 191, 165, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.3)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={24} color="inherit" sx={{ mr: 1.5 }} />
                        Preparing Interview...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                        Start Mock Interview
                      </>
                    )}
                  </StyledButton>
                </motion.div>
              </Stack>
            </form>
          </CardContent>
        </StyledCard>
      </motion.div>
    </Box>
  );
};

export default MockInterviewWay;
