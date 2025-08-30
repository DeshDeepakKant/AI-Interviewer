import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Link as MuiLink,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: "auto",
        position: "relative",
        zIndex: 2,
        background: "rgba(10, 15, 26, 0.95)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        color: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            © {new Date().getFullYear()} AI Interviewer
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <MuiLink
              href="#"
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                textDecoration: "none",
                "&:hover": {
                  color: "#00e5c9",
                  textDecoration: "underline",
                },
                transition: "all 0.2s",
                px: 1,
                fontSize: "0.875rem",
              }}
            >
              Privacy
            </MuiLink>
            <Box sx={{ color: "rgba(255, 255, 255, 0.3)" }}>•</Box>
            <MuiLink
              href="#"
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                textDecoration: "none",
                "&:hover": {
                  color: "#00e5c9",
                  textDecoration: "underline",
                },
                transition: "all 0.2s",
                px: 1,
                fontSize: "0.875rem",
              }}
            >
              Terms
            </MuiLink>
            <Box sx={{ color: "rgba(255, 255, 255, 0.1)" }}>•</Box>
            <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
              <IconButton
                href="https://github.com/DeshDeepakKant/AI-Interviewer"
                target="_blank"
                size="small"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    color: "#00e5c9",
                    background: "rgba(0, 229, 201, 0.15)",
                  },
                  transition: "all 0.2s",
                  width: 32,
                  height: 32,
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton
                href="https://www.linkedin.com/in/deshdeepakkant/"
                target="_blank"
                size="small"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    color: "#00e5c9",
                    background: "rgba(0, 229, 201, 0.15)",
                  },
                  transition: "all 0.2s",
                  width: 32,
                  height: 32,
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
