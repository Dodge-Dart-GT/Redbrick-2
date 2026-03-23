import React, { useState, useEffect, useRef } from 'react';
import { 
  TextField, Button, Box, Typography, Paper, Grid, Link, 
  List, ListItem, ListItemIcon, ListItemText, InputAdornment, IconButton, 
  Snackbar, Alert, CircularProgress, Avatar 
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import axios from '../utils/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
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

const Overlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.9)' : 'rgba(0, 0, 0, 0.65)',
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: '40px',
  width: '100%',
  maxWidth: '480px',
  zIndex: 2,
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff', 
  borderRadius: '16px',
  maxHeight: '92vh',
  overflowY: 'auto',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
}));

export default function LoginPage() {
  const theme = useTheme();
  const primaryColor = theme.palette.mode === 'dark' ? '#B22222' : '#590016';
  const primaryHover = theme.palette.mode === 'dark' ? '#8b1a1a' : '#3a000e';

  const navigate = useNavigate();
  const location = useLocation(); 
  const recaptchaRef = useRef();
  
  // Form View State
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [requires2FA, setRequires2FA] = useState(false);
  
  // Loading & Notifications
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // User Data State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA State
  const [otpCode, setOtpCode] = useState(new Array(6).fill("")); 
  const [userEmailFor2FA, setUserEmailFor2FA] = useState(''); 
  const otpRefs = useRef([]); 

  const [validations, setValidations] = useState({
    hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false, hasLength: false
  });

  useEffect(() => {
    if (location.pathname === '/signup') {
        setIsLogin(false);
    } else {
        setIsLogin(true);
    }
  }, [location.pathname]);

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

  const toggleForm = () => {
    if (isLogin) {
        navigate('/signup');
    } else {
        navigate('/login');
    }
    setCaptchaToken(null);
    setRequires2FA(false); 
    if(recaptchaRef.current) recaptchaRef.current.reset();
  };

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
      const res = await axios.post(`/api/auth${endpoint}`, payload);
      
      if (isLogin) {
        if (res.data.requires2FA) {
            setUserEmailFor2FA(res.data.email);
            setRequires2FA(true);
            handleNotify("Verification code sent to your email.", "success");
        } else {
            executeLoginRedirect(res.data);
        }
      } else {
        handleNotify("Account created! You can now log in.", "success");
        navigate('/login');
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

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    
    if (fullCode.length !== 6) {
        handleNotify("Please enter all 6 digits.", "warning");
        return;
    }

    setLoading(true);
    try {
        const res = await axios.post('/api/auth/verify-2fa', {
            email: userEmailFor2FA,
            otpCode: fullCode
        });
        executeLoginRedirect(res.data);
    } catch (err) {
        handleNotify(err.response?.data?.message || "Invalid or expired code.", "error");
        setOtpCode(new Array(6).fill("")); 
        otpRefs.current[0].focus(); 
    } finally {
        setLoading(false);
    }
  };

  const executeLoginRedirect = (userData) => {
      localStorage.setItem('userInfo', JSON.stringify(userData));
      handleNotify("Login Successful! Redirecting...", "success");
      
      setTimeout(() => {
          const role = userData.role;
          const redirectTo = location.state?.redirectTo;
          const modelData = location.state?.modelData;

          if (redirectTo) {
              navigate(redirectTo, { state: modelData });
          } else if (role === 'owner') {
              navigate('/owner-dashboard');      
          } else if (role === 'admin' || role === 'staff') {
              navigate('/admin-dashboard');
          } else {
              navigate('/dashboard'); 
          }
      }, 1000);
  };

  const handleChangeOTP = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; 
    
    const newOtp = [...otpCode];
    newOtp[index] = value.substring(value.length - 1); 
    setOtpCode(newOtp);
    
    if (value && index < 5 && otpRefs.current[index + 1]) {
        otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDownOTP = (e, index) => {
      if (e.key === "Backspace" && !otpCode[index] && index > 0) {
          otpRefs.current[index - 1].focus();
      }
  };

  // NEW: OTP Paste Handler
  const handlePasteOTP = (e) => {
      e.preventDefault(); // Stop the default paste behavior
      
      // Grab the pasted text, remove anything that isn't a number, and limit to 6 characters
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

      if (pastedData) {
          const newOtp = [...otpCode];
          
          // Drop each pasted digit into its corresponding box
          pastedData.split('').forEach((char, index) => {
              newOtp[index] = char;
          });
          
          setOtpCode(newOtp);

          // Automatically move the cursor to the end of the pasted string
          const focusIndex = pastedData.length === 6 ? 5 : pastedData.length;
          if (otpRefs.current[focusIndex]) {
              otpRefs.current[focusIndex].focus();
          }
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
              border: '2px solid',
              borderColor: 'divider',
              '& img': { objectFit: 'contain', p: 1 } 
            }} 
          />
          <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', letterSpacing: 2 }}>
            Rental Management System
          </Typography>
        </Box>

        {requires2FA ? (
            <Box textAlign="center">
                <Typography variant="h5" fontWeight="900" sx={{ mb: 1, color: primaryColor }}>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  We've sent a 6-digit code to <b>{userEmailFor2FA}</b>. Please enter it below to verify your identity.
                </Typography>

                <form onSubmit={handleVerify2FA}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
                        {otpCode.map((data, index) => (
                            <TextField
                                key={index}
                                inputRef={el => otpRefs.current[index] = el}
                                value={data}
                                onChange={e => handleChangeOTP(e, index)}
                                onKeyDown={e => handleKeyDownOTP(e, index)}
                                onPaste={handlePasteOTP} // NEW: Added paste listener
                                inputProps={{ maxLength: 2, style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', padding: '12px' } }}
                                sx={{ width: '50px', '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: primaryColor } } }}
                            />
                        ))}
                    </Box>

                    <Button 
                        type="submit" fullWidth variant="contained" size="large" disabled={loading}
                        sx={{ 
                            mb: 2, py: 1.5, fontWeight: 'bold', 
                            bgcolor: primaryColor, color: 'white', 
                            borderRadius: '8px', boxShadow: `0 4px 12px ${primaryColor}66`,
                            '&:hover': { bgcolor: primaryHover }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'VERIFY CODE'}
                    </Button>
                    
                    <Button fullWidth color="inherit" onClick={() => setRequires2FA(false)} disabled={loading}>
                        Cancel & Go Back
                    </Button>
                </form>
            </Box>

        ) : (
            <>
                <Typography variant="h5" fontWeight="900" sx={{ mb: 1, color: primaryColor }}>
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
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" fontWeight="bold" color={primaryColor}>Password Requirements:</Typography>
                        <List dense sx={{ mt: 0.5 }}>
                        <ValidationItem valid={validations.hasLength} text="Minimum 8 characters" />
                        <ValidationItem valid={validations.hasUpper} text="Include Uppercase (A-Z)" />
                        <ValidationItem valid={validations.hasLower} text="Include Lowercase (a-z)" />
                        <ValidationItem valid={validations.hasNumber} text="Include Numbers (0-9)" />
                        <ValidationItem valid={validations.hasSpecial} text="Include Special Character (!@#$)" />
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
                    sx={{ 
                        mt: 4, mb: 2, py: 1.5, fontWeight: 'bold', 
                        bgcolor: primaryColor, color: 'white', 
                        borderRadius: '8px', boxShadow: `0 4px 12px ${primaryColor}66`,
                        '&:hover': { bgcolor: primaryHover }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
                </Button>
                </form>

                <Box textAlign="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                    {isLogin ? "New to Red Brick? " : "Already have an account? "}
                    <Link 
                    component="button" variant="body2" fontWeight="900"
                    sx={{ color: primaryColor, textDecoration: 'none' }}
                    onClick={toggleForm}
                    >
                    {isLogin ? 'Sign Up' : 'Log In'}
                    </Link>
                </Typography>
                </Box>
            </>
        )}
      </LoginPaper>

      <Snackbar open={notification.open} autoHideDuration={5000} onClose={handleCloseNotify} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotify} severity={notification.severity} sx={{ width: '100%', fontWeight: 'bold', borderRadius: '8px' }} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </BackgroundBox>
  );
}