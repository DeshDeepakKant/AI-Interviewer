import React, { memo, useMemo } from "react";
import { Button } from "@mui/material";

const GlowingButton = memo((props) => {
  const { name, icon: Icon, component, to, ...otherProps } = props;

  // Memoize styles to prevent recreation on every render
  const buttonStyles = useMemo(() => ({
    background: 'linear-gradient(45deg, #00c7ae, #00bcd4)',
    color: 'white',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }, // Responsive font size
    px: { xs: 3, sm: 4 }, // Responsive horizontal padding
    py: { xs: 1.2, sm: 1.5 }, // Responsive vertical padding
    borderRadius: 3,
    boxShadow: '0 4px 20px rgba(0, 199, 174, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform, box-shadow',
    width: { xs: '100%', sm: 'auto' }, // Full width on mobile
    maxWidth: { xs: '280px', sm: 'none' }, // Max width on mobile
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 199, 174, 0.4)',
      background: 'linear-gradient(45deg, #00d7bd, #00ccff)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      transition: 'left 0.5s ease',
      pointerEvents: 'none',
    },
    '&:hover::before': {
      left: '100%',
    },
  }), []);

  const iconStyles = useMemo(() => ({ 
    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }, // Responsive icon size
    transition: 'transform 0.3s ease',
  }), []);

  return (
    <Button 
      variant="contained" 
      size="large"
      component={component}
      to={to}
      startIcon={Icon && <Icon sx={iconStyles} />}
      sx={buttonStyles}
      {...otherProps}
    >
      {name}
    </Button>
  );
});

GlowingButton.displayName = 'GlowingButton';

export default GlowingButton;