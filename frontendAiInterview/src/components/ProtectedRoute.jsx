import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
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
          backgroundColor: '#ECECE9',
          color: '#111111',
          p: 3,
        }}
      >
        <Box
          sx={{
            p: 4,
            backgroundColor: '#FFFFFF',
            border: '2px solid #111111',
            boxShadow: '6px 6px 0 #111111',
            textAlign: 'center',
            maxWidth: 380,
            width: '100%',
          }}
        >
          <CircularProgress 
            size={40} 
            thickness={4}
            sx={{ 
              color: '#0044CC',
              mb: 2.5 
            }} 
          />
          <Typography
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: '#0044CC',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            [ AUTHENTICATION VERIFICATION ]
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              color: '#555555',
              fontSize: '0.85rem',
            }}
          >
            Validating session tokens and access permissions...
          </Typography>
        </Box>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
