import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { 
  Send as SendIcon, 
  Mic as MicIcon, 
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  AutoAwesome as AIIcon,
  Person as UserIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AIInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Session and API states
  const [sessionId, setSessionId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(10); // Assuming 10 questions total
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Media stream and speech recognition states
  const [stream, setStream] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const initialMessageSent = useRef(false);
  const audioToggleRef = useRef(false);

  // Handle tab visibility and window close events for interview security
  useEffect(() => {
    let isHandlingVisibilityChange = false;
    
    const handleVisibilityChange = () => {
      // Prevent multiple rapid calls
      if (isHandlingVisibilityChange) return;
      
      if (document.hidden && isInterviewActive) {
        isHandlingVisibilityChange = true;
        
        // Tab switched or minimized during interview
        setTabSwitchCount(prevCount => {
          const newCount = prevCount + 1;
          
          if (newCount >= 3) {
            // Third strike - end interview
            setIsInterviewActive(false);
            stopAllMedia();
            
            // Start analysis in background without waiting
            axios.post('/api/v1/ai/aiAnalysis', { sessionId }).catch(error => {
              console.error('Error in background analysis:', error);
            });
            
            toast.error('Interview ended! You switched tabs 3 times. You can check interview analysis in the dashboard after some time', {
              autoClose: 5000,
              closeButton: true,
              closeOnClick: true,
              draggable: true
            });
            
            // Redirect to home page
            setTimeout(() => navigate('/'), 1500);
          } else {
            // First or second warning
            const remainingChances = 3 - newCount;
            toast.warning(`Warning ${newCount}/3: Tab switching detected! You have ${remainingChances} chance${remainingChances > 1 ? 's' : ''} left before the interview ends.`, {
              autoClose: 4000,
              closeButton: true,
              closeOnClick: true,
              draggable: true
            });
          }
          
          return newCount;
        });
        
        // Reset the flag after a short delay
        setTimeout(() => {
          isHandlingVisibilityChange = false;
        }, 500);
      }
    };

    const handleBeforeUnload = (e) => {
      if (isInterviewActive) {
        // Tab/window closing during interview
        axios.post('/api/v1/ai/aiAnalysis', { sessionId }).catch(error => {
          console.error('Error in background analysis:', error);
        });
        
        // Browser will show confirmation dialog
        e.preventDefault();
        e.returnValue = 'Your interview is in progress. Are you sure you want to leave?';
        return 'Your interview is in progress. Are you sure you want to leave?';
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isInterviewActive, sessionId, navigate]);

  // Initialize session when component mounts
  useEffect(() => {
    const stateData = location.state || {};
    const stateSessionId = stateData.sessionId;
    const storedSessionId = sessionStorage.getItem('interviewSessionId');
    const activeSessionId = stateSessionId || storedSessionId;
    
    if (activeSessionId) {
      setSessionId(activeSessionId);
      sessionStorage.setItem('interviewSessionId', activeSessionId);
    } else {
      toast.error('No active interview session found');
      navigate('/');
    }
    
    return () => {
      stopAllMedia();
    };
  }, [location, navigate]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Manage video feed
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement && stream) {
      videoElement.srcObject = stream;
      
      const handleCanPlay = () => {
        videoElement.play().catch(e => {
          console.error("Video play failed:", e);
          toast.error("Could not play video. Please check browser permissions.");
        });
      };
      
      videoElement.addEventListener('canplay', handleCanPlay);
      
      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
      };
    } else if (videoElement) {
      videoElement.srcObject = null;
    }
  }, [stream]);

  // Function to play audio from URL
  const playAudio = (audioUrl) => {
    if (!audioUrl) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    audioRef.current = new Audio(audioUrl);
    
    audioRef.current.onplay = () => setIsAudioPlaying(true);
    audioRef.current.onended = () => setIsAudioPlaying(false);
    audioRef.current.onpause = () => setIsAudioPlaying(false);
    audioRef.current.onerror = () => setIsAudioPlaying(false);
    
    audioRef.current.play().catch(e => {
      console.error('Error playing audio:', e);
      setIsAudioPlaying(false);
    });
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
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsAudioPlaying(false);
  };

  // Start camera and microphone
  const startMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      setIsCameraOn(true);
      setIsMicOn(true);
      
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

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping existing recognition:', error);
      }
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
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
      
      setTranscript(interimTranscript);
      
      if (finalText.trim()) {
        setFinalTranscript(prev => {
          const newFinal = prev + ' ' + finalText.trim();
          return newFinal.trim();
        });
        
        setInputValue(prev => {
          const newMessage = (prev + ' ' + finalText.trim()).trim();
          return newMessage;
        });
        
        setTranscript('');
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        toast.error('Microphone not detecting speech. Please check your microphone.');
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      
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
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        recognitionRef.current = null;
      }
    }
    
    setIsListening(false);
    setTranscript('');
  };

  // Handle camera toggle
  const toggleCamera = async () => {
    if (isCameraOn) {
      if (stream) {
        stream.getVideoTracks().forEach(track => track.stop());
      }
      setIsCameraOn(false);
      if (stream && stream.getAudioTracks().length === 0) {
        setStream(null);
      }
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isMicOn
        });
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setStream(mediaStream);
        setIsCameraOn(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast.error('Could not access camera. Please check your permissions.');
      }
    }
  };

  // Handle microphone toggle
  const toggleMic = async () => {
    if (audioToggleRef.current) return;
    
    audioToggleRef.current = true;
    
    try {
      if (isMicOn) {
        stopSpeechRecognition();
        
        if (stream) {
          stream.getAudioTracks().forEach(track => {
            track.stop();
          });
        }
        
        setIsMicOn(false);
        
        if (stream && stream.getVideoTracks().length === 0) {
          setStream(null);
        }
        
      } else {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isCameraOn
          });
          
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
            });
          }
          
          setStream(mediaStream);
          setIsMicOn(true);
          
          if (isInterviewActive) {
            setTimeout(() => {
              startSpeechRecognition();
            }, 500);
          }
          
        } catch (error) {
          console.error('Error accessing microphone:', error);
          toast.error('Could not access microphone. Please check your permissions.');
          setIsMicOn(false);
        }
      }
    } finally {
      setTimeout(() => {
        audioToggleRef.current = false;
      }, 1000);
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userText = inputValue.trim();
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setFinalTranscript('');
    setTranscript('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/v1/ai/aiStart', {
        answer: userText,
        sessionId: sessionId
      });
      
      if (!response.data.success) {
        throw new Error(response.data.data);
      }
      
      const aiResponse = response.data.data.result;
      const aiMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update question progress when AI responds
      if (aiResponse && !aiResponse.includes("Your interview is over")) {
        setCurrentQuestion(prev => Math.min(prev + 1, totalQuestions));
      }
      
      if (response.data.data.audioUrl) {
        playAudio(response.data.data.audioUrl);
      }
      
      if (aiResponse.includes("Your interview is over")) {
        setTimeout(() => toggleInterview(), 6000);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: 'Something went wrong. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle interview start/stop
  const toggleInterview = async () => {
    if (!isInterviewActive) {
      // Start interview
      const mediaStarted = await startMedia();
      if (!mediaStarted) return;

      if (!initialMessageSent.current) {
        initialMessageSent.current = true;
        setIsLoading(true);
        
        try {
          const response = await axios.post('/api/v1/ai/aiStart', {
            answer: "Let's start the interview",
            sessionId: sessionId
          });
          
          const aiMessage = {
            id: messages.length + 1,
            sender: 'ai',
            text: response.data.data.result,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          if (response.data.data.audioUrl) {
            playAudio(response.data.data.audioUrl);
          }
          
          setIsInterviewActive(true);
          setTabSwitchCount(0); // Reset tab switch count when interview starts
          
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
    } else {
      // End interview
      setIsInterviewActive(false);
      stopAllMedia();
      
      // Start analysis in background without waiting
      axios.post('/api/v1/ai/aiAnalysis', { sessionId }).catch(error => {
        console.error('Error in background analysis:', error);
      });
      
      // Show toast and redirect immediately
      toast.success('You can check interview analysis in the dashboard after some time', {
        autoClose: 3000,
        closeButton: true,
        closeOnClick: true,
        draggable: true
      });
      
      // Redirect to home page immediately
      navigate('/');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Prevent copy/paste in input field for interview security
  const handleInputPaste = (event) => {
    event.preventDefault();
    toast.warning('Copy/paste is disabled during the interview for security reasons.');
  };

  const handleInputCopy = (event) => {
    event.preventDefault();
    toast.warning('Copy/paste is disabled during the interview for security reasons.');
  };

  const handleInputCut = (event) => {
    event.preventDefault();
    toast.warning('Copy/paste is disabled during the interview for security reasons.');
  };

  return (
    <Box 
      sx={{ 
        height: { xs: '100vh', md: '100vh' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, sm: 1.5, md: 2 },
        p: { xs: 1, sm: 1.5, md: 2 },
        backgroundColor: 'var(--dark-bg)',
        fontFamily: 'Inter, sans-serif',
        overflow: { xs: 'auto', md: 'hidden' }
      }}
    >
      {/* Left Side */}
      <Box sx={{ 
        flex: { xs: 'none', md: '0 0 40%' }, 
        width: { xs: '100%', md: 'auto' },
        height: { xs: 'auto', md: '100%' },
        display: 'flex', 
        flexDirection: { xs: 'row', md: 'column' }, 
        gap: { xs: 1, sm: 1.5, md: 2 }
      }}>
        
        {/* AI Assistant Box */}
        <Paper 
          elevation={3}
          sx={{ 
            p: { xs: 1.5, sm: 2, md: 3 },
            backgroundColor: 'var(--darker-bg)',
            border: '1px solid rgba(0, 191, 165, 0.2)',
            borderRadius: 2,
            height: { xs: 'auto', md: '200px' },
            flex: { xs: '1', md: 'none' },
            minHeight: { xs: '120px', sm: '140px', md: '200px' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, md: 2 } }}>
            <Avatar 
              sx={{ 
                bgcolor: 'var(--primary-color)', 
                mr: { xs: 1, md: 2 },
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 },
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              <AIIcon sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />
            </Avatar>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              AI Assistant
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'var(--text-secondary)',
              mb: { xs: 1, md: 2 },
              lineHeight: 1.6,
              fontSize: { xs: '0.8rem', md: '0.875rem' }
            }}
          >
            Status: {isInterviewActive ? 'Interview in Progress' : 'Ready to Start'}
          </Typography>
          
          {/* Progress Bar */}
          <Box sx={{ mb: { xs: 1, md: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'var(--text-primary)',
                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                  fontWeight: 600
                }}
              >
                Question Progress
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'var(--primary-color)',
                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                  fontWeight: 600
                }}
              >
                {currentQuestion}/{totalQuestions}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(currentQuestion / totalQuestions) * 100}
              sx={{
                height: { xs: 6, md: 8 },
                borderRadius: 3,
                backgroundColor: 'rgba(0, 191, 165, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: 3,
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'var(--text-secondary)',
                fontSize: { xs: '0.65rem', md: '0.7rem' },
                mt: 0.5,
                display: 'block'
              }}
            >
              {totalQuestions - currentQuestion} questions remaining
            </Typography>
          </Box>
          
        </Paper>

        {/* Camera View Box */}
        <Paper 
          elevation={3}
          sx={{ 
            flex: { xs: '1', md: '1' },
            backgroundColor: 'var(--darker-bg)',
            border: '1px solid rgba(0, 191, 165, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            minHeight: { xs: '120px', sm: '180px', md: '300px' },
            height: { xs: 'auto', md: 'auto' }
          }}
        >
          <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: '1px solid rgba(0, 191, 165, 0.2)' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Camera View
            </Typography>
          </Box>
          
          <Box sx={{ 
            position: 'relative', 
            height: { xs: 'calc(100% - 50px)', md: 'calc(100% - 60px)' },
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Box sx={{ 
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <VideocamOffIcon sx={{ fontSize: { xs: 32, md: 48 }, mb: 1 }} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  Camera is off
                </Typography>
              </Box>
            )}
            
            <IconButton
              onClick={toggleCamera}
              size={window.innerWidth < 600 ? 'small' : 'medium'}
              sx={{
                position: 'absolute',
                bottom: { xs: 5, md: 10 },
                right: { xs: 5, md: 10 },
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: isCameraOn ? 'var(--primary-color)' : 'var(--text-secondary)',
                border: `1px solid ${isCameraOn ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'}`,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isCameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton
              onClick={toggleMic}
              size={window.innerWidth < 600 ? 'small' : 'medium'}
              sx={{
                position: 'absolute',
                bottom: { xs: 5, md: 10 },
                right: { xs: 55, md: 70 },
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: isMicOn ? 'var(--primary-color)' : 'var(--text-secondary)',
                border: `1px solid ${isListening ? 'var(--primary-color)' : isMicOn ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'}`,
                backdropFilter: 'blur(10px)',
                animation: isListening ? 'micPulse 1.5s ease-in-out infinite' : 'none',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease',
                '@keyframes micPulse': {
                  '0%, 100%': { 
                    boxShadow: '0 0 0 0 rgba(0, 191, 165, 0.4)',
                    transform: 'scale(1)'
                  },
                  '50%': { 
                    boxShadow: '0 0 0 8px rgba(0, 191, 165, 0)',
                    transform: 'scale(1.1)'
                  }
                }
              }}
            >
              {isMicOn ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Right Side - Chat Area */}
      <Box sx={{ 
        flex: { xs: 'none', md: 1 }, 
        width: { xs: '100%', md: 'auto' },
        height: { xs: 'auto', md: '100%' },
        display: 'flex', 
        flexDirection: 'column',
        gap: { xs: 0.5, sm: 1, md: 2 }, // Reduced gap for mobile
        minHeight: { xs: '400px', md: 'auto' } // Increased min height for mobile
      }}>
        
        {/* Chat Box */}
        <Paper 
          elevation={3}
          sx={{ 
            backgroundColor: 'var(--darker-bg)',
            border: '1px solid rgba(0, 191, 165, 0.2)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flex: 1,
            height: { 
              xs: 'calc(100vh - 280px)', // More height for mobile 
              sm: 'calc(100vh - 250px)', // Tablet optimization
              md: 'calc(100vh - 120px)' 
            }
          }}
        >
          {/* Chat Header */}
          <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: '1px solid rgba(0, 191, 165, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              AI Chat
            </Typography>
            
            {/* Voice Animation */}
            {isListening && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.3,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0, 191, 165, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 191, 165, 0.3)'
                }}>
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <Box
                      key={bar}
                      sx={{
                        width: { xs: 3, md: 4 },
                        backgroundColor: 'var(--primary-color)',
                        borderRadius: '2px',
                        transformOrigin: 'bottom',
                        animation: `voiceWave 1.2s ease-in-out infinite`,
                        animationDelay: `${bar * 0.1}s`,
                        height: { xs: '16px', md: '20px' },
                        '@keyframes voiceWave': {
                          '0%, 100%': { 
                            transform: 'scaleY(0.3)',
                            opacity: 0.4
                          },
                          '50%': { 
                            transform: 'scaleY(1)',
                            opacity: 1
                          }
                        }
                      }}
                    />
                  ))}
                  <MicIcon 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      color: 'var(--primary-color)',
                      ml: 0.5,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.6 },
                        '50%': { opacity: 1 }
                      }
                    }} 
                  />
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'var(--primary-color)',
                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                    fontWeight: 600,
                    textShadow: '0 0 8px rgba(0, 191, 165, 0.3)'
                  }}
                >
                  Listening...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Messages Area */}
          <Box 
            sx={{ 
              flex: 1,
              p: { xs: 1, md: 2 },
              overflowY: 'auto',
              height: '100%'
            }}
          >
            {/* Instructions - Show only when interview is not active */}
            {!isInterviewActive && (
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  gap: 3
                }}
              >
                {/* <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'var(--primary-color)',
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                    mb: 2
                  }}
                >
                  Welcome to AI Interview
                </Typography> */}
                
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    backgroundColor: 'rgba(0, 191, 165, 0.05)',
                    border: '1px solid rgba(0, 191, 165, 0.2)',
                    borderRadius: 2,
                    maxWidth: '500px',
                    width: '100%'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      mb: 2,
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    📋 Important Instructions
                  </Typography>
                  
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--text-secondary)',
                        mb: 1,
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1
                      }}
                    >
                      <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span>
                      Tab switching is monitored - after 3 tab switches, your interview will end automatically
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--text-secondary)',
                        mb: 1,
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1
                      }}
                    >
                      <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span>
                      Your interview analysis will be available in the dashboard after completion
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--text-secondary)',
                        mb: 1,
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1
                      }}
                    >
                      <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span>
                      To submit your answer: Click the submit button or press Enter
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--text-secondary)',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1
                      }}
                    >
                      <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span>
                      For new line in your response: Press Shift + Enter
                    </Typography>
                  </Box>
                </Paper>
                
                {/* <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    mt: 1
                  }}
                >
                  Are you ready to begin?
                </Typography> */}
              </Box>
            )}

            {/* Chat Messages - Show only when interview is active */}
            {isInterviewActive && messages.map((message) => (
              <Box 
                key={message.id}
                sx={{ 
                  mb: { xs: 1.5, md: 2 },
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                {message.sender === 'ai' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: 'var(--primary-color)', 
                      width: { xs: 28, md: 32 },
                      height: { xs: 28, md: 32 },
                      fontSize: { xs: '0.8rem', md: '0.9rem' }
                    }}
                  >
                    <AIIcon sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }} />
                  </Avatar>
                )}
                
                <Paper
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    maxWidth: { xs: '85%', sm: '80%', md: '75%' },
                    backgroundColor: message.sender === 'user' 
                      ? 'var(--primary-color)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    color: message.sender === 'user' 
                      ? 'white' 
                      : 'var(--text-primary)',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                    color: message.sender === 'user' ? 'white' : 'inherit'
                  }}>
                    {message.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.7,
                      fontSize: { xs: '0.65rem', md: '0.7rem' },
                      mt: 0.5,
                      display: 'block',
                      color: message.sender === 'user' ? 'white' : 'inherit'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>

                {message.sender === 'user' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: 'var(--primary-color)', 
                      width: { xs: 28, md: 32 },
                      height: { xs: 28, md: 32 },
                      fontSize: { xs: '0.8rem', md: '0.9rem' }
                    }}
                  >
                    <UserIcon sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }} />
                  </Avatar>
                )}
              </Box>
            ))}
            
            {isInterviewActive && isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 1, mb: { xs: 1.5, md: 2 } }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'var(--primary-color)', 
                    width: { xs: 28, md: 32 },
                    height: { xs: 28, md: 32 },
                    fontSize: { xs: '0.8rem', md: '0.9rem' }
                  }}
                >
                  <AIIcon sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }} />
                </Avatar>
                
                <Paper
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CircularProgress size={16} sx={{ color: 'var(--primary-color)' }} />
                  <Typography variant="body2" sx={{ 
                    color: 'var(--text-secondary)',
                    fontSize: { xs: '0.85rem', md: '0.875rem' }
                  }}>
                    AI is typing...
                  </Typography>
                </Paper>
              </Box>
            )}
            
            <div ref={chatEndRef} />
          </Box>

          {/* Input Area - Only show when interview is active */}
          {isInterviewActive ? (
            <Box 
              sx={{ 
                p: { xs: 1, md: 1 },
                borderTop: '1px solid rgba(0, 191, 165, 0.2)',
                display: 'flex',
                gap: { xs: 0.5, md: 1 }
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={window.innerWidth < 600 ? 2 : 3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handleInputPaste}
                onCopy={handleInputCopy}
                onCut={handleInputCut}
                placeholder="Type your message..."
                variant="outlined"
                size={window.innerWidth < 600 ? 'small' : 'medium'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)',
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    '& fieldset': {
                      borderColor: 'rgba(0, 191, 165, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 191, 165, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-color)',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'var(--text-secondary)',
                    opacity: 1,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size={window.innerWidth < 600 ? 'small' : 'medium'}
                sx={{
                  backgroundColor: 'var(--primary-color)',
                  minWidth: { xs: '40px', md: 'auto' },
                  px: { xs: 1, md: 2 },
                  '&:hover': {
                    backgroundColor: 'var(--primary-dark)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0, 191, 165, 0.3)',
                  }
                }}
              >
                <SendIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
              </Button>
            </Box>
          ) : (
            <Box 
              sx={{ 
                p: { xs: 2, md: 3 },
                borderTop: '1px solid rgba(0, 191, 165, 0.2)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 191, 165, 0.05)'
              }}
            >
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  fontStyle: 'italic'
                }}
              >
                Click on the "Start Interview" button to begin interview
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Start/End Interview Button */}
        <Button
          variant="contained"
          size={window.innerWidth < 600 ? 'medium' : 'large'}
          onClick={toggleInterview}
          startIcon={isInterviewActive ? <StopIcon /> : <PlayIcon />}
          sx={{
            backgroundColor: isInterviewActive ? '#ff6b6b' : 'var(--primary-color)',
            color: 'white',
            py: { xs: 1, md: 2 }, // Reduced padding for mobile
            px: { xs: 2, md: 3 },
            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1.1rem' }, // Smaller font for mobile
            fontWeight: 600,
            '&:hover': {
              backgroundColor: isInterviewActive ? '#e55a5a' : 'var(--primary-dark)',
            },
            borderRadius: 2,
            textTransform: 'none',
            width: '100%',
            minHeight: { xs: '44px', md: 'auto' } // Controlled height for mobile
          }}
        >
          {isInterviewActive ? 'End Interview' : 'Start Interview'}
        </Button>
      </Box>
    </Box>
  );
};

export default AIInterview;