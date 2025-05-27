import React from 'react';
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
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ai from "../../public/ai.jpeg"
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px 0 rgba(0, 180, 165, 0.2)'
  }
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #00bfa5 30%, #00acc1 90%)',
  color: '#fff',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 180, 165, 0.3)'
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#fff',
  padding: '10px 24px',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)'
  }
}));

const AIInterview = () => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const [isAudioOn, setIsAudioOn] = React.useState(true);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  return (
    <Box 
      sx={{ 
        p: { xs: 1, md: 3 }, 
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1a2e 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60vh',
          height: '60vh',
          background: 'radial-gradient(circle at center, rgba(0, 180, 165, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '10%',
          width: '50vh',
          height: '50vh',
          background: 'radial-gradient(circle at center, rgba(0, 172, 193, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mt: 5,
            mb: 3, 
            pt: 2,
            fontWeight: 700, 
            background: 'linear-gradient(90deg, #00bfa5 0%, #00acc1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}
        >
          AI Interview Session
        </Typography>

        <Stack justifyContent="center" alignItems="center">
        <Grid container spacing={3} sx={{ minHeight: 'calc(100vh - 160px)' }}>
          {/* Left column */}

          {/* fix this */}
          <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* AI Assistant */}
            <GlassCard sx={{ mb: 3, width: "fit-content", flex: '0 0 auto' }}>
              <CardContent>
                <Box sx={{ width: 500 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#00bfa5', 
                    borderRadius: '50%',
                    mr: 1,
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#00bfa5' }}>
                    AI Assistant
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                  {isRecording 
                    ? <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        width: 'fit-content',
                        margin: '0 auto',
                        padding: '8px',
                        borderRadius: '50%',
                        animation: 'glow 2s infinite alternate'
                      }}>
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
                          borderRadius: '50%',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          zIndex: 1
                        }}
                      />
                    </div>
                  
                    : "Click the start button to begin your interview. I'll ask you a series of questions."}
                </Typography>
                </Box>
              </CardContent>
            </GlassCard>

            {/* Video Feed */}
            <GlassCard sx={{ flex: 1, mb: 3, overflow: 'hidden' }}>
              <CardContent sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {isVideoOn ? (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0, 180, 165, 0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed rgba(0, 180, 165, 0.3)'
                  }}>
                    <VideocamIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)' }} />
                  </Box>
                ) : (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed rgba(255, 255, 255, 0.1)'
                  }}>
                    <VideocamOffIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.1)' }} />
                  </Box>
                )}
                
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  display: 'flex', 
                  gap: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  p: 1,
                  borderRadius: 4,
                  backdropFilter: 'blur(8px)'
                }}>
                  <IconButton 
                    onClick={toggleVideo}
                    sx={{ 
                      bgcolor: isVideoOn ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.2)',
                      '&:hover': { bgcolor: isVideoOn ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 0, 0, 0.3)' }
                    }}
                  >
                    {isVideoOn ? 
                      <VideocamIcon sx={{ color: '#fff' }} /> : 
                      <VideocamOffIcon sx={{ color: '#ff6b6b' }} />
                    }
                  </IconButton>
                  <IconButton 
                    onClick={toggleAudio}
                    sx={{ 
                      bgcolor: isAudioOn ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.2)',
                      '&:hover': { bgcolor: isAudioOn ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 0, 0, 0.3)' }
                    }}
                  >
                    {isAudioOn ? 
                      <MicIcon sx={{ color: '#fff' }} /> : 
                      <MicOffIcon sx={{ color: '#ff6b6b' }} />
                    }
                  </IconButton>
                </Box>
              </CardContent>
            </GlassCard>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 'auto' }}>
              {!isRecording ? (
                <PrimaryButton 
                  onClick={toggleRecording}
                  startIcon={<Box sx={{ 
                    width: 12, 
                    height: 12, 
                    bgcolor: '#fff', 
                    borderRadius: '50%',
                    animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                  }} />}
                >
                  Start Interview
                </PrimaryButton>
              ) : (
                <>
                  <PrimaryButton 
                    onClick={toggleRecording}
                    sx={{
                      background: 'linear-gradient(45deg, #ff5252 30%, #ff1744 90%)',
                      '&:hover': {
                        boxShadow: '0 6px 12px rgba(255, 82, 82, 0.3)'
                      }
                    }}
                  >
                    End Interview
                  </PrimaryButton>
                </>
              )}
            </Box>
          </Grid>

          {/* Right column - Transcript */}
          <Grid item xs={12} md={5}>
            <GlassCard sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 200px)',
              overflow: 'hidden' 
            }}>
              <Box
                sx={{
                  width: 500,            // fix width if needed
                  height: 500,           // fixed height for the entire card
                  display: 'flex',
                  flexDirection: 'column',
                }}>
              <CardContent sx={{ flex: 1, p: 0, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#00bfa5' }}>
                    Interview Transcript
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  overflowY: 'auto',
                  p: 2,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                }}>
                  {isRecording ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      animation: 'fadeIn 0.3s ease-in-out'
                    }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        bgcolor: '#00bfa5', 
                        borderRadius: '50%',
                        mr: 1.5,
                        flexShrink: 0,
                        animation: 'pulse 2s infinite'
                      }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          AI: What are your greatest strengths?
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 0.5 }}>
                          Just now
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontStyle: 'italic'
                    }}>
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
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default AIInterview;
