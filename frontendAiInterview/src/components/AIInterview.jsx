import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startLiveTranscription } from "./SpeechTranscrib";
import { useLocation } from "react-router-dom";
import axios from "axios";
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
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // State for session and interview details
  const [sessionId, setSessionId] = useState('');
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
  
  // Log the session ID when it's available and fetch interview data
  useEffect(() => {
    const sessionId = sessionStorage.getItem('interviewSessionId');
  
    if (!sessionId) {
      console.error('No session ID found in sessionStorage');
      setError('Missing session ID');
      return;
    }
  
    console.log('Active Interview Session ID:', sessionId);
  
    const fetchInterviewData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(`/api/v1/ai/aiStart`, {
          answer: "Let's start the interview",
          sessionId: sessionId
        });
  
        console.log('AI Response:', response.data);
        setMessages(prev => [...prev, {text: response.data.data, sender: 'ai'}]);
      } catch (e) {
        console.error('API Error:', e);
        setError('Failed to load interview data');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchInterviewData();
  }, []);
  

  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [answer, setAnswer] = useState('');
  const [stream, setStream] = useState(null);
  
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    console.log('Answer:', answer);
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
  
  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
      const sessionId = sessionStorage.getItem('interviewSessionId');
      if (!sessionId) {
        toast.error(
          "No session ID found, so analysis can’t proceed. Sorry for the inconvenience."
        );
        return;
      }
    
      const toastId = toast.loading(
        <div>
          <div>Analyzing your responses...</div>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            marginTop: '8px',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '0%',
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease-in-out'
            }} id="progress-bar"></div>
          </div>
        </div>,
        {
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
          draggable: false,
          isLoading: true,
          style: {
            minWidth: '300px',
            padding: '16px'
          }
        }
      );
    
      try {
        // Simulate progress (remove this in production)
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            if (progress > 90) clearInterval(interval);
            progressBar.style.width = `${progress}%`;
          }, 200);
        }
        
        await axios.post('/api/v1/ai/aiAnalysis', { sessionId });
        
        // Complete the progress bar
        if (progressBar) progressBar.style.width = '100%';
        
        toast.update(toastId, {
          render: 'Analysis complete! Redirecting to dashboard...',
          type: 'success',
          isLoading: false,
          autoClose: 1500,
          closeButton: true,
          closeOnClick: true,
          draggable: true
        });
        
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        console.error(err);
        toast.error(
          "Something went wrong while submitting for analysis. Please try again."
        );
        // You might decide whether to still navigate or not. Probably not, until it succeeds.
      }
    } else {
      startRecording();
      toast.success("Interview begins.");
    }    
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!inputMessage.trim()) return;
    
    setMessages(prev => [...prev, {text: inputMessage, sender: 'user'}]);
    setInputMessage('');
    const userText  = inputMessage.trim();
    setInputMessage('')
    setIsLoading(true)
    try {
      const response = await axios.post(`/api/v1/ai/aiStart`, {
        answer: userText,
        sessionId: sessionId
      });

      if(!response.data.success){
        throw new Error(response.data.data);
      }

      setMessages(prev => [...prev, {text: response.data.data, sender: 'ai'}]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          text: 'Something went wrong. Please try again later.',
          sender: 'ai',
        }])
    } finally {
      setIsLoading(false);
    }
    
  }

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
              fontWeight: 500,
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
                  height: "75vh",
                  display: "flex",
                  flexDirection: "column",

                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: 500, // fix width if needed
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    flex: 1,
                  }}
                >
                  <CardContent
                    sx={{
                      flex: 1,
                      p: 0,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                      background: 'transparent',
                      height: '100%',
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                        borderTopLeftRadius: '16px',
                        borderTopRightRadius: '16px',
                        background: 'transparent',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 500, color: "#fff" }}
                      >
                        Interview Transcript
                      </Typography>
                    </Box>
                    {/* Messages Area */}
                    <Box
                      ref={messagesContainerRef}
                      sx={{
                        flex: 1,
                        overflowY: "auto",
                        p: 3,
                        minHeight: 0,
                        background: 'rgba(10, 15, 26, 0.3)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(0, 191, 165, 0.4)',
                          borderRadius: '3px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(0, 191, 165, 0.7)',
                            width: '8px',
                          },
                        },
                        // Smooth scrolling for Firefox
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(0, 191, 165, 0.4) rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      {isRecording ? (
                        messages.length > 0 ? (
                          messages.map((msg, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ 
                                opacity: 1, 
                                y: 0, 
                                scale: 1,
                                transition: {
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 25
                                }
                              }}
                              style={{
                                alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                                maxWidth: '85%',
                                position: 'relative',
                              }}
                            >
                              <Box
                                sx={{
                                  p: 2.5,
                                  borderRadius: '18px',
                                  color: '#fff',
                                  position: 'relative',
                                  backdropFilter: 'blur(8px)',
                                  boxShadow: msg.sender === 'ai' 
                                    ? '0 4px 20px rgba(0, 0, 0, 0.1)'
                                    : '0 4px 25px rgba(0, 191, 165, 0.15)',
                                  background: msg.sender === 'ai' 
                                    ? 'rgba(255, 255, 255, 0.08)' 
                                    : 'linear-gradient(135deg, rgba(0, 191, 165, 0.15) 0%, rgba(0, 172, 193, 0.15) 100%)',
                                  border: msg.sender === 'ai'
                                    ? '1px solid rgba(255, 255, 255, 0.12)'
                                    : '1px solid rgba(0, 191, 165, 0.25)',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '16px',
                                    left: msg.sender === 'ai' ? '-6px' : 'auto',
                                    right: msg.sender === 'ai' ? 'auto' : '-6px',
                                    width: '14px',
                                    height: '14px',
                                    background: msg.sender === 'ai' 
                                      ? 'rgba(255, 255, 255, 0.08)' 
                                      : 'rgba(0, 191, 165, 0.15)',
                                    transform: 'rotate(45deg)',
                                    borderLeft: msg.sender === 'ai' 
                                      ? '1px solid rgba(255, 255, 255, 0.12)' 
                                      : '1px solid rgba(0, 191, 165, 0.25)',
                                    borderBottom: msg.sender === 'ai' 
                                      ? '1px solid rgba(255, 255, 255, 0.12)' 
                                      : '1px solid rgba(0, 191, 165, 0.25)',
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    zIndex: -1,
                                  },
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  sx={{
                                    fontSize: '0.95rem',
                                    lineHeight: 1.6,
                                    letterSpacing: '0.01em',
                                    color: msg.sender === 'ai' ? 'rgba(255, 255, 255, 0.92)' : '#fff',
                                    fontWeight: msg.sender === 'ai' ? 400 : 450,
                                    textShadow: msg.sender === 'ai' 
                                      ? 'none' 
                                      : '0 1px 2px rgba(0, 0, 0, 0.1)',
                                  }}
                                >
                                  {msg.text}
                                </Typography>
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <Typography 
                                    variant="caption" 
                                    sx={{
                                      display: 'block',
                                      textAlign: 'right',
                                      mt: 1,
                                      color: msg.sender === 'ai' 
                                        ? 'rgba(255, 255, 255, 0.45)' 
                                        : 'rgba(255, 255, 255, 0.65)',
                                      fontSize: '0.68rem',
                                      letterSpacing: '0.03em',
                                      textTransform: 'uppercase',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {msg.sender === 'ai' ? 'AI Assistant' : 'You'}
                                  </Typography>
                                </motion.div>
                              </Box>
                            </motion.div>
                          ))
                        ) : (
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              height: '100%',
                              color: 'rgba(255, 255, 255, 0.6)',
                              textAlign: 'center',
                              p: 4,
                            }}
                          >
                            <VideocamIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                              Interview in Progress
                            </Typography>
                            <Typography variant="body2">
                              Your conversation will appear here. Start speaking when you're ready.
                            </Typography>
                          </Box>
                        )
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'rgba(255, 255, 255, 0.6)',
                            textAlign: 'center',
                            p: 4,
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '12px',
                            border: '1px dashed rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <MicIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                            Ready to Start
                          </Typography>
                          <Typography variant="body2">
                            Click the "Start Interview" button to begin your session.
                            Your transcript will appear here once you start speaking.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    {/* Input Area - always at the bottom */}
                    {isRecording && (
                      <Box 
                      component="form"
                      onSubmit={handleSubmit}
                        sx={{ 
                          display: 'flex', 
                          gap: 2,
                          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                          p: 2,
                          background: 'transparent',
                          borderBottomLeftRadius: '16px',
                          borderBottomRightRadius: '16px',
                          minWidth: 0,
                          flexShrink: 0,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          placeholder="Type your message..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          sx={{
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            flex: '1 1 0%',
                            minWidth: 0,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#00bfa5',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: 'white',
                              '&::placeholder': {
                                color: 'rgba(255, 255, 255, 0.5)',
                              },
                            },
                          }}
                        />
                        <Button 
                          type="submit" 
                          variant="contained"
                          disabled={!inputMessage.trim()}
                          sx={{
                            borderRadius: '8px',
                            bgcolor: '#00bfa5',
                            color: 'white',
                            minWidth: '80px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            '&:hover': {
                              bgcolor: '#00a38a',
                            },
                            '&:disabled': {
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.3)',
                            },
                          }}
                        >
                          Send
                        </Button>
                      </Box>
                    )}
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