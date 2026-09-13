import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const fieldStyle = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    backgroundColor: "#FFFFFF",
    color: "#111111",
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: "0.95rem",
    "& fieldset": {
      borderColor: "#111111",
      borderWidth: "1px",
      transition: "border-color 0.15s ease",
    },
    "&:hover fieldset": {
      borderColor: "#0044CC",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0044CC",
      borderWidth: "2px",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset",
      WebkitTextFillColor: "#111111",
      caretColor: "#111111",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset",
      WebkitTextFillColor: "#111111",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#555555",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontWeight: 600,
    fontSize: "0.9rem",
    "&.Mui-focused": {
      color: "#0044CC",
    },
  },
  "& .MuiFormHelperText-root": {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#D32F2F",
    mt: 0.5,
  },
};

function LoginForm({ onShowPassword, showPassword }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginInfo, setLoginInfo] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    emailOrUsername: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const fillDemo = (identifier, password) => {
    setLoginInfo({
      emailOrUsername: identifier,
      password: password,
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!loginInfo.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required.";
    }

    if (!loginInfo.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const loginPromise = new Promise(async (resolve, reject) => {
        try {
          const payload = {
            username: loginInfo.emailOrUsername,
            email: loginInfo.emailOrUsername,
            password: loginInfo.password,
          };
          const api = import.meta.env.VITE_BACKEND_URL + "/api/v1/user/login";
          const response = await axios.post(api, payload, {
            withCredentials: true,
          });

          if (response.data.success) {
            const { user, accessToken, refreshToken } = response.data.data;

            if (accessToken) {
              localStorage.setItem("accessToken", accessToken);
            }
            if (refreshToken) {
              localStorage.setItem("refreshToken", refreshToken);
            }

            const loggedInUser = user || response.data.data?.user || response.data.data;
            login(loggedInUser);
            resolve(response.data);
            if (loggedInUser?.role === "employer" || loggedInUser?.role === "admin") {
              navigate("/employer");
            } else {
              navigate("/dashboard");
            }
          } else {
            reject(new Error(response.data.message || "Authentication failed."));
          }
        } catch (error) {
          reject(error.response?.data?.message || "Invalid credentials or system error.");
        }
      });

      toast.promise(loginPromise, {
        pending: "Verifying credentials...",
        success: {
          render() {
            return "Authentication verified. Access granted.";
          },
        },
        error: {
          render({ data }) {
            return data || "Authentication failed.";
          },
        },
      });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      noValidate
    >
      <TextField
        label="Email or Username"
        variant="outlined"
        fullWidth
        onChange={handleChange}
        name="emailOrUsername"
        autoComplete="username"
        required
        value={loginInfo.emailOrUsername}
        error={!!errors.emailOrUsername}
        helperText={errors.emailOrUsername}
        sx={fieldStyle}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 1.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 0,
                  backgroundColor: "#F6F6F4",
                  border: "1px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111111",
                }}
              >
                <EmailIcon sx={{ fontSize: 17 }} />
              </Box>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        name="password"
        onChange={handleChange}
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={loginInfo.password}
        error={!!errors.password}
        required
        helperText={errors.password}
        sx={fieldStyle}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 1.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 0,
                  backgroundColor: "#F6F6F4",
                  border: "1px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111111",
                }}
              >
                <LockIcon sx={{ fontSize: 17 }} />
              </Box>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onShowPassword} edge="end" size="small" sx={{ color: "#111111", borderRadius: 0 }}>
                {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        fullWidth
        variant="contained"
        type="submit"
        size="large"
        sx={{
          mt: 2,
          borderRadius: 0,
          backgroundColor: "#111111",
          color: "#FFFFFF",
          border: "1px solid #111111",
          boxShadow: "4px 4px 0 #111111",
          py: 1.6,
          fontWeight: 800,
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontSize: "0.9rem",
          transition: "all 0.1s ease",
          "&:hover": {
            backgroundColor: "#0044CC",
            borderColor: "#0044CC",
            boxShadow: "2px 2px 0 #111111",
            transform: "translate(2px, 2px)",
          },
        }}
        endIcon={<LoginIcon />}
      >
        Authenticate & Sign In
      </Button>

      {/* Quick Demo Access Bar */}
      <Box sx={{ mt: 3.5, pt: 2.5, borderTop: "1px dashed #CCCCCC" }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Courier New", Courier, monospace',
            fontWeight: 800,
            fontSize: "0.75rem",
            color: "#0044CC",
            display: "block",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          [ PRE-CONFIGURED DEMO CREDENTIALS ]
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1 }}>
          <Button
            size="small"
            type="button"
            onClick={() => fillDemo("alex", "StudentPass123!")}
            sx={{
              borderRadius: 0,
              border: "1px solid #111111",
              boxShadow: "2px 2px 0 #111111",
              color: "#111111",
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: "0.72rem",
              fontWeight: 800,
              py: 1,
              px: 1,
              backgroundColor: "#FFFFFF",
              textAlign: "center",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#111111",
                color: "#FFFFFF",
                boxShadow: "1px 1px 0 #111111",
                transform: "translate(1px, 1px)",
              },
            }}
          >
            Candidate (Alex)
          </Button>
          <Button
            size="small"
            type="button"
            onClick={() => fillDemo("sarah", "EmployerPass123!")}
            sx={{
              borderRadius: 0,
              border: "1px solid #111111",
              boxShadow: "2px 2px 0 #111111",
              color: "#FFFFFF",
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: "0.72rem",
              fontWeight: 800,
              py: 1,
              px: 1,
              backgroundColor: "#0044CC",
              borderColor: "#0044CC",
              textAlign: "center",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#003399",
                boxShadow: "1px 1px 0 #111111",
                transform: "translate(1px, 1px)",
              },
            }}
          >
            Recruiter (Sarah)
          </Button>
          <Button
            size="small"
            type="button"
            onClick={() => fillDemo("david", "AdminPass123!")}
            sx={{
              borderRadius: 0,
              border: "1px solid #111111",
              boxShadow: "2px 2px 0 #111111",
              color: "#111111",
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: "0.72rem",
              fontWeight: 800,
              py: 1,
              px: 1,
              backgroundColor: "#FFFFFF",
              textAlign: "center",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#111111",
                color: "#FFFFFF",
                boxShadow: "1px 1px 0 #111111",
                transform: "translate(1px, 1px)",
              },
            }}
          >
            Admin (David)
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function SignupForm({ onShowPassword, showPassword }) {
  const navigate = useNavigate();
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [signupInfo, setSignupInfo] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (shouldNavigate) {
      const loginPath = "/login";
      navigate(loginPath, { replace: true });
      const timer = setTimeout(() => {
        window.location.pathname = loginPath;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [shouldNavigate, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const signupPromise = new Promise(async (resolve, reject) => {
      try {
        const payload = { ...signupInfo };
        const api = import.meta.env.VITE_BACKEND_URL + "/api/v1/user/signUp";
        const response = await axios.post(api, payload, {
          withCredentials: true,
        });

        if (response.data.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.data.message || "Registration failed."));
        }
      } catch (error) {
        reject(error.response?.data?.message || "Registration error occurred.");
      }
    });

    toast.promise(signupPromise, {
      pending: "Registering candidate dossier...",
      success: {
        render() {
          setShouldNavigate(true);
          return "Account created successfully. Redirecting to sign in...";
        },
      },
      error: {
        render({ data }) {
          return data || "Registration failed.";
        },
      },
    });
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      noValidate
    >
      <TextField
        label="Full Name"
        variant="outlined"
        fullWidth
        name="fullName"
        required
        onChange={handleChange}
        autoComplete="name"
        sx={fieldStyle}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 1.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 0,
                  backgroundColor: "#F6F6F4",
                  border: "1px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111111",
                }}
              >
                <PersonIcon sx={{ fontSize: 17 }} />
              </Box>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Username"
        name="username"
        variant="outlined"
        required
        fullWidth
        onChange={handleChange}
        autoComplete="username"
        sx={fieldStyle}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 1.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 0,
                  backgroundColor: "#F6F6F4",
                  border: "1px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111111",
                }}
              >
                <BadgeIcon sx={{ fontSize: 17 }} />
              </Box>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Email Address"
        required
        variant="outlined"
        fullWidth
        name="email"
        onChange={handleChange}
        autoComplete="email"
        sx={fieldStyle}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 1.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 0,
                  backgroundColor: "#F6F6F4",
                  border: "1px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111111",
                }}
              >
                <EmailIcon sx={{ fontSize: 17 }} />
              </Box>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Password"
        variant="outlined"
        required
        fullWidth
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        sx={fieldStyle}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 1.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 0,
                  backgroundColor: "#F6F6F4",
                  border: "1px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111111",
                }}
              >
                <LockIcon sx={{ fontSize: 17 }} />
              </Box>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onShowPassword} edge="end" size="small" sx={{ color: "#111111", borderRadius: 0 }}>
                {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        fullWidth
        variant="contained"
        type="submit"
        size="large"
        sx={{
          mt: 2,
          borderRadius: 0,
          backgroundColor: "#0044CC",
          color: "#FFFFFF",
          border: "1px solid #111111",
          boxShadow: "4px 4px 0 #111111",
          py: 1.6,
          fontWeight: 800,
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontSize: "0.9rem",
          transition: "all 0.1s ease",
          "&:hover": {
            backgroundColor: "#003399",
            borderColor: "#111111",
            boxShadow: "2px 2px 0 #111111",
            transform: "translate(2px, 2px)",
          },
        }}
        endIcon={<PersonAddIcon />}
      >
        Register Candidate Dossier
      </Button>
    </Box>
  );
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "signup") {
      setTab(1);
    } else {
      setTab(0);
    }
  }, [searchParams]);

  const onTabChange = (e, v) => {
    setTab(v);
    setShowPassword(false);
  };

  const togglePwd = () => setShowPassword((p) => !p);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 6, sm: 8 },
        px: 2,
        backgroundColor: "var(--dark-bg)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: { xs: 3, sm: 4.5 },
          backgroundColor: "#FFFFFF",
          border: "2px solid #111111",
          borderRadius: 0,
          boxShadow: "6px 6px 0 #111111",
          position: "relative",
        }}
      >
        {/* Terminal Header Eyebrow */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #111111",
            pb: 1.5,
            mb: 2.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: "#0044CC",
              textTransform: "uppercase",
            }}
          >
            [AUTH-TERMINAL // PROTO-2026]
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              color: "#777777",
              fontSize: "0.75rem",
              textTransform: "uppercase",
            }}
          >
            SECURE ACCESS
          </Typography>
        </Box>

        {/* Heading */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            fontSize: "1.75rem",
            letterSpacing: "-0.03em",
            color: "#111111",
            textTransform: "uppercase",
            mb: 0.5,
          }}
        >
          {tab === 0 ? "Candidate Access" : "Create Dossier"}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Courier New", Courier, monospace',
            color: "#555555",
            fontSize: "0.82rem",
            mb: 3,
            lineHeight: 1.4,
          }}
        >
          {tab === 0
            ? "Sign in with your credentials to access interview telemetry and scorecards."
            : "Register a new profile to calibrate question difficulty and track performance."}
        </Typography>

        {/* Segmented Switch Tabs */}
        <Tabs
          value={tab}
          onChange={onTabChange}
          variant="fullWidth"
          sx={{
            mb: 3,
            border: "1px solid #111111",
            backgroundColor: "#ECECE9",
            p: 0.5,
            minHeight: 42,
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            label="01. Sign In"
            sx={{
              borderRadius: 0,
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.05em",
              color: tab === 0 ? "#FFFFFF !important" : "#111111",
              backgroundColor: tab === 0 ? "#111111" : "transparent",
              minHeight: 34,
              py: 0.8,
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: tab === 0 ? "#111111" : "rgba(0,0,0,0.05)",
              },
            }}
          />
          <Tab
            label="02. Create Account"
            sx={{
              borderRadius: 0,
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.05em",
              color: tab === 1 ? "#FFFFFF !important" : "#111111",
              backgroundColor: tab === 1 ? "#111111" : "transparent",
              minHeight: 34,
              py: 0.8,
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: tab === 1 ? "#111111" : "rgba(0,0,0,0.05)",
              },
            }}
          />
        </Tabs>

        {/* Active Form */}
        {tab === 0 ? (
          <LoginForm onShowPassword={togglePwd} showPassword={showPassword} />
        ) : (
          <SignupForm onShowPassword={togglePwd} showPassword={showPassword} />
        )}
      </Paper>
    </Box>
  );
}