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
  Chip,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from '@mui/icons-material/Send';
import ai from "../assets/ai.jpeg";
import {useNavigate} from "react-router";
import {toast} from "react-toastify";
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
  
  // Core states
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Media states
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [stream, setStream] = useState(null);
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  
  // Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const initialMessageSent = useRef(false);
  
  // Initialize session and interview details when component mounts
  useEffect(() => {
    // Get from location state (passed during navigation)
    const stateData = location.state || {};
    const stateSessionId = stateData.sessionId;
    
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
    
    // Clean up when component unmounts
    return () => {
      stopAllMedia();
    };
  }, [location, navigate]);
  
  // Auto-scroll messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  // Function to play audio from URL
  const playAudio = (audioUrl) => {
    if (!audioUrl) return;
    
    // Pause and reset current audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Create new audio instance and play
    audioRef.current = new Audio(audioUrl);
    audioRef.current.play().catch(e => console.error('Error playing audio:', e));
  };

  // Stop all media streams and recognition
  const stopAllMedia = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsListening(false);
    setIsVideoOn(false);
    setIsAudioOn(false);
  };

  // Start camera and microphone
  const startMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      setIsVideoOn(true);
      setIsAudioOn(true);
      
      // Display the camera feed
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera/microphone. Please check your permissions.');
      return false;
    }
  };

  // Start speech recognition
  const startSpeechRecognition = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech recognition started');
    };
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalText += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update interim transcript for display
      setTranscript(interimTranscript);
      
      // If we have final text, add it to the input message
      if (finalText.trim()) {
        console.log('Final transcript:', finalText);
        setFinalTranscript(prev => {
          const newFinal = prev + ' ' + finalText.trim();
          return newFinal.trim();
        });
        
        // Add to input message
        setInputMessage(prev => {
          const newMessage = (prev + ' ' + finalText.trim()).trim();
          console.log('Updated input message:', newMessage);
          return newMessage;
        });
        
        setTranscript(''); // Clear interim transcript after adding to final
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Don't restart on certain errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        toast.error('Microphone not detecting speech. Please check your microphone.');
      }
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // Auto-restart if interview is still active and no error occurred
      if (isInterviewActive) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        }, 500);
      }
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Could not start speech recognition. Please try again.');
    }
  };

  // Stop speech recognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setTranscript('');
  };
  
  // Toggle video on/off
  const toggleVideo = async () => {
    if (isVideoOn) {
      // Turn off video
      if (stream) {
        stream.getVideoTracks().forEach(track => track.stop());
      }
      setIsVideoOn(false);
    } else {
      // Turn on video
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isAudioOn
        });
        setStream(prevStream => {
          if (prevStream) {
            prevStream.getTracks().forEach(track => track.stop());
          }
          return mediaStream;
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsVideoOn(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast.error('Could not access camera. Please check your permissions.');
      }
    }
  };
  // Toggle audio on/off
  const toggleAudio = async () => {
    if (isAudioOn) {
      // Turn off audio
      if (stream) {
        stream.getAudioTracks().forEach(track => track.stop());
      }
      // Also stop speech recognition
      stopSpeechRecognition();
      setIsAudioOn(false);
    } else {
      // Turn on audio
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideoOn
        });
        setStream(prevStream => {
          if (prevStream) {
            prevStream.getTracks().forEach(track => track.stop());
          }
          return mediaStream;
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setIsAudioOn(true);
        
        // Start speech recognition if interview is active
        if (isInterviewActive) {
          startSpeechRecognition();
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast.error('Could not access microphone. Please check your permissions.');
      }
    }
  };

  // Start the interview
  const startInterview = async () => {
    // Start media first
    const mediaStarted = await startMedia();
    if (!mediaStarted) return;

    // Start the interview session
    if (!initialMessageSent.current) {
      initialMessageSent.current = true;
      setIsLoading(true);
      
      try {
        const response = await axios.post(`/api/v1/ai/aiStart`, {
          answer: "Let's start the interview",
          sessionId: sessionId
        });
        
        setMessages(prev => [...prev, {text: response.data.data.result, sender: 'ai'}]);
        
        if (response.data.data.audioUrl) {
          playAudio(response.data.data.audioUrl);
        }
        
        setIsInterviewActive(true);
        
        // Start speech recognition after a short delay
        setTimeout(() => {
          startSpeechRecognition();
        }, 1000);
        
        toast.success("Interview started! You can now speak or type your responses.");
        
      } catch (error) {
        console.error('Error starting interview:', error);
        toast.error("Failed to start interview.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // End the interview
  const endInterview = async () => {
    setIsInterviewActive(false);
    stopAllMedia();
    
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
      // Simulate progress
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
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.update(toastId, {
        render: 'Something went wrong while analyzing. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
        closeOnClick: true,
        draggable: true
      });
    }
  };
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

  // Handle form submission (send message)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userText = inputMessage.trim();
    if (!userText) return;
    
    setMessages(prev => [...prev, {text: userText, sender: 'user'}]);
    setInputMessage('');
    setFinalTranscript(''); // Clear speech transcript
    setTranscript(''); // Clear interim transcript
    setIsLoading(true);
    
    try {
      const response = await axios.post(`/api/v1/ai/aiStart`, {
        answer: userText,
        sessionId: sessionId
      });
      
      if (!response.data.success) {
        throw new Error(response.data.data);
      }
      
      const aiResponse = response.data.data.result;
      setMessages(prev => [...prev, {text: aiResponse, sender: 'ai'}]);
      
      // Play audio if available
      if (response.data.data.audioUrl) {
        playAudio(response.data.data.audioUrl);
      }
      
      // Check if interview is ending
      if (aiResponse.includes("Your interview is over")) {
        setTimeout(endInterview, 6000);
      }
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessages(prev => [
        ...prev,
        {
          text: 'Something went wrong. Please try again later.',
          sender: 'ai',
        }
      ]);
    } finally {
      setIsLoading(false);
    }
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
            {/* Left column - Video and Controls */}
            <Grid
              item
              xs={12}
              md={7}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              {/* AI Assistant Status */}
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
                          bgcolor: isInterviewActive ? "#00bfa5" : "rgba(255, 255, 255, 0.3)",
                          borderRadius: "50%",
                          mr: 1,
                          animation: isInterviewActive ? "pulse 2s infinite" : "none",
                        }}
                      />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: isInterviewActive ? "#00bfa5" : "rgba(255, 255, 255, 0.7)" }}
                      >
                        AI Assistant
                      </Typography>
                      {isInterviewActive && (
                        <Chip 
                          label="LIVE" 
                          size="small" 
                          sx={{ 
                            ml: 2, 
                            bgcolor: "#00bfa5", 
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.7rem"
                          }} 
                        />
                      )}
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 1 }}
                    >
                      {isInterviewActive ? (
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
                        "Ready to start your interview. Click the start button to begin."
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
                    />
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

                  {/* Media Control Buttons */}
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
                      disabled={!isInterviewActive}
                      sx={{
                        bgcolor: isVideoOn
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 0, 0, 0.2)",
                        "&:hover": {
                          bgcolor: isVideoOn
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(255, 0, 0, 0.3)",
                        },
                        "&:disabled": {
                          bgcolor: "rgba(255, 255, 255, 0.05)",
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
                      disabled={!isInterviewActive}
                      sx={{
                        bgcolor: isAudioOn
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 0, 0, 0.2)",
                        "&:hover": {
                          bgcolor: isAudioOn
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(255, 0, 0, 0.3)",
                        },
                        "&:disabled": {
                          bgcolor: "rgba(255, 255, 255, 0.05)",
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

                  {/* Speech Recognition Status */}
                  {isListening && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: "rgba(0, 191, 165, 0.8)",
                        p: 1,
                        borderRadius: 2,
                        zIndex: 2,
                      }}
                    >
                      <MicIcon sx={{ fontSize: 16, color: "white" }} />
                      <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
                        Listening...
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </GlassCard>

              {/* Speech Recognition Display */}
              {isInterviewActive && (
                <GlassCard 
                  component={motion.div}
                  variants={itemVariants}
                  sx={{ mb: 3 }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: "#00bfa5" }}>
                        Speech Recognition:
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          if (isListening) {
                            stopSpeechRecognition();
                          } else {
                            startSpeechRecognition();
                          }
                        }}
                        sx={{
                          borderColor: '#00bfa5',
                          color: '#00bfa5',
                          fontSize: '0.75rem',
                          minWidth: '80px',
                          '&:hover': {
                            borderColor: '#00a38a',
                            backgroundColor: 'rgba(0, 191, 165, 0.1)',
                          }
                        }}
                      >
                        {isListening ? 'Stop' : 'Start'} Mic
                      </Button>
                    </Box>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)", minHeight: '20px' }}>
                      {finalTranscript && (
                        <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                          {finalTranscript}
                        </span>
                      )}
                      {transcript && (
                        <span style={{ 
                          color: "rgba(0, 191, 165, 0.8)", 
                          fontStyle: "italic",
                          marginLeft: finalTranscript ? " " : "" 
                        }}>
                          {transcript}
                        </span>
                      )}
                      {isListening && !transcript && !finalTranscript && (
                        <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                          Listening for speech... Try saying something!
                        </span>
                      )}
                      {!isListening && !transcript && !finalTranscript && (
                        <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>
                          Click "Start Mic" to begin speech recognition
                        </span>
                      )}
                    </Typography>
                  </CardContent>
                </GlassCard>
              )}

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
                {!isInterviewActive ? (
                  <PrimaryButton
                    onClick={startInterview}
                    disabled={isLoading}
                    startIcon={<PlayArrowIcon />}
                  >
                    {isLoading ? "Starting..." : "Start Interview"}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    onClick={endInterview}
                    startIcon={<StopIcon />}
                    sx={{
                      background: "linear-gradient(45deg, #ff5252 30%, #ff1744 90%)",
                      "&:hover": {
                        boxShadow: "0 6px 12px rgba(255, 82, 82, 0.3)",
                      },
                    }}
                  >
                    End Interview
                  </PrimaryButton>
                )}
              </Box>
            </Grid>

            {/* Right column - Chat Interface */}
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
                    width: 500,
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
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 500, color: "#fff" }}
                        >
                          Interview Chat
                        </Typography>
                        {isInterviewActive && (
                          <Chip 
                            icon={<MicIcon sx={{ fontSize: 16 }} />}
                            label={isListening ? "Listening..." : "Speech Ready"}
                            size="small"
                            sx={{ 
                              bgcolor: isListening ? "#00bfa5" : "rgba(255, 255, 255, 0.1)",
                              color: "white"
                            }}
                          />
                        )}
                      </Stack>
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
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(0, 191, 165, 0.4) rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      {isInterviewActive || messages.length > 0 ? (
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
                            <MicIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                              Interview Active
                            </Typography>
                            <Typography variant="body2">
                              Your conversation will appear here. Start speaking or typing to interact.
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
                          <PlayArrowIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                            Ready to Start
                          </Typography>
                          <Typography variant="body2">
                            Click "Start Interview" to begin your session.
                            Your conversation will appear here once you start.
                          </Typography>
                        </Box>
                      )}

                      {/* Loading indicator */}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            alignSelf: 'flex-start',
                            maxWidth: '85%',
                          }}
                        >
                          <Box
                            sx={{
                              p: 2.5,
                              borderRadius: '18px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#00bfa5',
                                animation: 'pulse 1.5s infinite',
                              }}
                            />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              AI is thinking...
                            </Typography>
                          </Box>
                        </motion.div>
                      )}
                    </Box>

                    {/* Input Area */}
                    {isInterviewActive && (
                      <Box sx={{
                        width: '100%',
                        mt: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}>
                        <Box 
                          component="form"
                          onSubmit={handleSubmit}
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 2,
                            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                            p: 1.5,
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
                            placeholder={isAudioOn ? "Speak or type your response..." : "Type your response..."}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            disabled={isLoading}
                            multiline
                            maxRows={3}
                            sx={{
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.05)',
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
                            InputProps={{
                              endAdornment: inputMessage && (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setInputMessage('');
                                      setFinalTranscript('');
                                      setTranscript('');
                                    }}
                                    sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                  >
                                    ✕
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                          <Button 
                            type="submit" 
                            variant="contained"
                            disabled={!inputMessage.trim() || isLoading}
                            sx={{
                              borderRadius: '8px',
                              bgcolor: '#00bfa5',
                              color: 'white',
                              minWidth: '80px',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              height: '40px',
                              '&:hover': {
                                bgcolor: '#00a38a',
                              },
                              '&:disabled': {
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.3)',
                              },
                            }}
                          >
                            <SendIcon />
                          </Button>
                        </Box>
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