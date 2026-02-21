import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Paper, Typography, TextField, Button, Grid, Avatar 
} from '@mui/material';
import Navbar from '../components/Navbar';
import PersonIcon from '@mui/icons-material/Person';

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', address: '', password: ''
  });

  useEffect(() => {
    // Load data from local storage initially
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) {
      setUserInfo(storedUser);
      setFormData({
        firstName: storedUser.firstName || '',
        lastName: storedUser.lastName || '',
        phone: storedUser.phone || '',
        address: storedUser.address || '',
        password: '' // Keep empty for security
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Send update to backend
      const { data } = await axios.put(`http://localhost:5000/api/users/profile/${userInfo._id}`, formData);
      
      // Update Local Storage with new data
      localStorage.setItem('userInfo', JSON.stringify({ ...data, token: userInfo.token })); // Keep the old token
      
      alert("Profile Updated Successfully!");
      setFormData({ ...formData, password: '' }); // Clear password field
    } catch (error) {
      console.error(error);
      alert("Error updating profile.");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%' }}>
          
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, margin: '0 auto', bgcolor: '#1a237e' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
              MY PROFILE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your personal information
            </Typography>
          </Box>

          <form onSubmit={handleUpdate}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2} />
              </Grid>

              <Grid item xs={12}>
                <TextField 
                  fullWidth label="New Password (Optional)" name="password" type="password" 
                  value={formData.password} onChange={handleChange} 
                  helperText="Leave blank if you don't want to change it"
                />
              </Grid>

              <Grid item xs={12}>
                <Button 
                  type="submit" variant="contained" fullWidth size="large"
                  sx={{ mt: 2, bgcolor: '#1a237e', fontWeight: 'bold' }}
                >
                  SAVE CHANGES
                </Button>
              </Grid>
            </Grid>
          </form>

        </Paper>
      </Box>
    </Box>
  );
}
