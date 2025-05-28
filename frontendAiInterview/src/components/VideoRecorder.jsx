// src/components/VideoRecorder.jsx
import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Button
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const VideoRecorder = ({ onRecordingComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Initialize media stream
  const initializeMediaStream = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: isAudioOn,
      });
      
      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error('Error playing video:', e));
      }
      
      // Initialize MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
        ? 'video/webm; codecs=vp9' 
        : 'video/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
      };
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');
      setIsLoading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      if (!mediaStreamRef.current) {
        await initializeMediaStream();
      }
      if (mediaRecorderRef.current) {
        recordedChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setSuccess('Recording started...');
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setSuccess('Recording saved!');
      }
    }
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newVideoState;
      }
    }
  };

  const toggleAudio = () => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newAudioState;
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoading ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Loading camera...
          </Typography>
        </Box>
      ) : isVideoOn ? (
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          muted
          playsInline
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: '#000',
            borderRadius: 2,
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror the video
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <VideocamOffIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.3)' }} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Camera is off
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 2,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          p: 1,
          borderRadius: 4,
          backdropFilter: 'blur(8px)',
          zIndex: 1,
        }}
      >
        <IconButton
          onClick={toggleVideo}
          color={isVideoOn ? 'primary' : 'error'}
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
        >
          {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
        <IconButton
          onClick={toggleAudio}
          color={isAudioOn ? 'primary' : 'error'}
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
        >
          {isAudioOn ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
        <Button
          variant="contained"
          color={isRecording ? 'error' : 'primary'}
          onClick={toggleRecording}
          startIcon={
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: isRecording ? '#fff' : 'transparent',
                borderRadius: '50%',
                border: isRecording ? 'none' : '2px solid #fff',
              }}
            />
          }
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </Box>

      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'error.dark',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            zIndex: 1,
          }}
        >
          {error}
        </Box>
      )}

      {success && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'success.dark',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            zIndex: 1,
          }}
        >
          {success}
        </Box>
      )}
    </Box>
  );
};

export default VideoRecorder;