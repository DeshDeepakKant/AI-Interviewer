import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";

const PublicRoute = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (isLoading || !isInitialized) {
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
          Loading...
        </Typography>
      </Box>
    );
  }


  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
