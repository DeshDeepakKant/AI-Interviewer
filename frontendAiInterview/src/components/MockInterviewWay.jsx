import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
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
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { toast } from 'react-toastify';

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    color: '#111111',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '0.95rem',
    fontWeight: 600,
    '& fieldset': {
      borderColor: '#111111',
      borderWidth: '1px',
      transition: 'border-color 0.15s ease',
    },
    '&:hover fieldset': {
      borderColor: '#0044CC',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0044CC',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#555555',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    '&.Mui-focused': {
      color: '#0044CC',
    },
  },
};

const menuProps = {
  PaperProps: {
    sx: {
      borderRadius: 0,
      border: '1px solid #111111',
      boxShadow: '4px 4px 0 #111111',
      backgroundColor: '#FFFFFF',
      color: '#111111',
      '& .MuiMenuItem-root': {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '0.9rem',
        padding: '10px 16px',
        '&:hover': {
          backgroundColor: '#ECECE9',
        },
        '&.Mui-selected': {
          backgroundColor: '#0044CC',
          color: '#FFFFFF',
          fontWeight: 700,
          '&:hover': {
            backgroundColor: '#003399',
          },
        },
      },
    },
  },
};

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

const experienceLevels = ['Student/Fresher', '0-2 years', '2-5 years', '5-10 years', '10+ years'];
const interviewModes = ['Guided Mode', 'Hard Mode'];
const questionCounts = ['5', '10', '15', '20', '25+'];

const MockInterviewWay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { user } = useAuth();

  const [jobDetails, setJobDetails] = useState(null);
  const [loadingJob, setLoadingJob] = useState(false);
  const [numQuestions, setNumQuestions] = useState('5');
  const [position, setPosition] = useState(positions[0]);
  const [experience, setExperience] = useState(experienceLevels[0]);
  const [interviewMode, setInterviewMode] = useState(interviewModes[0]);
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      try {
        setLoadingJob(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/employer/jobs/public/${jobId}`);
        if (res.data?.success && res.data?.data) {
          const job = res.data.data;
          setJobDetails(job);
          if (job.title) setPosition(job.title);
          if (job.experienceLevel) setExperience(job.experienceLevel);
          if (job.numberOfQuestions) setNumQuestions(String(job.numberOfQuestions));
          if (job.interviewMode) setInterviewMode(job.interviewMode);
        }
      } catch (err) {
        console.warn('Could not fetch job campaign details:', err);
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    return () => {
      if (resumeFile?.url && resumeFile.url.startsWith('blob:')) {
        URL.revokeObjectURL(resumeFile.url);
      }
    };
  }, [resumeFile]);

  const handleFileUpload = async (event) => {
    const file = event?.target?.files?.[0] || event;

    if (!file) return;

    if (!(file instanceof File || file instanceof Blob)) {
      toast.error('Invalid file selected.');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Format restriction: Please upload a PDF file.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds maximum threshold (5 MB).');
      return;
    }

    try {
      setUploadProgress(0);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('resumePdf', file);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/ai/aiUploadResume`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        }
      );

      if (response.data.success) {
        let fileUrl;
        try {
          fileUrl = URL.createObjectURL(file);
        } catch {
          fileUrl = null;
        }

        setUploadProgress(100);
        setSessionId(response.data.data.sessionId);

        setResumeFile({
          file,
          url: fileUrl,
          name: file.name,
          size: file.size,
          sessionId: response.data.data.sessionId,
        });

        toast.success(`Dossier processed: ${file.name}`);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process resume.';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    if (resumeFile?.url && resumeFile.url.startsWith('blob:')) {
      URL.revokeObjectURL(resumeFile.url);
    }
    setResumeFile(null);
    setUploadProgress(0);
    setSessionId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (!position) {
      toast.error('Please designate a target position.');
      return;
    }

    if (!sessionId || !resumeFile) {
      toast.error('Resume submission required before initializing interview.');
      return;
    }

    setIsLoading(true);

    try {
      sessionStorage.setItem('interviewSessionId', sessionId);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/ai/ai`,
        {
          sessionId,
          position,
          experienceLevel: experience,
          numberOfQuestionYouShouldAsk: numQuestions,
          interviewMode,
          jobId: jobId || undefined,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.data.success) {
        navigate('/interview', {
          state: {
            sessionId,
            numberOfQuestions: response.data.data.numberOfQuestion,
            interviewMode,
          },
          replace: true,
        });
      } else {
        throw new Error(response.data.message || 'Failed to start interview');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize session.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#ECECE9',
        minHeight: '100vh',
        py: { xs: 5, md: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="md">
        {/* Header Title Block */}
        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <Typography
            variant="caption"
            sx={{
              display: 'inline-block',
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#0044CC',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            [ PROTOCOL FORM // CANDIDATE INTAKE ]
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontWeight: 800,
              color: '#111111',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1.1,
            }}
          >
            Assessment Configuration
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              color: '#555555',
              mt: 1.5,
              maxWidth: '680px',
              fontSize: '0.95rem',
            }}
          >
            Configure evaluation parameters, role requirements, and upload candidate resume to instantiate the adaptive LangGraph interview agent.
          </Typography>
        </Box>

        {/* Recruiter Notice Banner */}
        {user?.role === 'employer' && !jobId && (
          <Box
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: '#FFFBE6',
              border: '2px solid #111111',
              boxShadow: '4px 4px 0 #111111',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <SchoolIcon sx={{ color: '#0044CC', fontSize: 24 }} />
              <Typography
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: '#111111',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                [ RECRUITER / EMPLOYER NOTIFICATION ]
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#111111',
                mb: 0.5,
              }}
            >
              You are currently accessing the candidate interview assessment portal.
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '0.85rem',
                color: '#555555',
                mb: 2,
              }}
            >
              As an Employer, you do not need to take your own interview. Visit your Recruiter Command Center to view candidate scorecards, dossiers, and schedule invitations.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/employer')}
              sx={{
                borderRadius: 0,
                backgroundColor: '#0044CC',
                color: '#FFFFFF',
                fontFamily: '"Courier New", Courier, monospace',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '3px 3px 0 #111111',
                border: '1px solid #111111',
                textTransform: 'none',
                px: 2.5,
                py: 1,
                '&:hover': {
                  backgroundColor: '#003399',
                  boxShadow: '1px 1px 0 #111111',
                },
              }}
            >
              Go to Employer Command Center →
            </Button>
          </Box>
        )}

        {/* Invited Candidate Campaign Banner */}
        {jobDetails && (
          <Box
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: '#0044CC',
              color: '#FFFFFF',
              border: '2px solid #111111',
              boxShadow: '5px 5px 0 #111111',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                fontWeight: 800,
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                color: '#FFCC00',
                textTransform: 'uppercase',
                mb: 0.5,
              }}
            >
              [ INVITATION VERIFIED // OFFICIAL CANDIDATE ASSESSMENT ]
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                mb: 0.5,
              }}
            >
              {jobDetails.title}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
              {jobDetails.department && (
                <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '0.85rem', opacity: 0.9 }}>
                  Dept: {jobDetails.department}
                </Typography>
              )}
              {jobDetails.experienceLevel && (
                <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '0.85rem', opacity: 0.9 }}>
                  Level: {jobDetails.experienceLevel}
                </Typography>
              )}
              {jobDetails.numberOfQuestions && (
                <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '0.85rem', opacity: 0.9 }}>
                  Questions: {jobDetails.numberOfQuestions}
                </Typography>
              )}
            </Stack>
            {jobDetails.description && (
              <Typography
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: '#E0E7FF',
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  pt: 1,
                }}
              >
                {jobDetails.description}
              </Typography>
            )}
          </Box>
        )}

        {/* Dossier Card Container */}
        <Card
          sx={{
            borderRadius: 0,
            border: '2px solid #111111',
            boxShadow: '6px 6px 0 #111111',
            backgroundColor: '#FFFFFF',
            overflow: 'visible',
          }}
        >
          {/* Top Classification Banner */}
          <Box
            sx={{
              backgroundColor: '#111111',
              color: '#FFFFFF',
              px: 3,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #111111',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              FORM SPEC: INT-SETUP-2026
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: '#0044CC',
                bgcolor: '#FFFFFF',
                px: 1,
                py: 0.25,
                fontWeight: 800,
                fontSize: '0.75rem',
              }}
            >
              ACTIVE SYSTEM
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* SECTION 01: POSITION & SENIORITY */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontFamily: '"Courier New", Courier, monospace',
                      fontWeight: 800,
                      color: '#111111',
                      borderBottom: '1px solid #111111',
                      pb: 0.5,
                      mb: 2.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    01 // TARGET ROLE & SENIORITY
                  </Typography>

                  <Stack spacing={3}>
                    <FormControl fullWidth sx={fieldStyle}>
                      <InputLabel id="position-label">Target Position</InputLabel>
                      <Select
                        labelId="position-label"
                        id="position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        label="Target Position"
                        MenuProps={menuProps}
                      >
                        {positions.map((pos) => (
                          <MenuItem key={pos} value={pos}>
                            {pos}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                      <FormControl fullWidth sx={fieldStyle}>
                        <InputLabel id="experience-label">Experience Tier</InputLabel>
                        <Select
                          labelId="experience-label"
                          id="experience"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          label="Experience Tier"
                          MenuProps={menuProps}
                        >
                          {experienceLevels.map((exp) => (
                            <MenuItem key={exp} value={exp}>
                              {exp}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={fieldStyle}>
                        <InputLabel id="num-questions-label">Questions To Administer</InputLabel>
                        <Select
                          labelId="num-questions-label"
                          id="num-questions"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(e.target.value)}
                          label="Questions To Administer"
                          MenuProps={menuProps}
                        >
                          {questionCounts.map((n) => (
                            <MenuItem key={n} value={n}>
                              {n} Questions
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Stack>
                </Box>

                {/* SECTION 02: ASSESSMENT MODE */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontFamily: '"Courier New", Courier, monospace',
                      fontWeight: 800,
                      color: '#111111',
                      borderBottom: '1px solid #111111',
                      pb: 0.5,
                      mb: 2.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    02 // EVALUATION PROTOCOL
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {interviewModes.map((mode) => {
                      const isSelected = interviewMode === mode;
                      return (
                        <Box
                          key={mode}
                          onClick={() => setInterviewMode(mode)}
                          sx={{
                            border: isSelected ? '2px solid #0044CC' : '1px solid #111111',
                            boxShadow: isSelected ? '4px 4px 0 #0044CC' : 'none',
                            p: 2.5,
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#F4F7FF' : '#FFFFFF',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              borderColor: '#0044CC',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            {mode === 'Guided Mode' ? (
                              <SchoolIcon sx={{ color: isSelected ? '#0044CC' : '#111111', fontSize: 22 }} />
                            ) : (
                              <WhatshotIcon sx={{ color: isSelected ? '#0044CC' : '#111111', fontSize: 22 }} />
                            )}
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                fontSize: '0.95rem',
                                color: isSelected ? '#0044CC' : '#111111',
                              }}
                            >
                              {mode}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: '"Courier New", Courier, monospace',
                              fontSize: '0.8rem',
                              color: '#555555',
                              lineHeight: 1.4,
                            }}
                          >
                            {mode === 'Guided Mode'
                              ? 'Interactive hints available via //explanation prompt. Balanced drill-downs.'
                              : 'Rigorous real-time assessment with strict depth probing and zero hints.'}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* SECTION 03: RESUME DOSSIER */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontFamily: '"Courier New", Courier, monospace',
                      fontWeight: 800,
                      color: '#111111',
                      borderBottom: '1px solid #111111',
                      pb: 0.5,
                      mb: 2.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    03 // CANDIDATE DOSSIER INGESTION
                  </Typography>

                  {!resumeFile && !isUploading ? (
                    <Box
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        border: isDragActive ? '2px dashed #0044CC' : '2px dashed #111111',
                        backgroundColor: isDragActive ? '#EEF2FF' : '#FAF9F6',
                        p: { xs: 4, sm: 5 },
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: '#F0EFEA',
                          borderColor: '#0044CC',
                        },
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <UploadFileIcon sx={{ fontSize: 44, color: '#111111', mb: 1 }} />
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: '"Helvetica Neue", Arial, sans-serif',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          mb: 0.5,
                        }}
                      >
                        Click to upload or drag & drop PDF
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontFamily: '"Courier New", Courier, monospace',
                          color: '#666666',
                          fontSize: '0.8rem',
                        }}
                      >
                        MAXIMUM SIZE: 5 MB // APPLICATION/PDF ONLY
                      </Typography>
                    </Box>
                  ) : isUploading ? (
                    <Box
                      sx={{
                        p: 4,
                        border: '1px solid #111111',
                        backgroundColor: '#FFFFFF',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontFamily: '"Courier New", Courier, monospace',
                          fontWeight: 700,
                          mb: 1.5,
                          textTransform: 'uppercase',
                        }}
                      >
                        PARSING PDF STREAM INTO VECTOR MEMORY... ({uploadProgress}%)
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 10,
                          backgroundColor: '#ECECE9',
                          border: '1px solid #111111',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${uploadProgress}%`,
                            backgroundColor: '#0044CC',
                            transition: 'width 0.2s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: '2px solid #111111',
                        boxShadow: '3px 3px 0 #111111',
                        backgroundColor: '#FFFFFF',
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            backgroundColor: '#111111',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <DescriptionIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontFamily: '"Courier New", Courier, monospace',
                              fontWeight: 800,
                              color: '#111111',
                              fontSize: '0.95rem',
                            }}
                          >
                            {resumeFile.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"Courier New", Courier, monospace',
                              color: '#666666',
                              fontSize: '0.75rem',
                            }}
                          >
                            {(resumeFile.size / 1024).toFixed(1)} KB // VERIFIED PDF STREAM
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        onClick={handleRemoveFile}
                        variant="outlined"
                        size="small"
                        startIcon={<CloseIcon />}
                        sx={{
                          borderRadius: 0,
                          borderColor: '#111111',
                          color: '#111111',
                          fontFamily: '"Helvetica Neue", Arial, sans-serif',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          boxShadow: '2px 2px 0 #111111',
                          '&:hover': {
                            backgroundColor: '#FFEEEE',
                            borderColor: '#D32F2F',
                            color: '#D32F2F',
                            boxShadow: '1px 1px 0 #D32F2F',
                          },
                        }}
                      >
                        {!isMobile && 'REMOVE'}
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* SUBMIT ACTION BUTTON */}
                <Box sx={{ pt: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading || !position || !sessionId}
                    variant="contained"
                    sx={{
                      py: 2,
                      borderRadius: 0,
                      backgroundColor: '#111111',
                      color: '#FFFFFF',
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      border: '2px solid #111111',
                      boxShadow: '4px 4px 0 #111111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      '&:hover': {
                        backgroundColor: '#0044CC',
                        borderColor: '#0044CC',
                        boxShadow: '2px 2px 0 #111111',
                        transform: 'translate(2px, 2px)',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#E0E0DB',
                        borderColor: '#999999',
                        color: '#888888',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={20} color="inherit" />
                        INSTANTIATING ASSESSMENT AGENT...
                      </>
                    ) : (
                      <>
                        INITIALIZE ASSESSMENT PROTOCOL
                        <ArrowForwardIcon sx={{ fontSize: 20 }} />
                      </>
                    )}
                  </Button>

                  {!sessionId && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'center',
                        fontFamily: '"Courier New", Courier, monospace',
                        color: '#666666',
                        mt: 1.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      * DOSSIER UPLOAD IS REQUIRED BEFORE INITIATING INTERVIEW SESSION
                    </Typography>
                  )}
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default MockInterviewWay;