import React, { useState, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Fade,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Visibility,
  VisibilityOff,
  Login,
  PersonAdd,
  Email,
  Person,
  Badge,
  Lock,
} from "@mui/icons-material";
import { useSearchParams } from "react-router";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
// Dark theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1de9b6" },
    secondary: { main: "#00bfa5" },
    background: { default: "#0a0f1a" },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    button: { textTransform: "none" },
  },
  shape: { borderRadius: 10 },
});

const tabVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.2)",
      transition: "border-color 0.3s ease",
    },
    "&:hover fieldset": {
      borderColor: "rgba(29,233,182,0.7)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1de9b6",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px rgba(255,255,255,0.05) inset",
      WebkitTextFillColor: "white",
      caretColor: "white",
      borderRadius: 10,
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: "0 0 0 1000px rgba(255,255,255,0.05) inset",
      WebkitTextFillColor: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.7)",
    "&.Mui-focused": {
      color: "#1de9b6",
    },
  },
  "& .MuiOutlinedInput-input": {
    color: "white",
    "&:-webkit-autofill": {
      transition: "background-color 5000s ease-in-out 0s",
      WebkitBoxShadow: "0 0 0 1000px rgba(255,255,255,0.05) inset",
      WebkitTextFillColor: "white",
    },
  },
};

function LoginForm({ onShowPassword, showPassword }) {
  const navigate = useNavigate();

  const [loginInfo, setLogInfio] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    emailOrUsername: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    const copyLoginInfo = { ...loginInfo };
    copyLoginInfo[name] = value;
    setLogInfio(copyLoginInfo);
    if (value.trim() !== "") {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Validate email/username
    if (!loginInfo.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required.";
    }

    // Validate password
    if (!loginInfo.password) {
      newErrors.password = "This field is required.";
    }

    setErrors(newErrors);

    // If no errors, proceed
    if (Object.keys(newErrors).length === 0) {
      const loginPromise = new Promise(async (resolve, reject) => {
        try {
          const payload = {
            username: loginInfo.emailOrUsername,
            email: loginInfo.emailOrUsername,
            password: loginInfo.password,
          };
          const api = "https://backend-ai-interview.vercel.app/api/v1/user/login";
          const response = await axios.post(api, payload, {
            withCredentials: true,
          });
          
          if (response.data.success) {
            resolve(response.data);
            navigate("/interview");
          } else {
            reject(new Error(response.data.message || "Login failed"));
          }
        } catch (error) {
          reject(new Error(error.response?.data?.message || "Something went wrong."));
        }
      });

      toast.promise(loginPromise, {
        pending: 'Logging in...',
        success: {
          render({ data }) {
            return `Welcome back!`;
          },
          icon: '🟢',
        },
        error: {
          render({ data }) {
            return data?.message || 'Login failed. Please try again.';
          },
          icon: '🔴',
        },
      });
    }
  };
  return (
    <Fade in timeout={400}>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Box
          component={motion.div}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          sx={{ mt: 1 }}
        >
          <TextField
            label="Email or Username"
            variant="outlined"
            fullWidth
            margin="dense"
            onChange={handleChange}
            name="emailOrUsername"
            autoComplete="email"
            required
            value={loginInfo.emailOrUsername}
            error={!!errors.emailOrUsername}
            helperText={errors.emailOrUsername}
            sx={fieldStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="dense"
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
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onShowPassword}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{
              mt: 3,
              borderRadius: 16,
              boxShadow: "0 0 20px rgba(29,233,182,0.5)",
            }}
            endIcon={<Login />}
            type="submit"
          >
            Login
          </Button>
        </Box>
      </Box>
    </Fade>
  );
}

function SignupForm({ onShowPassword, showPassword }) {
  return (
    <Fade in timeout={400}>
      <Box
        component={motion.div}
        variants={tabVariants}
        initial="initial"
        animate="animate"
        sx={{ mt: 1 }}
      >
        <TextField
          label="Full Name"
          variant="outlined"
          fullWidth
          margin="dense"
          autoComplete="name"
          sx={fieldStyle}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="User Name"
          variant="outlined"
          fullWidth
          margin="dense"
          autoComplete="username"
          sx={fieldStyle}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Badge />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          margin="dense"
          autoComplete="email"
          sx={fieldStyle}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="dense"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          sx={fieldStyle}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onShowPassword}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            mt: 3,
            borderRadius: 16,
            boxShadow: "0 0 20px rgba(0,191,165,0.5)",
          }}
          endIcon={<PersonAdd />}
        >
          Create Account
        </Button>
      </Box>
    </Fade>
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#0a0f1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          pt: "80px",
          pb: 2,
          px: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "60vw",
            height: "60vw",
            background:
              "radial-gradient(circle at center, #00bfa5, transparent 70%)",
            filter: "blur(200px)",
            zIndex: 1,
          },
        }}
      >
        <Paper
          component={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          sx={{
            position: "relative",
            zIndex: 2,
            p: { xs: 3, sm: 5 },
            width: { xs: "90vw", sm: 380 },
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            boxShadow: "0 0 60px rgba(29,233,182,0.4)",
            border: "1px solid rgba(29,233,182,0.5)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{ color: "#fff", mb: 2, fontWeight: 600 }}
          >
            {tab === 0 ? "Login" : "Signup"}
          </Typography>
          <Tabs
            value={tab}
            onChange={onTabChange}
            variant="fullWidth"
            sx={{
              mb: 2,
              "& .MuiTabs-indicator": {
                backgroundColor: "#1de9b6",
                height: 4,
                borderRadius: 2,
              },
            }}
          >
            <Tab label="Login" sx={{ color: "rgba(255,255,255,0.7)" }} />
            <Tab label="Sign Up" sx={{ color: "rgba(255,255,255,0.7)" }} />
          </Tabs>
          {tab === 0 ? (
            <LoginForm onShowPassword={togglePwd} showPassword={showPassword} />
          ) : (
            <SignupForm
              onShowPassword={togglePwd}
              showPassword={showPassword}
            />
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
