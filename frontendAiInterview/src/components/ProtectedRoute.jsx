// components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, CircularProgress, Typography } from "@mui/material";
import { clearAllUserData, setUserData } from "../utils/auth";

const ProtectedRoute = () => {
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        setIsLoading(true);
        
        // ALWAYS verify with server first - this is the secure approach
        const response = await axios.get("/api/v1/user/currentUser", {
          withCredentials: true, // This sends HTTP-only cookies
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        });

        if (response.status === 200 && response.data.success) {
          // Server confirms user is authenticated
          const userData = response.data.data;
          
          // Update localStorage with fresh data from server using utility
          setUserData(userData);
          
          setIsValid(true);
        } else {
          // Server says user is not authenticated
          // Clear ALL user-related localStorage data using utility
          clearAllUserData();
          
          setIsValid(false);
        }
      } catch (err) {
        console.error('Authentication verification failed:', err);
        
        // Clear ALL stale localStorage data on authentication failure using utility
        clearAllUserData();
        
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuthentication();
  }, []);

  if (isLoading || isValid === null) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(-45deg, #0a0f1a, #1a1a2e, #16213e, #0d1b2a)',
          color: '#ffffff',
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: '#00bfa5',
            mb: 2 
          }} 
        />
        <Typography variant="h6" sx={{ opacity: 0.8 }}>
          Verifying authentication...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>
          Checking with server for security
        </Typography>
      </Box>
    );
  }
  
  if (!isValid) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
