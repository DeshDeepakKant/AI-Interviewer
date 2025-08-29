import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

export const useAuthActions = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.logout();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
      navigate("/login"); // Force navigation even on error
    }
  };

  const requireAuth = () => {
    if (!auth.isAuthenticated) {
      toast.error("Please log in to access this feature");
      navigate("/login");
      return false;
    }
    return true;
  };

  return {
    ...auth,
    handleLogout,
    requireAuth,
  };
};
