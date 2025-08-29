import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("jwt");

  return token ? <Navigate to="/dashboard" /> : <Layout/>;
};

export default PublicRoute;
