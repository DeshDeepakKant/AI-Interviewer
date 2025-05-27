import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const VisualizerContainer = styled.div`
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  border-radius: 8px;
`;

const StatusText = styled.p`
  position: absolute;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: center;
  z-index: 2;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
`;

const VoiceVisualizer = ({ isRecording = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [status, setStatus] = useState('Click to start recording');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isRecording) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isRecording]);

  const initAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      setIsInitialized(true);
      setStatus('Recording...');
      
      return true;
    } catch (err) {
      console.error('Error initializing audio:', err);
      setStatus('Error accessing microphone');
      return false;
    }
  };

  const startVisualization = async () => {
    if (!isInitialized) {
      const success = await initAudio();
      if (!success) return;
    }
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const WIDTH = canvas.width = canvas.offsetWidth;
    const HEIGHT = canvas.height = canvas.offsetHeight;
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      
      analyser.getByteFrequencyData(dataArray);
      
      canvasCtx.fillStyle = 'rgba(22, 33, 62, 0.2)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
      
      const barWidth = (WIDTH / dataArray.length) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2;
        
        const hue = 200 + (i * 1.5);
        const saturation = 70 + (dataArray[i] / 255 * 30);
        const lightness = 40 + (dataArray[i] / 255 * 30);
        
        canvasCtx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsInitialized(false);
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    setStatus('Click to start recording');
  };

  return (
    <VisualizerContainer>
      <Canvas ref={canvasRef} />
      <StatusText>{status}</StatusText>
    </VisualizerContainer>
  );
};

export default VoiceVisualizer;