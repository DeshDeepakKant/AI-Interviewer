// components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoute = () => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setIsValid(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

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
