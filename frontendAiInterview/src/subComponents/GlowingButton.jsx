import {Button} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from '@mui/icons-material/School';

function GlowingButton(props) {
return <Button 
variant="contained" 
size="large"
component={props.component}
to={props.to}
startIcon={
  <props.icon sx={{ 
    fontSize: '1.3rem',
    transition: 'transform 0.3s ease',
    'button:hover &': {
      transform: 'scale(1.1)'
    }
  }} />
}
sx={{
  background: 'linear-gradient(45deg, #00c7ae, #00bcd4)',
  color: 'white',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1.1rem',
  px: 4,
  py: 1.5,
  borderRadius: 3,
  boxShadow: '0 4px 20px rgba(0, 199, 174, 0.3)',
  position: 'relative',
  overflow: 'hidden',
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
    transition: '0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}}
>
{props.name}
</Button>
}  

export default GlowingButton