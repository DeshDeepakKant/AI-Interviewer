import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

// Check for browser support
const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && 
         ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

const getSpeechRecognition = () => {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const SpeechRecognitionComponent = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setError('Speech recognition is not supported in this browser. Try using Chrome or Edge.');
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(prev => {
        const finalParts = prev.split('\n').filter(part => part.endsWith('.'));
        return [...finalParts, finalTranscript + interimTranscript].join('\n');
      });
      
      if (finalTranscript.trim()) {
        console.log('Final transcript:', finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}. Please check your microphone permissions.`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('Error restarting recognition:', err);
          setError('Error restarting speech recognition. Please refresh the page.');
          setIsListening(false);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error cleaning up recognition:', err);
        }
      }
    };
  }, [isListening]);

  const toggleListening = async () => {
    if (!isSpeechRecognitionSupported()) {
      setError('Speech recognition is not supported in your browser. Try using Chrome or Edge.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
        setError(`Error stopping recognition: ${err.message}`);
      } finally {
        setIsListening(false);
      }
    } else {
      setError(null);
      setTranscript('');
      try {
        await recognitionRef.current.start();
        console.log('Starting speech recognition...');
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError(`Error: ${error.message}. Please check your microphone permissions.`);
        setIsListening(false);
      }
    }
  };

  return (
    <Box 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}
    >
      <IconButton
        onClick={toggleListening}
        disabled={!isSpeechRecognitionSupported()}
        sx={{
          width: 80,
          height: 80,
          bgcolor: isListening ? 'error.main' : 'primary.main',
          color: 'white',
          '&:hover': {
            bgcolor: isListening ? 'error.dark' : 'primary.dark',
          },
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      >
        {isListening ? <MicIcon sx={{ fontSize: 40 }} /> : <MicOffIcon sx={{ fontSize: 40 }} />}
        {isListening && (
          <CircularProgress 
            size={90} 
            thickness={2}
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              position: 'absolute',
              top: '-5px',
              left: '-5px',
              zIndex: 1,
            }}
          />
        )}
      </IconButton>
      
      <Box sx={{ 
        width: '100%', 
        minHeight: '120px',
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        textAlign: 'left',
        overflowY: 'auto',
        maxHeight: '200px'
      }}>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : transcript ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {transcript}
          </Typography>
        ) : (
          <Typography color="text.secondary">
            {isListening 
              ? 'Listening... Speak now!' 
              : 'Click the microphone to start speaking'}
          </Typography>
        )}
      </Box>
      
      {!isSpeechRecognitionSupported() && (
        <Typography color="warning.main" variant="body2">
          Note: Speech recognition works best in Chrome and Edge browsers
        </Typography>
      )}
    </Box>
  );
};

export default SpeechRecognitionComponent;
