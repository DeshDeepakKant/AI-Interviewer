// components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoute = () => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(
          "https://backend-ai-interview.vercel.app/api/v1/user/verify-token",
          { withCredentials: true } // ✅ Send cookies
        );
        setIsValid(response.data.valid);
      } catch (err) {
        setIsValid(false);
      }
    };

    verifyToken();
  }, []);

  if (isValid === null) return <div>Loading...</div>;
  if (!isValid) return <Navigate to="/login" />;

  return <Outlet />;
};

export default ProtectedRoute;
