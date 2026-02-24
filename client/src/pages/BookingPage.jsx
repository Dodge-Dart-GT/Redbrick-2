import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Paper, Typography, TextField, Button, Grid, Snackbar, Alert, Divider } from '@mui/material';
import Navbar from '../components/Navbar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation(); // NEW: Grabs the data passed from the navigate function
  
  // Set the model immediately using the passed state, no API call needed!
  const [model, setModel] = useState(location.state?.model || null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Failsafe: If a user refreshes the page manually, the state wipes. 
    // Send them back to the catalog.
    if (!model) {
      navigate('/models');
    }
  }, [model, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
      alert("You must be logged in to book a forklift.");
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/rentals', {
        forkliftId: model._id,
        startDate,
        endDate
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      setSnackbar({ open: true, message: 'Booking request sent successfully!', severity: 'success' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Booking failed. Dates may overlap.', severity: 'error' });
    }
  };

  if (!model) return null; // Prevent rendering if redirecting

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Navbar />
      
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ p: 4, maxWidth: 600, width: '100%', borderRadius: 4, border: '1px solid #e0e0e0' }}>
          
          <Typography variant="h5" fontWeight="900" sx={{ color: '#1a237e', textAlign: 'center', mb: 1 }}>
            BOOK THIS MODEL
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
            {model.make} {model.model}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <img 
              src={model.image || 'https://via.placeholder.com/300x200'} 
              alt={model.model} 
              style={{ maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} 
            />
          </Box>

          <Divider sx={{ mb: 4 }} />

          <form onSubmit={handleBooking}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }}
                  value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="End Date" type="date" InputLabelProps={{ shrink: true }}
                  value={endDate} onChange={(e) => setEndDate(e.target.value)} required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit" variant="contained" fullWidth startIcon={<CalendarMonthIcon />}
                  sx={{ height: '56px', bgcolor: '#1a237e', borderRadius: 2, fontWeight: 'bold', '&:hover': { bgcolor: '#0d1440' } }}
                >
                  SUBMIT RENTAL REQUEST
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}