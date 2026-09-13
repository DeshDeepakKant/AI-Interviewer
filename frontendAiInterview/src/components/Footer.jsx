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
        backgroundColor: "var(--dark-bg)",
        borderTop: "2px solid #111111",
        color: "#111111",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.02em",
                color: "#111111",
              }}
            >
              AI INTERVIEWER DOSSIER // SYS.VER.2.4
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: "#555555",
                fontSize: "0.75rem",
                display: "block",
                mt: 0.5,
              }}
            >
              © {new Date().getFullYear()} CANDIDATE EVALUATION ENGINE. ALL RIGHTS RESERVED.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 3 },
              alignItems: "center",
            }}
          >
            <MuiLink
              href="#"
              variant="body2"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: "#111111",
                textDecoration: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                "&:hover": {
                  color: "#0044CC",
                  textDecoration: "underline",
                },
                transition: "color 0.15s ease",
              }}
            >
              PRIVACY PROTOCOL
            </MuiLink>
            
            <Typography
              component="span"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: "#888888",
                fontSize: "0.8rem",
              }}
            >
              /
            </Typography>

            <MuiLink
              href="#"
              variant="body2"
              sx={{
                fontFamily: '"Courier New", Courier, monospace',
                color: "#111111",
                textDecoration: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                "&:hover": {
                  color: "#0044CC",
                  textDecoration: "underline",
                },
                transition: "color 0.15s ease",
              }}
            >
              TERMS OF SERVICE
            </MuiLink>

            <Box sx={{ display: "flex", gap: 1, ml: { xs: 0, sm: 1 } }}>
              <IconButton
                href="https://github.com/DeshDeepakKant/AI-Interviewer"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                aria-label="GitHub Repository"
                sx={{
                  color: "#111111",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #111111",
                  borderRadius: 0,
                  boxShadow: "2px 2px 0 #111111",
                  width: 32,
                  height: 32,
                  transition: "all 0.1s ease",
                  "&:hover": {
                    backgroundColor: "#111111",
                    color: "#FFFFFF",
                    boxShadow: "1px 1px 0 #111111",
                    transform: "translate(1px, 1px)",
                  },
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton
                href="https://www.linkedin.com/in/deshdeepakkant/"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                aria-label="LinkedIn Profile"
                sx={{
                  color: "#111111",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #111111",
                  borderRadius: 0,
                  boxShadow: "2px 2px 0 #111111",
                  width: 32,
                  height: 32,
                  transition: "all 0.1s ease",
                  "&:hover": {
                    backgroundColor: "#111111",
                    color: "#FFFFFF",
                    boxShadow: "1px 1px 0 #111111",
                    transform: "translate(1px, 1px)",
                  },
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
