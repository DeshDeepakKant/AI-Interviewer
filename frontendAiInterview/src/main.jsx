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
import HomePage from "./components/homepage.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./components/loginPage.jsx";
import Testing from "./components/testing.jsx";
import AIInterview from "./components/AIInterview.jsx";
import LayoutWithoutFooter from "./components/LayoutWithoutFooter.jsx";
import Features from "./components/Features.jsx";
import Pricing from "./components/Pricing.jsx";
import ComingSoong from "./components/ComingSoong.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {" "}
      {/* Add this wrapper */}
      <Route path="/" element={<Layout />}>
        <Route path="" element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="testing" element={<Testing />} />
        <Route path="features" element={<Features />} />
        <Route path="comingSoon" element={<ComingSoong />} />
        <Route path="dashboard" element={<UserDashboard />} />
      </Route>
      <Route path="/interview" element={<LayoutWithoutFooter />}>
        <Route index element={<AIInterview />} />
      </Route>
      <Route path="/pricing" element={<LayoutWithoutFooter />}>
        <Route index element={<Pricing />} />
      </Route>
    </>, // Close the wrapper
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
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
    </>
  </StrictMode>,
);

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
