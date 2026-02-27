import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Box, Typography, Paper, Grid, Link, 
  List, ListItem, ListItemIcon, ListItemText, InputAdornment, IconButton, Alert
} from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Styled Components
const BackgroundBox = styled(Box)({
  height: '100vh',
  backgroundImage: 'url(https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
});

const LoginPaper = styled(Paper)({
  padding: '40px',
  width: '100%',
  maxWidth: '450px',
  zIndex: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '12px',
  maxHeight: '90vh',
  overflowY: 'auto'
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  // Validation State
  const [validations, setValidations] = useState({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    hasLength: false
  });

  useEffect(() => {
    setValidations({
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasLength: password.length >= 8
    });
  }, [password]);

  const isPasswordValid = Object.values(validations).every(Boolean);
  const doPasswordsMatch = password === confirmPassword;

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhone(value);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      if (!isPasswordValid) {
        alert("Please ensure your password meets all requirements.");
        return;
      }
      if (!doPasswordsMatch) {
        alert("Passwords do not match!");
        return;
      }
    }

    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin 
      ? { email, password }
      : { firstName, lastName, email, phone, address, password };

    try {
      const res = await axios.post(`http://localhost:5000/api/auth${endpoint}`, payload);
      
      if (isLogin) {
        alert("Login Successful!");
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        
        // --- THE FIX: Routing Admins/Staff to their specific Command Center! ---
        const userRole = res.data.role;
        
        if (userRole === 'owner') {
            navigate('/owner-dashboard');      
        } else if (userRole === 'admin' || userRole === 'staff') {
            navigate('/admin-dashboard');
        } else {
            navigate('/dashboard'); 
        }

      } else {
        alert("Registration Successful! Please Login.");
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }

    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const ValidationItem = ({ valid, text }) => (
    <ListItem dense sx={{ py: 0 }}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        {valid ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
      </ListItemIcon>
      <ListItemText 
        primary={text} 
        primaryTypographyProps={{ 
          variant: 'caption', 
          color: valid ? 'success.main' : 'error.main',
          fontWeight: valid ? 'bold' : 'regular'
        }} 
      />
    </ListItem>
  );

  return (
    <BackgroundBox>
      <Overlay />
      
      <LoginPaper elevation={10}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ fontFamily: 'Oswald' }}>
            RED BRICK
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            HEAVY EQUIPMENT RENTALS
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  fullWidth label="First Name" margin="normal" required size="small"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} 
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  fullWidth label="Last Name" margin="normal" required size="small"
                  value={lastName} onChange={(e) => setLastName(e.target.value)} 
                />
              </Grid>
            </Grid>
          )}

          {!isLogin && (
             <>
               <TextField 
                 fullWidth label="Phone Number" margin="normal" required size="small"
                 value={phone} 
                 onChange={handlePhoneChange} 
                 inputProps={{ maxLength: 11 }} 
               />
               <TextField 
                 fullWidth label="Address" margin="normal" required size="small"
                 value={address} onChange={(e) => setAddress(e.target.value)} 
               />
             </>
          )}

          <TextField 
            fullWidth label="Email Address" margin="normal" type="email" required size="small"
            value={email} onChange={(e) => setEmail(e.target.value)} 
          />
          
          <TextField 
            fullWidth 
            label="Password" 
            margin="normal" 
            type={showPassword ? 'text' : 'password'} 
            required 
            size="small"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            error={!isLogin && !isPasswordValid && password.length > 0}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {!isLogin && (
            <TextField 
              fullWidth 
              label="Confirm Password" 
              margin="normal" 
              type="password"
              required 
              size="small"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              error={confirmPassword.length > 0 && !doPasswordsMatch}
              helperText={confirmPassword.length > 0 && !doPasswordsMatch ? "Passwords do not match" : ""}
            />
          )}

          {!isLogin && (
            <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold" sx={{ ml: 1 }}>
                Password Requirements:
              </Typography>
              <List dense>
                <ValidationItem valid={validations.hasLength} text="At least 8 characters" />
                <ValidationItem valid={validations.hasUpper} text="One Uppercase letter (A-Z)" />
                <ValidationItem valid={validations.hasLower} text="One Lowercase letter (a-z)" />
                <ValidationItem valid={validations.hasNumber} text="One Number (0-9)" />
                <ValidationItem valid={validations.hasSpecial} text="One Special Character (!@#...)" />
                <ValidationItem valid={doPasswordsMatch && confirmPassword.length > 0} text="Passwords Match" />
              </List>
            </Box>
          )}

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large"
            disabled={!isLogin && (!isPasswordValid || !doPasswordsMatch)}
            sx={{ mt: 3, mb: 2, fontWeight: 'bold', backgroundColor: '#1a237e' }}
          >
            {isLogin ? 'LOGIN' : 'REGISTER'}
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link 
              component="button" 
              variant="body2" 
              fontWeight="bold"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </Link>
          </Typography>
        </Box>

      </LoginPaper>
    </BackgroundBox>
  );
}