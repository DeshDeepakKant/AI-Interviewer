import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  RouterProvider,
  createBrowserRouter,
  Route,
  createRoutesFromElements,
} from "react-router";
import HomePage from "./components/Homepage.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./components/LoginPage.jsx";
import Testing from "./components/testing.jsx";
import AIInterview from "./components/AIInterview.jsx";
import LayoutWithoutFooter from "./components/LayoutWithoutFooter.jsx";
import Features from "./components/Features.jsx";
import Pricing from "./components/Pricing.jsx";
// import ComingSoon from "./components/ComingSoon.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MockInterviewWay from "./components/MockInterviewWay.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {" "}
      <Route path="/" element={<Layout />}>
        <Route path="" element={<HomePage />} />
        <Route path="testing" element={<Testing />} />
        <Route path="features" element={<Features />} />
        {/* <Route path="comingSoon" element={<ComingSoon />} /> */}
        <Route path="pricing" element={<Pricing />} />
        <Route path="mockInterviewWay" element={<MockInterviewWay />} />
        
        <Route element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="interview" element={<AIInterview />} />
        </Route>
      </Route>

      <Route path="/" element={<LayoutWithoutFooter />}>

      </Route>

    </>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
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
        theme="dark"
        toastStyle={{
          backgroundColor: "#1a1f2e",
          color: "#ffffff",
          border: "1px solid #1de9b6",
          boxShadow: "0 4px 20px rgba(29, 233, 182, 0.15)",
        }}
        progressStyle={{
          background: "linear-gradient(to right, #1de9b6, #00bfa5)",
        }}
      />
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);

