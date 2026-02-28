import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import {
  Box, Paper, Typography, TextField, Button, Avatar,
  InputAdornment, IconButton, Snackbar, Alert, Divider, Stack
} from '@mui/material';
import Navbar from '../components/Navbar';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';

export default function ProfilePage() {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser((prev) => ({
        ...prev,
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        phone: userInfo.phone || '',
        address: userInfo.address || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    try {
      const { data } = await axios.put(`/api/users/profile/${userInfo._id}`, user, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      
      localStorage.setItem('userInfo', JSON.stringify({ ...data, token: userInfo.token }));
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Update failed. Please try again.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 5 }, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ 
          p: { xs: 3, md: 5 }, 
          maxWidth: 800, // Widened to maximize the space 
          width: '100%', 
          borderRadius: 4, 
          border: '1px solid #e0e0e0',
        }}>
          
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ 
              bgcolor: '#1a237e', 
              width: 75, 
              height: 75, 
              margin: '0 auto 16px',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              {user.firstName ? user.firstName[0] : 'U'}{user.lastName ? user.lastName[0] : ''}
            </Avatar>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1a237e', letterSpacing: '-0.5px' }}>
              MY PROFILE
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Manage your personal information
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Form Section using Stack for guaranteed full-width alignment */}
          <form onSubmit={handleUpdate}>
            <Stack spacing={4}>
              
              {/* ROW 1: Names (Perfectly split 50/50) */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <TextField
                  fullWidth label="First Name" name="firstName"
                  value={user.firstName} onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth label="Last Name" name="lastName"
                  value={user.lastName} onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
                  }}
                />
              </Stack>

              {/* ROW 2: Address (Forced 100% Full Width) */}
              <TextField
                fullWidth label="Complete Address" name="address"
                value={user.address} onChange={handleChange}
                multiline rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* ROW 3: Phone Number (Forced 100% Full Width) */}
              <TextField
                fullWidth label="Phone Number" name="phone"
                value={user.phone} onChange={handleChange}
                placeholder="09XX-XXX-XXXX"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment>,
                }}
              />
              
              {/* ROW 4: Security Section */}
              <Box sx={{ pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: '800', color: '#1a237e', letterSpacing: '1px' }}>
                  SECURITY SETTINGS
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
                  <TextField
                    fullWidth label="New Password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={user.password} onChange={handleChange}
                    helperText="Leave blank if you don't want to change it"
                    sx={{ flexGrow: 1 }} // Ensures password bar takes up all remaining space
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{ 
                      height: '56px', // Matches TextField height exactly
                      minWidth: { xs: '100%', sm: '180px' }, // Fixes button size so it doesn't squish
                      bgcolor: '#1a237e', 
                      borderRadius: 2,
                      fontWeight: '800',
                      fontSize: '1rem',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0d1440', boxShadow: 'none' }
                    }}
                  >
                    SAVE
                  </Button>
                </Stack>
              </Box>

            </Stack>
          </form>
        </Paper>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}