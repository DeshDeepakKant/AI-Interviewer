import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const WebRTCVideo = ({ onRecordingComplete }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Clean up function
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: isAudioOn
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check your permissions.');
    }
  };

  const startRecording = async () => {
    if (!stream) {
      await startCamera();
    }

    recordedChunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      if (onRecordingComplete) {
        onRecordingComplete({
          url,
          blob,
          filename: `recording-${new Date().toISOString()}.webm`
        });
      }
      
      // Clean up
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };

    mediaRecorderRef.current.start(100);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleVideo = async () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    } else {
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = async () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    } else {
      setIsAudioOn(!isAudioOn);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Video Element */}
      {isVideoOn ? (
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 2,
            objectFit: 'cover',
            transform: 'scaleX(-1)'
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <VideocamOffIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)' }} />
        </Box>
      )}

      {/* Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 2,
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          p: 1,
          borderRadius: 4,
          backdropFilter: 'blur(8px)',
          zIndex: 2,
        }}
      >
        <IconButton
          onClick={toggleVideo}
          sx={{
            bgcolor: isVideoOn ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.2)',
            '&:hover': {
              bgcolor: isVideoOn ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 0, 0, 0.3)',
            },
          }}
        >
          {isVideoOn ? (
            <VideocamIcon sx={{ color: '#fff' }} />
          ) : (
            <VideocamOffIcon sx={{ color: '#ff6b6b' }} />
          )}
        </IconButton>
        <IconButton
          onClick={toggleAudio}
          sx={{
            bgcolor: isAudioOn ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.2)',
            '&:hover': {
              bgcolor: isAudioOn ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 0, 0, 0.3)',
            },
          }}
        >
          {isAudioOn ? (
            <MicIcon sx={{ color: '#fff' }} />
          ) : (
            <MicOffIcon sx={{ color: '#ff6b6b' }} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

export default WebRTCVideo;
