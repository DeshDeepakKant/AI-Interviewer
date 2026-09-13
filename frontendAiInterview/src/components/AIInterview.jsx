import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
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
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
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
  Person as UserIcon,
  Info as InfoIcon,
  RecordVoiceOver as MockInterviewIcon,
  School as SchoolIcon,
  Whatshot as WhatshotIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAccessToken } from '../utils/auth';

const getCookieValue = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const AIInterview = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [socketConnected, setSocketConnected] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);


  const [stream, setStream] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [interviewMode, setInterviewMode] = useState('Guided Mode');
  const [isMobileView, setIsMobileView] = useState(false);

  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const initialMessageSent = useRef(false);
  const audioToggleRef = useRef(false);
  const manualStopRef = useRef(false);
  const [confirmTerminateOpen, setConfirmTerminateOpen] = useState(false);


  useEffect(() => {
    let isHandlingVisibilityChange = false;

    const handleVisibilityChange = () => {
      if (isHandlingVisibilityChange) return;

      if (document.hidden && isInterviewActive) {
        isHandlingVisibilityChange = true;

        setTabSwitchCount(prevCount => {
          const newCount = prevCount + 1;

          if (newCount >= 3) {
            setIsInterviewActive(false);
            stopAllMedia();

            axios.post(import.meta.env.VITE_BACKEND_URL + '/api/v1/ai/aiAnalysis', { sessionId }).catch(error => {
              console.error('Error in background analysis:', error);
            });

            toast.error('Interview ended! You switched tabs 3 times. You can check interview analysis in the dashboard after some time', {
              autoClose: 5000,
              closeButton: true,
              closeOnClick: true,
              draggable: true
            });

            setTimeout(() => navigate('/'), 1500);
          } else {
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

        setTimeout(() => {
          isHandlingVisibilityChange = false;
        }, 500);
      }
    };

    const handleBeforeUnload = (e) => {
      if (isInterviewActive) {
        axios.post(import.meta.env.VITE_BACKEND_URL + '/api/v1/ai/aiAnalysis', { sessionId }).catch(error => {
          console.error('Error in background analysis:', error);
        });

        e.preventDefault();
        e.returnValue = 'Your interview is in progress. Are you sure you want to leave?';
        return 'Your interview is in progress. Are you sure you want to leave?';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isInterviewActive, sessionId, navigate]);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTooltipOpen && !event.target.closest('[data-tooltip-trigger]')) {
        setIsTooltipOpen(false);
      }
    };

    if (isMobileView) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isTooltipOpen, isMobileView]);


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 'Tab' && isInterviewActive) {
        event.preventDefault();

        toast.warning('⚠️ Warning: Switching tabs during interview is not allowed!', {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: '#ff9800',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      }

      if (event.metaKey && event.key === 'Tab' && isInterviewActive) {
        event.preventDefault();

        toast.warning('⚠️ Warning: Switching applications during interview is not allowed!', {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: '#ff9800',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      }
    };

    if (isInterviewActive) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInterviewActive]);

  useEffect(() => {
    const stateData = location.state || {};
    const stateSessionId = stateData.sessionId;
    const storedSessionId = sessionStorage.getItem('interviewSessionId');
    const activeSessionId = stateSessionId || storedSessionId;

    if (activeSessionId) {
      setSessionId(activeSessionId);
      sessionStorage.setItem('interviewSessionId', activeSessionId);

      if (stateData.interviewMode) {
        setInterviewMode(stateData.interviewMode);
        sessionStorage.setItem('interviewMode', stateData.interviewMode);
      } else {
        const storedMode = sessionStorage.getItem('interviewMode');
        if (storedMode) {
          setInterviewMode(storedMode);
        }
      }
      if (stateData.numberOfQuestions) {
        setTotalQuestions(stateData.numberOfQuestions);
        sessionStorage.setItem('numberOfQuestions', stateData.numberOfQuestions.toString());
      } else {
        const storedQuestions = sessionStorage.getItem('numberOfQuestions');
        if (storedQuestions) {
          setTotalQuestions(parseInt(storedQuestions));
        }
      }
    } else {
      toast.error('No active interview session found');
      navigate('/');
    }

    return () => {
      stopAllMedia();
    };
  }, [location, navigate]);

  useEffect(() => {
    const validateAuthAndConnect = async () => {
      try {
        const authResponse = await axios.get(import.meta.env.VITE_BACKEND_URL + '/api/v1/user/currentUser', {
          withCredentials: true,
          timeout: 10000
        });

        if (!authResponse.data.success) {
          throw new Error('Authentication failed');
        }

        initializeSocket();

      } catch (error) {
        console.error('Authentication verification failed:', error);
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
      }
    };

    const initializeSocket = () => {

      let token = getAccessToken();
      let tokenSource = 'localStorage';

      if (!token) {
        token = getCookieValue('accessToken');
        tokenSource = 'cookies';
      }

      if (!token) {
        token = 'cookie-auth';
        tokenSource = 'cookies (via headers)';
      }

      if (!sessionId) {
        return;
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const SOCKET_URL = import.meta.env.VITE_BACKEND_URL ||
        (import.meta.env.DEV ? 'http://localhost:8000' : window.location.origin);

      const socket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      socket.on('connect', () => {
        setSocketConnected(true);

        socket.emit('joinRoom', { sessionId });

      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        console.error('Error message:', error.message);
        console.error('Error description:', error.description);
        setSocketConnected(false);

        if (error.message === 'AuthenticationError') {
          toast.error('Authentication failed. Please login again.');
          navigate('/login');
        } else if (error.message.includes('CORS')) {
          toast.error('Connection blocked by CORS policy. Please check server configuration.');
        } else if (error.message.includes('Network')) {
          toast.error('Network error. Please check your internet connection.');
        } else {
          toast.error(`Failed to connect to interview server: ${error.message}`);
        }
      });


      socket.on('aiInterview', (data) => {
        setIsLoading(false);
        setIsStartingInterview(false);

        if (data && data.result) {
          const aiResponse = data.result;
          const numberOfQuestionLeft = data.numberOfQuestionLeft;

          const aiMessage = {
            id: Date.now(),
            sender: 'ai',
            text: aiResponse,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiMessage]);

          if (aiResponse && !aiResponse.includes("Your interview is over") && numberOfQuestionLeft !== undefined) {
            const currentQuestionNumber = totalQuestions - numberOfQuestionLeft;
            setCurrentQuestion(Math.max(0, currentQuestionNumber));
          }

          if (aiResponse && !aiResponse.includes("Your interview is over") && numberOfQuestionLeft !== undefined) {
            const currentQuestionNumber = totalQuestions - numberOfQuestionLeft;
            if (currentQuestionNumber === 0 && isInterviewActive) {
              setCurrentQuestion(1);
            } else {
              setCurrentQuestion(Math.max(1, currentQuestionNumber));
            }
          }

          if (data.audioUrl) {
            playAudio(data.audioUrl);
          } else if (data.audio) {
            playAudioFromBuffer(data.audio, aiResponse);
          } else if ('speechSynthesis' in window && aiResponse) {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(aiResponse.replace(/[*_#`]/g, ''));
              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              utterance.lang = 'en-US';
              utterance.onstart = () => setIsAudioPlaying(true);
              utterance.onend = () => setIsAudioPlaying(false);
              utterance.onerror = () => setIsAudioPlaying(false);
              window.speechSynthesis.speak(utterance);
            } catch (err) {
              console.error('Speech synthesis fallback error:', err);
            }
          }

          if (aiResponse.includes("Your interview is over")) {
            setTimeout(() => toggleInterview(), 6000);
          }
        } else {
          console.error('Invalid AI response data:', data);
          const errorMessage = {
            id: Date.now(),
            sender: 'ai',
            text: 'Received invalid response from server. Please try again.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      });

      socket.on('aiError', (error) => {
        setIsLoading(false);
        setIsStartingInterview(false);
        console.error('AI Error:', error);

        const errorMessage = {
          id: Date.now(),
          sender: 'ai',
          text: error.message || 'Something went wrong. Please try again later.',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
        toast.error(error.message || 'An error occurred during the interview');
      });

      socketRef.current = socket;
    };

    if (sessionId) {
      validateAuthAndConnect();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [sessionId, navigate, totalQuestions]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


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

  const playAudioFromBase64 = (audioBase64) => {
    if (!audioBase64) return;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      audioRef.current = new Audio(audioUrl);

      audioRef.current.onplay = () => setIsAudioPlaying(true);
      audioRef.current.onended = () => {
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onpause = () => setIsAudioPlaying(false);
      audioRef.current.onerror = () => {
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl);
      });

    } catch (error) {
      console.error('Error processing base64 audio:', error);
      setIsAudioPlaying(false);
    }
  };

  const playAudioFromBuffer = (audioBuffer, fallbackText = '') => {
    if (!audioBuffer) {
      if ('speechSynthesis' in window && fallbackText) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackText.replace(/[*_#`]/g, ''));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';
        utterance.onstart = () => setIsAudioPlaying(true);
        utterance.onend = () => setIsAudioPlaying(false);
        utterance.onerror = () => setIsAudioPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create Uint8Array from the raw buffer data
      const bytes = new Uint8Array(audioBuffer);

      // Create blob with appropriate MIME type (MP3 since backend generates MP3)
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      audioRef.current = new Audio(audioUrl);

      audioRef.current.onplay = () => setIsAudioPlaying(true);
      audioRef.current.onended = () => {
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onpause = () => setIsAudioPlaying(false);
      audioRef.current.onerror = () => {
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl);
        console.error('Error playing audio from buffer');
        if ('speechSynthesis' in window && fallbackText) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(fallbackText.replace(/[*_#`]/g, ''));
          window.speechSynthesis.speak(utterance);
        }
      };

      audioRef.current.play().catch(e => {
        console.error('Error playing audio from buffer:', e);
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl);
        if ('speechSynthesis' in window && fallbackText) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(fallbackText.replace(/[*_#`]/g, ''));
          utterance.onstart = () => setIsAudioPlaying(true);
          utterance.onend = () => setIsAudioPlaying(false);
          window.speechSynthesis.speak(utterance);
        }
      });

    } catch (error) {
      console.error('Error processing audio buffer:', error);
      setIsAudioPlaying(false);
      if ('speechSynthesis' in window && fallbackText) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackText.replace(/[*_#`]/g, ''));
        window.speechSynthesis.speak(utterance);
      }
    }
  };


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

  const startSpeechRecognition = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    manualStopRef.current = false;

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

      if (isInterviewActive && !manualStopRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            if (!manualStopRef.current && recognitionRef.current) {
              recognition.start();
            }
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

  const stopSpeechRecognition = () => {
    manualStopRef.current = true;
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

  const toggleSpeechRecognition = async () => {
    if (isListening) {
      stopSpeechRecognition();
      toast.info('Microphone recording paused. You can edit or submit your response.');
    } else {
      if (!isMicOn || !stream) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isCameraOn
          });
          setStream(mediaStream);
          setIsMicOn(true);
        } catch (err) {
          toast.error('Microphone access required. Please allow microphone permissions.');
          return;
        }
      }
      startSpeechRecognition();
      toast.success('Microphone recording active! Speak your answer now...');
    }
  };

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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (isListening) {
      stopSpeechRecognition();
    }

    if (!socketRef.current || !socketConnected) {
      toast.error('Not connected to interview server. Please wait or refresh the page.');
      return;
    }

    const userText = inputValue.trim();
    const newMessage = {
      id: Date.now(),
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
      const messageData = {
        sessionId: sessionId,
        answer: userText
      };

      socketRef.current.emit('sendAnswer', messageData);


    } catch (error) {
      console.error('Error sending message via socket:', error);
      setIsLoading(false);

      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        text: 'Failed to send message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message. Please check your connection.');
    }
  };

  const toggleInterview = async () => {
    if (!isInterviewActive) {
      const mediaStarted = await startMedia();
      if (!mediaStarted) return;

      if (!socketRef.current || !socketConnected) {
        toast.error('Not connected to interview server. Please wait or refresh the page.');
        return;
      }

      if (!initialMessageSent.current) {
        initialMessageSent.current = true;
        setIsStartingInterview(true);
        setIsLoading(true);

        try {
          socketRef.current.emit('sendAnswer', {
            sessionId: sessionId,
            answer: "Let's start the interview"
          });

          setIsInterviewActive(true);
          setTabSwitchCount(0);

          setTimeout(() => {
            startSpeechRecognition();
          }, 1000);

          toast.success("Interview started! You can now speak or type your responses.");

        } catch (error) {
          console.error('Error starting interview:', error);
          setIsLoading(false);
          setIsStartingInterview(false);
          toast.error("Failed to start interview.");
        }
      }
    } else {
      setIsInterviewActive(false);
      setCurrentQuestion(0);
      stopAllMedia();

      sessionStorage.removeItem('interviewSessionId');
      sessionStorage.removeItem('numberOfQuestions');
      sessionStorage.removeItem('interviewMode');

      axios.post(import.meta.env.VITE_BACKEND_URL + '/api/v1/ai/aiAnalysis', { sessionId }).catch(error => {
        console.error('Error in background analysis:', error);
      });

      toast.success('You can check interview analysis in the dashboard after some time', {
        autoClose: 3000,
        closeButton: true,
        closeOnClick: true,
        draggable: true
      });


      navigate('/');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

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
    <>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1, sm: 1.5, md: 2 },
          p: { xs: 1, sm: 1.5, md: 2 },
          backgroundColor: 'var(--dark-bg)',
          fontFamily: 'Inter, sans-serif',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          filter: isTooltipOpen ? 'blur(3px)' : 'none',
          transition: 'filter 0.3s ease-in-out'
        }}
      >

        {/* Backdrop Blur Overlay */}
        {isTooltipOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
              pointerEvents: 'none'
            }}
          />
        )}
        {/* Left Side */}
        <Box sx={{
          flex: { xs: 'none', md: '0 0 40%' },
          width: { xs: '100%', md: 'auto' },
          height: { xs: 'auto', md: '100%' },
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          gap: { xs: 1, sm: 1.5, md: 2 },
          flexShrink: 0
        }}>

          {/* AI Assistant Box */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              backgroundColor: '#FFFFFF',
              border: '2px solid #111111',
              boxShadow: '4px 4px 0 #111111',
              borderRadius: 0,
              height: { xs: 'auto', sm: 'auto', md: 'auto' },
              flex: { xs: '1', md: 'none' },
              minHeight: { xs: '160px', sm: '180px', md: 'auto' },
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 2 } }}>
              <Avatar
                sx={{
                  bgcolor: '#111111',
                  color: '#FFFFFF',
                  borderRadius: 0,
                  mr: { xs: 0.5, md: 2 },
                  width: { xs: 24, sm: 36, md: 40 },
                  height: { xs: 24, sm: 36, md: 40 },
                  fontSize: { xs: '0.8rem', md: '1rem' }
                }}
              >
                <MockInterviewIcon sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }} />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  color: '#111111',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.8rem', sm: '1.1rem', md: '1.25rem' }
                }}
              >
                Mock Interview
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: '#555555',
                mb: { xs: 0.5, md: 2 },
                lineHeight: 1.4,
                fontSize: { xs: '0.65rem', md: '0.875rem' }
              }}
            >
              Status: {isInterviewActive ? 'Interview in Progress' : 'Ready to Start'}
            </Typography>

            {/* Connection Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 0.5, md: 1 } }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: 0,
                  backgroundColor: socketConnected ? '#008040' : '#d32f2f',
                  animation: socketConnected ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 }
                  }
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Courier New", Courier, monospace',
                  color: socketConnected ? '#008040' : '#d32f2f',
                  fontSize: { xs: '0.6rem', md: '0.75rem' },
                  fontWeight: 700
                }}
              >
                {socketConnected ? 'CONNECTED TO SOCKET' : 'CONNECTING...'}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: { xs: 0, md: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Courier New", Courier, monospace',
                    color: '#111111',
                    fontSize: { xs: '0.6rem', md: '0.75rem' },
                    fontWeight: 700
                  }}
                >
                  PROGRESS
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Courier New", Courier, monospace',
                    color: '#0044CC',
                    fontSize: { xs: '0.6rem', md: '0.75rem' },
                    fontWeight: 800
                  }}
                >
                  {currentQuestion}/{totalQuestions}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(currentQuestion / totalQuestions) * 100}
                sx={{
                  height: { xs: 4, md: 8 },
                  borderRadius: 0,
                  border: '1px solid #111111',
                  backgroundColor: '#ECECE9',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#0044CC',
                    borderRadius: 0,
                  }
                }}
              />
            </Box>

            {/* Mode Display */}
            <Box sx={{ mt: { xs: 1, md: 2 } }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  backgroundColor: '#FAF9F6',
                  border: '1px solid #111111',
                  borderRadius: 0,
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: 'center'
                }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: '"Courier New", Courier, monospace',
                      color: '#555555',
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      fontWeight: 700,
                    }}
                  >
                    MODE:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {interviewMode === 'Guided Mode' ? (
                      <SchoolIcon sx={{ fontSize: 18, color: '#0044CC' }} />
                    ) : (
                      <WhatshotIcon sx={{ fontSize: 18, color: '#111111' }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Helvetica Neue", Arial, sans-serif',
                        color: '#111111',
                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {interviewMode}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

          </Paper>

          {/* Camera View Box */}
          <Paper
            elevation={0}
            sx={{
              flex: { xs: '1', md: '1' },
              backgroundColor: '#FFFFFF',
              border: '2px solid #111111',
              boxShadow: '4px 4px 0 #111111',
              borderRadius: 0,
              overflow: 'hidden',
              position: 'relative',
              height: { xs: 'auto', sm: 'auto', md: 'auto' },
              minHeight: { xs: '160px', sm: '180px', md: 'auto' }
            }}
          >
            <Box sx={{ p: { xs: 0.5, md: 2 }, borderBottom: '1px solid #111111' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  color: '#111111',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.8rem', md: '1.1rem' }
                }}
              >
                CANDIDATE MONITOR
              </Typography>
            </Box>

            <Box sx={{
              position: 'relative',
              height: { xs: 'calc(100% - 30px)', md: 'calc(100% - 60px)' },
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
                  <VideocamOffIcon sx={{ fontSize: { xs: 16, md: 48 }, mb: { xs: 0, md: 1 } }} />
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.6rem', md: '0.875rem' } }}>
                    Camera is off
                  </Typography>
                </Box>
              )}

              <IconButton
                onClick={toggleCamera}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: { xs: 2, md: 10 },
                  right: { xs: 2, md: 10 },
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: isCameraOn ? 'var(--primary-color)' : 'var(--text-secondary)',
                  border: `1px solid ${isCameraOn ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'}`,
                  backdropFilter: 'blur(10px)',
                  width: { xs: 20, md: 'auto' },
                  height: { xs: 20, md: 'auto' },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isCameraOn ? <VideocamIcon sx={{ fontSize: { xs: '0.8rem', md: '1.5rem' } }} /> : <VideocamOffIcon sx={{ fontSize: { xs: '0.8rem', md: '1.5rem' } }} />}
              </IconButton>

              <IconButton
                onClick={toggleMic}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: { xs: 2, md: 10 },
                  right: { xs: 24, md: 70 },
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: isMicOn ? 'var(--primary-color)' : 'var(--text-secondary)',
                  border: `1px solid ${isListening ? 'var(--primary-color)' : isMicOn ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'}`,
                  backdropFilter: 'blur(10px)',
                  animation: isListening ? 'micPulse 1.5s ease-in-out infinite' : 'none',
                  width: { xs: 20, md: 'auto' },
                  height: { xs: 20, md: 'auto' },
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
                {isMicOn ? <MicIcon sx={{ fontSize: { xs: '0.8rem', md: '1.5rem' } }} /> : <MicOffIcon sx={{ fontSize: { xs: '0.8rem', md: '1.5rem' } }} />}
              </IconButton>
            </Box>
          </Paper>
        </Box>

        {/* Right Side - Chat Area */}
        <Box sx={{
          flex: { xs: '1', md: 1 },
          width: { xs: '100%', md: 'auto' },
          height: { xs: 'auto', md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1, sm: 1, md: 2 },
          minHeight: { xs: '0', md: 'auto' },
          overflow: 'hidden'
        }}>

          {/* Chat Box */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #111111',
              boxShadow: '4px 4px 0 #111111',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flex: 1,
              height: {
                xs: 'calc(100vh - 320px)',
                sm: 'calc(100vh - 400px)',
                md: 'calc(100vh - 150px)'
              },
              minHeight: { xs: '150px', md: 'auto' }
            }}
          >
            {/* Chat Header */}
            <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: '1px solid #111111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    color: '#111111',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    fontSize: { xs: '0.9rem', md: '1.1rem' }
                  }}
                >
                  EXAMINATION TERMINAL
                </Typography>

                <Tooltip
                  open={isTooltipOpen}
                  onClose={() => setIsTooltipOpen(false)}
                  onOpen={() => setIsTooltipOpen(true)}
                  disableFocusListener={isMobileView}
                  disableHoverListener={isMobileView}
                  disableTouchListener={!isMobileView}
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="subtitle2" sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: '#00e5ff',
                        textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}>
                        📋 Important Instructions:
                      </Typography>
                      <Typography variant="body2" sx={{
                        mb: 1,
                        color: '#ffffff',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.8rem', md: '0.9rem' }
                      }}>
                        • Tab switching is monitored - after 3 tab switches, your interview will end automatically
                      </Typography>
                      <Typography variant="body2" sx={{
                        mb: 1,
                        color: '#ffffff',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.8rem', md: '0.9rem' }
                      }}>
                        • Your interview analysis will be available in the dashboard after completion
                      </Typography>
                      <Typography variant="body2" sx={{
                        mb: 1,
                        color: '#ffffff',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.8rem', md: '0.9rem' }
                      }}>
                        • To submit your answer: Click the submit button or press Enter
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#ffffff',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.8rem', md: '0.9rem' }
                      }}>
                        • For new line in your response: Press Shift + Enter
                      </Typography>
                      {interviewMode === 'Guided Mode' && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--primary-color)',
                              mb: 1,
                              fontSize: { xs: '0.9rem', md: '1rem' },
                              mt: 1
                            }}
                          >
                            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span> For question explanation type <code>//explanation</code>
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--primary-color)',
                              mb: 1,
                              fontSize: { xs: '0.9rem', md: '1rem' }
                            }}
                          >
                            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span> After explanation, to get next question type <code>//yes</code>
                          </Typography>
                        </>
                      )}
                    </Box>
                  }
                  placement="bottom-start"
                  arrow
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      background: '#05131C',
                      border: '1px solid rgba(0, 191, 165, 0.4)',
                      borderRadius: '16px',
                      boxShadow: '0 12px 40px rgba(0, 191, 165, 0.25), 0 4px 16px rgba(0, 0, 0, 0.3)',
                      maxWidth: { xs: '400px', md: '600px' },
                      zIndex: 10000,
                      color: '#ffffff',
                      padding: { xs: '12px 16px', md: '16px 20px' },
                      fontSize: { xs: '0.8rem', md: '0.9rem' },
                      filter: 'none !important',
                      isolation: 'isolate'
                    },
                    '& .MuiTooltip-arrow': {
                      color: '#05131C',
                      zIndex: 10000,
                      filter: 'none !important',
                      '&::before': {
                        border: '1px solid rgba(0, 191, 165, 0.4)',
                        background: '#05131C'
                      }
                    },
                    '& .MuiTooltip-popper': {
                      zIndex: 10000,
                      filter: 'none !important',
                      isolation: 'isolate'
                    }
                  }}
                >
                  <IconButton
                    size="small"
                    data-tooltip-trigger
                    onClick={isMobileView ? () => setIsTooltipOpen(!isTooltipOpen) : undefined}
                    onMouseEnter={!isMobileView ? () => setIsTooltipOpen(true) : undefined}
                    onMouseLeave={!isMobileView ? () => setIsTooltipOpen(false) : undefined}
                    sx={{
                      color: 'rgba(0, 191, 165, 0.7)',
                      '&:hover': {
                        color: 'var(--primary-color)',
                        backgroundColor: 'rgba(0, 191, 165, 0.1)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Voice Animation */}
                {isListening && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.3,
                      padding: '4px 8px',
                      backgroundColor: '#FFF1F2',
                      borderRadius: 0,
                      border: '1px solid #FECDD3'
                    }}>
                      {[0, 1, 2, 3, 4].map((bar) => (
                        <Box
                          key={bar}
                          sx={{
                            width: { xs: 3, md: 4 },
                            backgroundColor: '#E11D48',
                            borderRadius: '1px',
                            transformOrigin: 'bottom',
                            animation: `voiceWave 1.2s ease-in-out infinite`,
                            animationDelay: `${bar * 0.1}s`,
                            height: { xs: '12px', md: '16px' },
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
                          fontSize: { xs: '0.9rem', md: '1.1rem' },
                          color: '#E11D48',
                          ml: 0.5,
                          animation: 'pulse 1.5s ease-in-out infinite',
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
                        color: '#BE123C',
                        fontFamily: '"Courier New", Courier, monospace',
                        fontSize: { xs: '0.65rem', md: '0.7rem' },
                        fontWeight: 700,
                      }}
                    >
                      RECORDING...
                    </Typography>
                  </Box>
                )}

                {/* Small Top-Right Terminate Button */}
                {isInterviewActive && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setConfirmTerminateOpen(true)}
                    sx={{
                      color: '#B71C1C',
                      borderColor: '#B71C1C',
                      backgroundColor: '#FFF5F5',
                      borderRadius: 0,
                      fontSize: { xs: '0.62rem', md: '0.7rem' },
                      fontWeight: 800,
                      fontFamily: '"Courier New", Courier, monospace',
                      letterSpacing: '0.05em',
                      py: 0.3,
                      px: { xs: 1, md: 1.5 },
                      minWidth: 'auto',
                      boxShadow: '1px 1px 0 #B71C1C',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        backgroundColor: '#FEE2E2',
                        borderColor: '#7F1D1D',
                        color: '#7F1D1D',
                        boxShadow: 'none',
                        transform: 'translate(1px, 1px)',
                      }
                    }}
                  >
                    TERMINATE
                  </Button>
                )}
              </Box>
            </Box>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                p: { xs: 1, md: 2 },
                overflowY: 'auto',
                height: '100%',
                minHeight: 0,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--primary-color)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'var(--primary-dark)',
                },
              }}
            >
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

                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3.5 },
                      backgroundColor: '#FAF9F6',
                      border: '2px solid #111111',
                      boxShadow: '4px 4px 0 #111111',
                      borderRadius: 0,
                      maxWidth: '520px',
                      width: '100%'
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Helvetica Neue", Arial, sans-serif',
                        color: '#111111',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        mb: 2,
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        letterSpacing: '-0.02em',
                        borderBottom: '1px solid #111111',
                        pb: 1
                      }}
                    >
                      EXAMINATION PROTOCOL & RULES
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
                      {interviewMode === 'Guided Mode' && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--primary-color)',
                              mb: 1,
                              fontSize: { xs: '0.9rem', md: '1rem' },
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1,
                              mt: 1
                            }}
                          >
                            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span>
                            For question explanation type //explanation
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--primary-color)',
                              mb: 1,
                              fontSize: { xs: '0.9rem', md: '1rem' },
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1
                            }}
                          >
                            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span>
                            After explanation, to get next question type //yes
                          </Typography>
                        </>
                      )}

                    </Box>
                  </Paper>

                </Box>
              )}

              {isInterviewActive && messages.map((message) => {

                if (message.sender === 'system' && message.modeChange) {
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        mb: { xs: 2, md: 3 },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Paper
                        sx={{
                          px: { xs: 3, md: 4 },
                          py: { xs: 1.5, md: 2 },
                          backgroundColor: 'rgba(0, 191, 165, 0.1)',
                          border: '1px solid rgba(0, 191, 165, 0.3)',
                          borderRadius: 3,
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5
                        }}
                      >
                        {message.newMode === 'Guided Mode' ? (
                          <SchoolIcon sx={{ fontSize: 20, color: '#BCBCC4' }} />
                        ) : (
                          <WhatshotIcon sx={{ fontSize: 20, color: '#BCBCC4' }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.9rem', md: '1rem' },
                            fontWeight: 600,
                            color: 'var(--primary-color)'
                          }}
                        >
                          {message.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            fontSize: { xs: '0.65rem', md: '0.7rem' },
                            color: 'var(--text-secondary)',
                            ml: 1
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                }

                return (
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
                          bgcolor: '#111111',
                          color: '#FFFFFF',
                          borderRadius: 0,
                          border: '1px solid #111111',
                          width: { xs: 28, md: 32 },
                          height: { xs: 28, md: 32 },
                          fontSize: { xs: '0.8rem', md: '0.9rem' }
                        }}
                      >
                        <AIIcon sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }} />
                      </Avatar>
                    )}

                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, md: 2 },
                        maxWidth: { xs: '85%', sm: '80%', md: '75%' },
                        backgroundColor: message.sender === 'user'
                          ? '#0044CC'
                          : '#FAF9F6',
                        color: message.sender === 'user'
                          ? '#FFFFFF'
                          : '#111111',
                        border: '1px solid #111111',
                        boxShadow: '2px 2px 0 #111111',
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant="body2" sx={{
                        fontFamily: '"Courier New", Courier, monospace',
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        color: message.sender === 'user' ? '#FFFFFF' : '#111111',
                        lineHeight: 1.6,
                      }}>
                        {message.text}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Courier New", Courier, monospace',
                          opacity: 0.8,
                          fontSize: { xs: '0.65rem', md: '0.7rem' },
                          mt: 0.5,
                          display: 'block',
                          color: message.sender === 'user' ? '#FFFFFF' : '#666666'
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Paper>

                    {message.sender === 'user' && (
                      <Avatar
                        sx={{
                          bgcolor: '#0044CC',
                          color: '#FFFFFF',
                          borderRadius: 0,
                          border: '1px solid #111111',
                          width: { xs: 28, md: 32 },
                          height: { xs: 28, md: 32 },
                          fontSize: { xs: '0.8rem', md: '0.9rem' }
                        }}
                      >
                        <UserIcon sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }} />
                      </Avatar>
                    )}
                  </Box>
                );
              })}

              {isInterviewActive && isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 1, mb: { xs: 1.5, md: 2 } }}>
                  <Avatar
                    sx={{
                      bgcolor: '#111111',
                      color: '#FFFFFF',
                      borderRadius: 0,
                      border: '1px solid #111111',
                      width: { xs: 28, md: 32 },
                      height: { xs: 28, md: 32 },
                      fontSize: { xs: '0.8rem', md: '0.9rem' }
                    }}
                  >
                    <AIIcon sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }} />
                  </Avatar>

                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      backgroundColor: '#FAF9F6',
                      border: '1px solid #111111',
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CircularProgress size={16} sx={{ color: '#0044CC' }} />
                    <Typography variant="body2" sx={{
                      fontFamily: '"Courier New", Courier, monospace',
                      color: '#555555',
                      fontSize: { xs: '0.85rem', md: '0.875rem' }
                    }}>
                      EXAMINER EVALUATING RESPONSE...
                    </Typography>
                  </Paper>
                </Box>
              )}

              <div ref={chatEndRef} />
            </Box>

            {/* Input Area - Only show when interview is active */}
            {isInterviewActive ? (
              <Box sx={{ borderTop: '1px solid #111111', backgroundColor: '#FFFFFF' }}>
                {/* Voice Recording Active Banner */}
                {isListening && (
                  <Box
                    sx={{
                      px: { xs: 1.5, md: 2 },
                      py: 0.75,
                      backgroundColor: '#FFF1F2',
                      borderBottom: '1px solid #FECDD3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: '#E11D48',
                          animation: 'micPulse 1.2s infinite',
                          '@keyframes micPulse': {
                            '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(225, 29, 72, 0.7)' },
                            '70%': { transform: 'scale(1.1)', boxShadow: '0 0 0 6px rgba(225, 29, 72, 0)' },
                            '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(225, 29, 72, 0)' }
                          }
                        }}
                      />
                      <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 800, fontSize: '0.78rem', color: '#9F1239' }}>
                        RECORDING VOICE...
                      </Typography>
                      {transcript && (
                        <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '0.78rem', color: '#555555', fontStyle: 'italic' }}>
                          "{transcript}"
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '0.68rem', color: '#BE123C', fontWeight: 700 }}>
                      [CLICK "STOP MIC" OR "SEND" WHEN FINISHED]
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    p: { xs: 1, md: 1.5 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, md: 1 }
                  }}
                >
                  {/* Dedicated Voice/Mic Answer Button */}
                  <Button
                    variant={isListening ? 'contained' : 'outlined'}
                    onClick={toggleSpeechRecognition}
                    disabled={isLoading}
                    size={window.innerWidth < 600 ? 'small' : 'medium'}
                    startIcon={isListening ? <StopIcon sx={{ color: '#FFFFFF' }} /> : <MicIcon sx={{ color: '#0044CC' }} />}
                    sx={{
                      borderRadius: 0,
                      fontFamily: '"Courier New", Courier, monospace',
                      fontWeight: 800,
                      fontSize: { xs: '0.7rem', md: '0.8rem' },
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                      minWidth: { xs: 'auto', md: '115px' },
                      px: { xs: 1.2, md: 1.8 },
                      py: { xs: 0.8, md: 1 },
                      backgroundColor: isListening ? '#E11D48' : '#FAF9F6',
                      color: isListening ? '#FFFFFF' : '#111111',
                      borderColor: isListening ? '#9F1239' : '#111111',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      boxShadow: isListening ? 'none' : '2px 2px 0 #111111',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        backgroundColor: isListening ? '#BE123C' : '#ECECE9',
                        borderColor: '#111111',
                        boxShadow: isListening ? 'none' : '1px 1px 0 #111111',
                        transform: isListening ? 'none' : 'translate(1px, 1px)',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#E0E0DB',
                        borderColor: '#999999',
                        color: '#888888',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    {isListening ? (window.innerWidth < 600 ? 'STOP' : 'STOP MIC') : (window.innerWidth < 600 ? 'VOICE' : 'SPEAK')}
                  </Button>

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
                    placeholder={
                      isLoading
                        ? "EXAMINER RESPONDING..."
                        : isListening
                          ? "Listening... Speak your response, or edit here..."
                          : "Click 'SPEAK' to answer by voice, or type here..."
                    }
                    variant="outlined"
                    size={window.innerWidth < 600 ? 'small' : 'medium'}
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isLoading ? '#FAF9F6' : '#FFFFFF',
                        color: '#111111',
                        fontFamily: '"Courier New", Courier, monospace',
                        fontSize: { xs: '0.85rem', md: '0.95rem' },
                        borderRadius: 0,
                        '& fieldset': {
                          borderColor: isListening ? '#E11D48' : '#111111',
                          borderWidth: isListening ? '2px' : '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0044CC',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0044CC',
                          borderWidth: '2px',
                        },
                        '&.Mui-disabled': {
                          opacity: 0.6,
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: isListening ? '#E11D48' : '#888888',
                        fontFamily: '"Courier New", Courier, monospace',
                        fontSize: '0.85rem',
                        opacity: 1,
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size={window.innerWidth < 600 ? 'small' : 'medium'}
                    sx={{
                      backgroundColor: '#111111',
                      color: '#FFFFFF',
                      borderRadius: 0,
                      border: '1px solid #111111',
                      boxShadow: '2px 2px 0 #111111',
                      minWidth: { xs: '44px', md: '56px' },
                      px: { xs: 1, md: 2 },
                      py: { xs: 0.8, md: 1 },
                      '&:hover': {
                        backgroundColor: '#0044CC',
                        borderColor: '#0044CC',
                        boxShadow: '1px 1px 0 #111111',
                        transform: 'translate(1px, 1px)',
                      },
                      '&:disabled': {
                        backgroundColor: '#E0E0DB',
                        borderColor: '#999999',
                        color: '#888888',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    <SendIcon sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' } }} />
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderTop: '1px solid #111111',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#FAF9F6'
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: '"Courier New", Courier, monospace',
                    color: '#555555',
                    textAlign: 'center',
                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                    fontWeight: 700,
                  }}
                >
                  [ CLICK "START ASSESSMENT" BELOW TO BEGIN EXAMINATION PROTOCOL ]
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Start Assessment Button - Only shown when interview is NOT active */}
          {!isInterviewActive && (
            <Box sx={{ flexShrink: 0 }}>
              <Button
                variant="contained"
                size={window.innerWidth < 600 ? 'medium' : 'large'}
                onClick={toggleInterview}
                disabled={isStartingInterview || !socketConnected}
                startIcon={
                  isStartingInterview ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PlayIcon />
                  )
                }
                sx={{
                  backgroundColor: isStartingInterview ? '#D97706' : '#0044CC',
                  color: '#FFFFFF',
                  borderRadius: 0,
                  border: '2px solid #111111',
                  boxShadow: '4px 4px 0 #111111',
                  py: { xs: 1.5, md: 2 },
                  px: { xs: 2, md: 3 },
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' },
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  width: '100%',
                  minHeight: { xs: '48px', md: 'auto' },
                  '&:hover': {
                    backgroundColor: isStartingInterview ? '#B45309' : '#003399',
                    borderColor: '#111111',
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
                {isStartingInterview
                  ? 'INITIALIZING ASSESSMENT...'
                  : !socketConnected
                    ? 'CONNECTING TO SERVER...'
                    : 'START ASSESSMENT'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Confirmation Dialog to Prevent Accidental Termination */}
      <Dialog
        open={confirmTerminateOpen}
        onClose={() => setConfirmTerminateOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '2px solid #111111',
            boxShadow: '6px 6px 0 #111111',
            p: { xs: 1, sm: 1.5 },
            backgroundColor: '#FFFFFF',
            maxWidth: '460px'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#111111',
            fontSize: '1.1rem',
            pb: 1
          }}
        >
          QUIT INTERVIEW SESSION?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              color: '#333333',
              fontSize: '0.88rem',
              lineHeight: 1.6
            }}
          >
            Are you sure you want to terminate this interview? Your completed responses will be submitted for scoring and the examination will conclude immediately.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmTerminateOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 0,
              border: '1px solid #111111',
              color: '#111111',
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 2,
              '&:hover': {
                backgroundColor: '#ECECE9',
                borderColor: '#111111'
              }
            }}
          >
            CANCEL (CONTINUE TEST)
          </Button>
          <Button
            onClick={() => {
              setConfirmTerminateOpen(false);
              toggleInterview();
            }}
            variant="contained"
            sx={{
              borderRadius: 0,
              backgroundColor: '#D32F2F',
              color: '#FFFFFF',
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 800,
              fontSize: '0.8rem',
              px: 2,
              border: '1px solid #B71C1C',
              boxShadow: '2px 2px 0 #111111',
              '&:hover': {
                backgroundColor: '#B71C1C',
                borderColor: '#B71C1C'
              }
            }}
          >
            CONFIRM TERMINATION
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIInterview;