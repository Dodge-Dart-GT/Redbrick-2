import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Paper, Typography, Button, Snackbar, Alert, 
  Divider, IconButton, Stack, Card, CardMedia, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import Navbar from '../components/Navbar';

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EvStationIcon from '@mui/icons-material/EvStation';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

// Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [model, setModel] = useState(location.state?.model || null);
  
  // Carousel State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Date states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!model) {
      navigate('/models');
    }
  }, [model, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setSnackbar({ open: true, message: 'Please select both rental dates.', severity: 'warning' });
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
      alert("You must be logged in to book a forklift.");
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/rentals', {
        forkliftId: model._id,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      setSnackbar({ open: true, message: 'Booking request sent successfully!', severity: 'success' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Booking failed. Dates may overlap.', severity: 'error' });
    }
  };

  if (!model) return null; 

  // --- IMAGE CAROUSEL LOGIC ---
  const handleNextImage = () => {
    const totalImages = imagesArray.length;
    if (totalImages === 0) return;
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  const handlePrevImage = () => {
    const totalImages = imagesArray.length;
    if (totalImages === 0) return;
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };

  const getImagesArray = (vehicle) => {
    if (vehicle.images && vehicle.images.length > 0) return vehicle.images;
    if (vehicle.image) return [vehicle.image]; 
    return ['https://placehold.co/800x600?text=No+Vehicle+Image'];
  };

  const imagesArray = getImagesArray(model);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', pb: 8 }}>
      <Navbar />
      
      <Box sx={{ maxWidth: 1300, mx: 'auto', p: { xs: 2, md: 4 } }}>
        
        {/* THE FIX: Rigid Flexbox layout instead of Grid to force two columns */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'flex-start', 
          gap: 4 
        }}>
          
          {/* --- LEFT COLUMN: IMAGE CAROUSEL & SPECS (60% Width) --- */}
          <Box sx={{ width: { xs: '100%', md: '60%' } }}>
            <Stack spacing={4}>
              
              {/* IMAGE CAROUSEL */}
              <Card elevation={0} sx={{ position: 'relative', borderRadius: 4, border: '1px solid #e0e0e0', bgcolor: 'white', overflow: 'hidden' }}>
                
                {imagesArray.length > 1 && (
                    <IconButton 
                        onClick={handlePrevImage} 
                        sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                    >
                        <ArrowBackIosNewIcon />
                    </IconButton>
                )}

                <CardMedia
                    component="img"
                    image={imagesArray[activeImageIndex]}
                    alt={`${model.make} ${model.model} - Image ${activeImageIndex + 1}`}
                    sx={{ height: { xs: 300, sm: 450, md: 500 }, objectFit: 'cover', width: '100%' }}
                />

                {imagesArray.length > 1 && (
                    <IconButton 
                        onClick={handleNextImage} 
                        sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>
                )}

                {/* THUMBNAIL INDICATORS */}
                {imagesArray.length > 1 && (
                    <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center', gap: 1.5, bgcolor: '#f1f3f5', borderTop: '1px solid #e0e0e0' }}>
                        {imagesArray.map((_, index) => (
                            <Box 
                                key={index} 
                                onClick={() => setActiveImageIndex(index)}
                                sx={{ width: 12, height: 12, borderRadius: '50%', cursor: 'pointer', transition: 'background-color 0.2s', bgcolor: activeImageIndex === index ? '#1a237e' : '#bdbdbd', '&:hover': { bgcolor: '#5c6bc0' } }} 
                            />
                        ))}
                    </Box>
                )}
              </Card>

              {/* SPECIFICATIONS BOX */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0', bgcolor: 'white' }}>
                  <Typography variant="h5" fontWeight="900" gutterBottom sx={{ color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildCircleIcon fontSize="large" /> VEHICLE SPECIFICATIONS
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <List disablePadding>
                      <ListItem disableGutters sx={{ py: 1.5 }}>
                          <ListItemIcon><FitnessCenterIcon color="action" fontSize="large" /></ListItemIcon>
                          <ListItemText primary="Lift Capacity" secondary={model.capacity || 'Standard / Unspecified'} primaryTypographyProps={{ fontWeight: 'bold' }} secondaryTypographyProps={{ fontSize: '1rem' }} />
                      </ListItem>
                      <ListItem disableGutters sx={{ py: 1.5 }}>
                          <ListItemIcon><EvStationIcon color="action" fontSize="large" /></ListItemIcon>
                          <ListItemText primary="Power Type" secondary={model.power || 'Electric / Gas'} primaryTypographyProps={{ fontWeight: 'bold' }} secondaryTypographyProps={{ fontSize: '1rem' }} />
                      </ListItem>
                      <ListItem disableGutters sx={{ py: 1.5 }}>
                          <ListItemIcon><BoltIcon color="action" fontSize="large" /></ListItemIcon>
                          <ListItemText primary="Power Rating (Torque)" secondary={model.torque || 'N/A'} primaryTypographyProps={{ fontWeight: 'bold' }} secondaryTypographyProps={{ fontSize: '1rem' }} />
                      </ListItem>
                      <ListItem disableGutters sx={{ py: 1.5 }}>
                          <ListItemIcon><LocalGasStationIcon color="action" fontSize="large" /></ListItemIcon>
                          <ListItemText primary="Fuel Option" secondary={model.fuel || 'N/A'} primaryTypographyProps={{ fontWeight: 'bold' }} secondaryTypographyProps={{ fontSize: '1rem' }} />
                      </ListItem>
                  </List>
              </Paper>
            </Stack>
          </Box>

          {/* --- RIGHT COLUMN: BOOKING FORM (40% Width & Sticky) --- */}
          <Box sx={{ width: { xs: '100%', md: '40%' }, position: 'sticky', top: 24 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid #e0e0e0', bgcolor: 'white' }}>
              
              <Typography variant="h4" fontWeight="900" sx={{ color: '#1a237e', mb: 1 }}>
                SECURE THIS VEHICLE
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 'bold' }}>
                {model.make} {model.model}
              </Typography>

              <Alert severity="info" sx={{ mb: 4, bgcolor: '#e3f2fd', color: '#0d47a1', borderRadius: 2 }}>
                  Your request will be sent to the owner for approval. You will be notified of the status shortly.
              </Alert>

              <Divider sx={{ mb: 4 }} />

              <form onSubmit={handleBooking}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack spacing={3}>
                    
                    <DatePicker
                      label="Rental Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      disablePast
                      sx={{ width: '100%', bgcolor: 'white' }}
                    />
                    
                    <DatePicker
                      label="Rental End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      disablePast
                      minDate={startDate || dayjs()} 
                      disabled={!startDate} 
                      sx={{ width: '100%', bgcolor: 'white' }}
                    />

                    {startDate && endDate && (
                        <Box sx={{ p: 2, bgcolor: '#f1f3f5', borderRadius: 2, borderLeft: '4px solid #1a237e' }}>
                          <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold' }}>
                              Total Duration: {dayjs(endDate).diff(dayjs(startDate), 'day') + 1} Day(s)
                          </Typography>
                        </Box>
                    )}

                    <Button
                      type="submit" variant="contained" fullWidth startIcon={<CalendarMonthIcon />}
                      sx={{ height: '60px', mt: 2, bgcolor: '#1a237e', borderRadius: 2, fontSize: '1.1rem', fontWeight: 'bold', '&:hover': { bgcolor: '#0d1440' }, transition: 'all 0.2s' }}
                    >
                      SUBMIT RENTAL REQUEST
                    </Button>

                  </Stack>
                </LocalizationProvider>
              </form>
            </Paper>
          </Box>

        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}