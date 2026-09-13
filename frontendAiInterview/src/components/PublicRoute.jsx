import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";

const PublicRoute = () => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

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
            [ INITIALIZING ENVIRONMENT ]
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              color: '#555555',
              fontSize: '0.85rem',
            }}
          >
            Synchronizing telemetry with local runtime...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isAuthenticated) {
    if (user?.role === "employer" || user?.role === "admin") {
      return <Navigate to="/employer" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
