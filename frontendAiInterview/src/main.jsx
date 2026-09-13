import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme.js";
import "./index.css";
import App from "./App.jsx";
// Initialize axios interceptor for automatic token refresh
import "./utils/axiosInterceptor.js";
import {
  RouterProvider,
  createBrowserRouter,
  Route,
  createRoutesFromElements,
} from "react-router";
import HomePage from "./components/Homepage.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./components/LoginPage.jsx";
import AIInterview from "./components/AIInterview.jsx";
// import LayoutWithoutFooter from "./components/LayoutWithoutFooter.jsx";
import Features from "./components/Features.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import EmployerDashboard from "./components/EmployerDashboard.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MockInterviewWay from "./components/MockInterviewWay.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route path="" element={<HomePage />} />
        <Route path="features" element={<Features />} />
        
        <Route element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="mockInterviewWay" element={<MockInterviewWay />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="employer" element={<EmployerDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="interview" element={<AIInterview />} />
      </Route>
    </>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            backgroundColor: "#FFFFFF",
            color: "#111111",
            border: "1px solid #111111",
            borderRadius: 0,
            boxShadow: "4px 4px 0 #111111",
            fontFamily: '"Courier New", Courier, monospace',
          }}
        />
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);