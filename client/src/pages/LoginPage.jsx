import React, { useState, useEffect, useRef } from 'react';
import { 
  TextField, Button, Box, Typography, Paper, Grid, Link, 
  List, ListItem, ListItemIcon, ListItemText, InputAdornment, IconButton, 
  Snackbar, Alert, CircularProgress, Avatar 
} from '@mui/material';
import { styled } from '@mui/system';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ReCAPTCHA from "react-google-recaptcha";

const BackgroundBox = styled(Box)({
  height: '100vh',
  backgroundImage: 'url(https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
});

const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
});

const LoginPaper = styled(Paper)({
  padding: '40px',
  width: '100%',
  maxWidth: '480px',
  zIndex: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  borderRadius: '16px',
  maxHeight: '92vh',
  overflowY: 'auto',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
});

export default function LoginPage() {
  const navigate = useNavigate();
  const recaptchaRef = useRef();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [validations, setValidations] = useState({
    hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false, hasLength: false
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

  const handleNotify = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotify = () => setNotification({ ...notification, open: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      handleNotify("Please complete the CAPTCHA verification.", "warning");
      return;
    }

    if (!isLogin) {
      if (!isPasswordValid) return handleNotify("Password does not meet requirements.", "error");
      if (!doPasswordsMatch) return handleNotify("Passwords do not match!", "error");
    }

    setLoading(true);
    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin 
      ? { email, password, captchaToken }
      : { firstName, lastName, email, phone, address, password, captchaToken };

    try {
      // THE FIX: Dynamically pull the API URL from Netlify, or default to localhost for dev
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${API_URL}/api/auth${endpoint}`, payload);
      
      if (isLogin) {
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        handleNotify("Login Successful! Redirecting...", "success");
        
        setTimeout(() => {
            const role = res.data.role;
            if (role === 'owner') navigate('/owner-dashboard');      
            else if (role === 'admin' || role === 'staff') navigate('/admin-dashboard');
            else navigate('/dashboard'); 
        }, 1000);
      } else {
        handleNotify("Account created! You can now log in.", "success");
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
        setCaptchaToken(null);
        if(recaptchaRef.current) recaptchaRef.current.reset();
      }
    } catch (err) {
      handleNotify(err.response?.data?.message || "An unexpected error occurred.", "error");
      setCaptchaToken(null);
      if(recaptchaRef.current) recaptchaRef.current.reset();
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ valid, text }) => (
    <ListItem dense sx={{ py: 0.2 }}>
      <ListItemIcon sx={{ minWidth: 28 }}>
        {valid ? <CheckCircleIcon color="success" sx={{ fontSize: 16 }} /> : <CancelIcon color="error" sx={{ fontSize: 16 }} />}
      </ListItemIcon>
      <ListItemText 
        primary={text} 
        primaryTypographyProps={{ variant: 'caption', color: valid ? 'success.main' : 'text.secondary', fontWeight: valid ? 'bold' : 'normal' }} 
      />
    </ListItem>
  );

  return (
    <BackgroundBox>
      <Overlay />
      
      <LoginPaper elevation={24}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar 
            src="/RedBrickLogo.png" 
            alt="Red Brick Logo" 
            sx={{ 
              width: 140, 
              height: 140, 
              mb: 2, 
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              backgroundColor: 'white',
              border: '2px solid #eee',
              '& img': { objectFit: 'contain', p: 1 } 
            }} 
          />
          <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', letterSpacing: 2 }}>
            Rental Management System
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight="900" sx={{ mb: 1, color: '#1a237e' }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isLogin ? 'Enter your credentials to access your dashboard.' : 'Fill in the details below to start renting equipment.'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name" margin="dense" required size="small" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" margin="dense" required size="small" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Grid>
            </Grid>
          )}

          {!isLogin && (
             <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
               <TextField fullWidth label="Phone" margin="dense" required size="small" value={phone} onChange={(e) => /^\d*$/.test(e.target.value) && setPhone(e.target.value)} inputProps={{ maxLength: 11 }} />
               <TextField fullWidth label="Address" margin="dense" required size="small" value={address} onChange={(e) => setAddress(e.target.value)} />
             </Box>
          )}

          <TextField fullWidth label="Email Address" margin="normal" type="email" required size="small" value={email} onChange={(e) => setEmail(e.target.value)} />
          
          <TextField 
            fullWidth label="Password" margin="normal" type={showPassword ? 'text' : 'password'} required size="small"
            value={password} onChange={(e) => setPassword(e.target.value)} 
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {!isLogin && (
            <>
              <TextField fullWidth label="Confirm Password" margin="dense" type="password" required size="small" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={confirmPassword.length > 0 && !doPasswordsMatch} />
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                <Typography variant="caption" fontWeight="bold" color="primary">Password Requirements:</Typography>
                <List dense sx={{ mt: 0.5 }}>
                  <ValidationItem valid={validations.hasLength} text="Minimum 8 characters" />
                  <ValidationItem valid={validations.hasUpper} text="Include Uppercase (A-Z)" />
                  <ValidationItem valid={validations.hasNumber} text="Include Numbers (0-9)" />
                  <ValidationItem valid={doPasswordsMatch && confirmPassword.length > 0} text="Passwords Match" />
                </List>
              </Box>
            </>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', transform: 'scale(0.9)' }}>
            <ReCAPTCHA 
              ref={recaptchaRef} 
              sitekey="6Lda3XosAAAAAGe7MOWYkgRq_CzMrl3kCQoolnDD" 
              onChange={setCaptchaToken} 
            />
          </Box>

          <Button 
            type="submit" fullWidth variant="contained" size="large"
            disabled={loading || !captchaToken || (!isLogin && (!isPasswordValid || !doPasswordsMatch))}
            sx={{ mt: 4, mb: 2, py: 1.5, fontWeight: 'bold', backgroundColor: '#1a237e', borderRadius: '8px', boxShadow: '0 4px 12px rgba(26, 35, 126, 0.3)' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? "New to Red Brick? " : "Already have an account? "}
            <Link 
              component="button" variant="body2" fontWeight="900"
              onClick={() => { setIsLogin(!isLogin); setCaptchaToken(null); if(recaptchaRef.current) recaptchaRef.current.reset(); }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </Link>
          </Typography>
        </Box>
      </LoginPaper>

      <Snackbar open={notification.open} autoHideDuration={5000} onClose={handleCloseNotify} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotify} severity={notification.severity} sx={{ width: '100%', fontWeight: 'bold', borderRadius: '8px' }} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </BackgroundBox>
  );
}