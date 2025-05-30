import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';

const MockInterview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const startInterview = async () => {
      try {
        const sessionId = searchParams.get('sessionId') || localStorage.getItem('interviewSessionId');
        
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Get the authentication token
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        // Call the aiStart endpoint
        await axios.post(
          '/api/v1/ai/aiStart',
          {
            sessionId,
            answer: "Let's Start Interview"
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // If successful, you can navigate to the actual interview interface
        // or update the state to show the interview UI
        
      } catch (error) {
        console.error('Error starting interview:', error);
        setError(error.response?.data?.message || 'Failed to start interview');
      } finally {
        setIsLoading(false);
      }
    };

    startInterview();
  }, [searchParams]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="body1" ml={2}>Starting your interview...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
        <button onClick={() => navigate('/')}>Go Back</button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4">Mock Interview</Typography>
      {/* Add your interview interface components here */}
    </Box>
  );
};

export default MockInterview;
