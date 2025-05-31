import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startLiveTranscription } from "./SpeechTranscrib";
import { useLocation } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  useTheme,
  Paper,
  styled,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ai from "../assets/ai.jpeg";
import {useNavigate} from "react-router";
import {toast} from "react-toastify";
import SendIcon from '@mui/icons-material/Send';

// Initialize MediaRecorder and other variables
let mediaRecorder;
let recordedChunks = [];
const GlassCard = styled(Card)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 32px 0 rgba(0, 180, 165, 0.2)",
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #00bfa5 30%, #00acc1 90%)",
  color: "#fff",
  padding: "10px 24px",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(0, 180, 165, 0.3)",
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  color: "#fff",
  padding: "10px 24px",
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.15)",
    transform: "translateY(-2px)",
  },
}));

const AIInterview = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for session and interview details
  const [sessionId, setSessionId] = useState('');
  const [interviewDetails, setInterviewDetails] = useState(null);
  
  // Initialize session and interview details when component mounts
  useEffect(() => {
    console.log('=== AIInterview Component Mounted ===');
    
    // Get from location state (passed during navigation)
    const stateData = location.state || {};
    const stateSessionId = stateData.sessionId;
    const stateInterviewDetails = stateData.interviewDetails;
    
    // Get from sessionStorage
    const storedSessionId = sessionStorage.getItem('interviewSessionId');
    
    // Use state session ID if available, otherwise fall back to stored one
    const activeSessionId = stateSessionId || storedSessionId;
    
    if (activeSessionId) {
      setSessionId(activeSessionId);
      // Ensure it's also in sessionStorage for page refreshes
      sessionStorage.setItem('interviewSessionId', activeSessionId);
    } else {
      // If no session ID is found, redirect back to home
      toast.error('No active interview session found');
      navigate('/');
    }
    
    // Clean up session storage when component unmounts or tab is closed
    return () => {
      // We don't clear here to maintain the session across page refreshes
      // It will be cleared when the tab is closed
    };
  }, [location, navigate]);
  
  // Log the session ID when it's available
  useEffect(() => {
    if (sessionId) {
      console.log('Active Interview Session ID:', sessionId);
    }
  }, [sessionId]);

  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [answer, setAnswer] = useState('');
  const [stream, setStream] = useState(null);
  
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      // Handle the answer submission here
      console.log('Submitted answer:', answer);
      // You can add your logic to process the answer
      
      // Clear the input after submission
      setAnswer('');
    }
  };
  const [transcript, setTranscript] = useState("");
  const transcriptionRef = useRef(null);
  const videoRef = useRef(null);
  const videoPreviewRef = useRef(null);
  
  // Animation variants
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
  
  const fadeInUp = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  useEffect(() => {
    // Clean up function to stop all media tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleTranscriptionUpdate = (interimTranscript) => {
    // Update the transcript with the latest interim results
    setTranscript(prev => {
      const finalPart = prev.split('|')[0];
      return `${finalPart}|${interimTranscript}`;
    });
  };

  const handleTranscriptionComplete = (finalTranscript) => {
    // Update the final transcript
    setTranscript(prev => {
      const currentFinal = prev.split('|')[0];
      return `${currentFinal} ${finalTranscript}`.trim() + ' |';
    });
  };

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: isAudioOn
      });
      
      setStream(mediaStream);
      
      // Display the camera feed
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Start recording
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      
      // mediaRecorder.onstop = () => {
      //   const blob = new Blob(recordedChunks, { type: 'video/webm' });
      //   const url = URL.createObjectURL(blob);
        
      //   // Show preview of the recorded video
      //   if (videoPreviewRef.current) {
      //     videoPreviewRef.current.src = url;
      //     videoPreviewRef.current.controls = true;
      //   }
        
      //   // Create download link
      //   const a = document.createElement('a');
      //   a.href = url;
      //   a.download = `interview-${new Date().toISOString()}.webm`;
      //   document.body.appendChild(a);
      //   a.click();
      //   document.body.removeChild(a);
        
      //   // Clean up
      //   if (stream) {
      //     stream.getTracks().forEach(track => track.stop());
      //     setStream(null);
      //   }
      // };
      
      // Start live transcription
      setTranscript('');
      transcriptionRef.current = startLiveTranscription(
        60000, // 1 minute timeout (will auto-renew)
        handleTranscriptionUpdate,
        (final) => {
          handleTranscriptionComplete(final);
          // Restart transcription if still recording
          if (isRecording) {
            transcriptionRef.current = startLiveTranscription(
              60000,
              handleTranscriptionUpdate,
              handleTranscriptionComplete,
              console.error
            );
          }
        },
        console.error
      );
      
      mediaRecorder.start(100); // Collect 100ms of data
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check your permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      // Stop any ongoing transcription
      if (transcriptionRef.current && transcriptionRef.current.stop) {
        transcriptionRef.current.stop();
      }
      setIsRecording(false);
      setIsVideoOn(false);
      setIsAudioOn(false);
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      toast.success("Interview has been completed, Analyzing your responses and it is available in your dashboard");
      navigate('/dashboard');
    } else {
      startRecording();
      toast.success("Interview Begins");
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      sx={{
        p: { xs: 1, md: 3 },
        height: "100vh",
        background: "linear-gradient(135deg, #0a0f1a 0%, #1a1a2e 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "60vh",
          height: "60vh",
          background:
            "radial-gradient(circle at center, rgba(0, 180, 165, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "10%",
          width: "50vh",
          height: "50vh",
          background:
            "radial-gradient(circle at center, rgba(0, 172, 193, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 0,
        },
      }}
    >
      <Box 
        component={motion.div}
        variants={containerVariants}
        sx={{ position: "relative", zIndex: 1, height: "100%" }}
      >
        <motion.div variants={fadeInUp}>
          <Typography
            variant="h4"
            sx={{
              mt: 5,
              mb: 1,
              pt: 2,
              fontWeight: 700,
              background: "linear-gradient(90deg, #00bfa5 0%, #00acc1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            AI Interview Session
          </Typography>
        </motion.div>

        <Stack justifyContent="center" alignItems="center">
          <Grid container spacing={3} sx={{ minHeight: "calc(100vh - 160px)" }}>
            {/* Left column */}

            {/* fix this */}
            <Grid
              item
              xs={12}
              md={7}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              {/* AI Assistant */}
              <GlassCard 
                component={motion.div}
                variants={itemVariants}
                sx={{ mb: 3, width: "fit-content", flex: "0 0 auto" }}
              >
                <CardContent>
                  <Box sx={{ width: 500 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: "#00bfa5",
                          borderRadius: "50%",
                          mr: 1,
                          animation: "pulse 2s infinite",
                        }}
                      />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "#00bfa5" }}
                      >
                        AI Assistant
                      </Typography>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 1 }}
                    >
                      {isRecording ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                            width: "fit-content",
                            margin: "0 auto",
                            padding: "8px",
                            borderRadius: "50%",
                            animation: "glow 2s infinite alternate",
                          }}
                        >
                          <style>
                            {`
                          @keyframes glow {
                            from {
                              box-shadow: 0 0 5px 2px rgba(0, 191, 165, 0.5);
                            }
                            to {
                              box-shadow: 0 0 20px 8px rgba(0, 191, 165, 0.8);
                            }
                          }
                        `}
                          </style>
                          <img
                            src={ai}
                            alt="AI Listening"
                            width={40}
                            style={{
                              borderRadius: "50%",
                              transition: "all 0.3s ease",
                              position: "relative",
                              zIndex: 1,
                            }}
                          />
                        </div>
                      ) : (
                        "Click the start button to begin your interview. I'll ask you a series of questions."
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </GlassCard>

              {/* Video Feed */}
              <GlassCard 
                component={motion.div}
                variants={itemVariants}
                sx={{
                  mb: 3,
                  height: 280, 
                  overflow: "hidden",
                  display: "flex", 
                  flexDirection: "column" 
                }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {isVideoOn ? (
                    <Box
                      component="video"
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid rgba(0, 180, 165, 0.5)",
                        objectFit: 'cover',
                        transform: 'scaleX(-1)' // Mirror the video
                      }}
                    >
                      {!stream && (
                        <VideocamIcon
                          sx={{ fontSize: 60, color: "rgba(255, 255, 255, 0.2)", position: 'absolute' }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: "rgba(0, 0, 0, 0.3)",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <VideocamOffIcon
                        sx={{ fontSize: 60, color: "rgba(255, 255, 255, 0.1)" }}
                      />
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: "flex",
                      gap: 2,
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      p: 1,
                      borderRadius: 4,
                      backdropFilter: "blur(8px)",
                      zIndex: 2,
                    }}
                  >
                    <IconButton
                      onClick={toggleVideo}
                      sx={{
                        bgcolor: isVideoOn
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 0, 0, 0.2)",
                        "&:hover": {
                          bgcolor: isVideoOn
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(255, 0, 0, 0.3)",
                        },
                      }}
                    >
                      {isVideoOn ? (
                        <VideocamIcon sx={{ color: "#fff" }} />
                      ) : (
                        <VideocamOffIcon sx={{ color: "#ff6b6b" }} />
                      )}
                    </IconButton>
                    <IconButton
                      onClick={toggleAudio}
                      sx={{
                        bgcolor: isAudioOn
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 0, 0, 0.2)",
                        "&:hover": {
                          bgcolor: isAudioOn
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(255, 0, 0, 0.3)",
                        },
                      }}
                    >
                      {isAudioOn ? (
                        <MicIcon sx={{ color: "#fff" }} />
                      ) : (
                        <MicOffIcon sx={{ color: "#ff6b6b" }} />
                      )}
                    </IconButton>
                  </Box>
                </CardContent>
              </GlassCard>

              {/* Action Buttons */}
              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  mt: "auto",
                }}
              >
                {!isRecording ? (
                  <PrimaryButton
                    onClick={toggleRecording}
                    startIcon={
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          animation: isRecording
                            ? "pulse 1.5s infinite"
                            : "none",
                        }}
                      />
                    }
                  >
                    Start Interview
                  </PrimaryButton>
                ) : (
                  <>
                    <PrimaryButton
                      onClick={toggleRecording}
                      sx={{
                        background:
                          "linear-gradient(45deg, #ff5252 30%, #ff1744 90%)",
                        "&:hover": {
                          boxShadow: "0 6px 12px rgba(255, 82, 82, 0.3)",
                        },
                      }}
                    >
                      End Interview
                    </PrimaryButton>
                  </>
                )}
              </Box>
            </Grid>

            {/* Right column - Transcript */}
            <Grid 
              component={motion.div}
              variants={itemVariants}
              item 
              xs={12} 
              md={5}
            >
              <GlassCard
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 200px)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: 500, // fix width if needed
                    height: 500, // fixed height for the entire card
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      flex: 1,
                      p: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#00bfa5" }}
                      >
                        Interview Transcript
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        overflowY: "auto",
                        p: 2,
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "3px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "3px",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.2)",
                          },
                        },
                      }}
                    >
                      {isRecording ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            animation: "fadeIn 0.3s ease-in-out",
                          }}
                        >
                          <Box sx={{ width: '100%' }}>
                          {/* AI Message */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mb: 2
                          }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                bgcolor: "#00bfa5",
                                borderRadius: "50%",
                                mr: 1.5,
                                flexShrink: 0,
                                animation: "pulse 2s infinite",
                              }}
                            />
                            <Box sx={{
                              bgcolor: 'rgba(0, 0, 0, 0.1)',
                              p: 2,
                              borderRadius: '16px 16px 16px 4px',
                              maxWidth: '80%'
                            }}>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                AI: What are your greatest strengths?
                              </Typography>
                            </Box>
                            </Box>
                            
                            {/* User Message */}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'flex-end',
                              mb: 2
                            }}>
                              <Box sx={{
                                bgcolor: 'rgba(0, 191, 165, 0.2)',
                                p: 2,
                                borderRadius: '16px 16px 4px 16px',
                                maxWidth: '80%',
                                border: '1px solid rgba(0, 191, 165, 0.3)'
                              }}>
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {transcript.replace(/\|.*$/, '')}
                                  {transcript.includes('|') && (
                                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                      {transcript.split('|')[1]}
                                    </span>
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          {/* Answer Input */}
                          <Box component="form" onSubmit={handleAnswerSubmit} sx={{ mt: 2, p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <TextField
                              fullWidth
                              variant="outlined"
                              placeholder="Type your answer here..."
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton 
                                      type="submit" 
                                      color="primary"
                                      disabled={!answer.trim()}
                                      sx={{ color: '#00bfa5' }}
                                    >
                                      <SendIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                sx: {
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  borderRadius: 2,
                                  '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(0, 191, 165, 0.5)',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#00bfa5',
                                  },
                                  color: '#fff',
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 4,
                            color: "rgba(255, 255, 255, 0.4)",
                            fontStyle: "italic",
                          }}
                        >
                          Your interview transcript will appear here...
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        </Stack>
      </Box>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

export default AIInterview;