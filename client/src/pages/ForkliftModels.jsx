import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { 
  Box, Grid, Paper, Typography, TextField, Button, 
  Card, CardMedia, CardContent, CardActions, Pagination, Divider, Chip,
  Snackbar, Alert // <-- NEW IMPORTS FOR POP-UPS
} from '@mui/material';
import Navbar from '../components/Navbar';

export default function ForkliftModels() {
  const [forklifts, setForklifts] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForklift, setSelectedForklift] = useState(null);
  const [page, setPage] = useState(1);
  
  // Calendar Date States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // NEW: UI Pop-up (Snackbar) State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // can be 'success', 'error', 'warning', 'info'
  });
  
  const ITEMS_PER_PAGE = 6;
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchForklifts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/forklifts');
        setForklifts(data);
      } catch (error) {
        console.error("Error fetching forklifts:", error);
      }
    };
    fetchForklifts();
  }, []);

  // NEW: Function to close the pop-up
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to show the pop-up
  const showMessage = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRequest = async (forklift) => {
    const userInfo = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')) 
      : null;
    
    if (!userInfo) {
      showMessage("Please login to request a rental.", "warning");
      return;
    }

    if (!startDate || !endDate) {
      showMessage("Please select both a Start Date and an End Date.", "warning");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showMessage("End Date must be after the Start Date.", "error");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/rentals', {
        userId: userInfo._id,
        forkliftId: forklift._id,
        startDate: startDate,
        endDate: endDate
      });
      
      showMessage(`Request sent successfully for ${startDate} to ${endDate}! Check your Dashboard.`, "success");
      setStartDate('');
      setEndDate('');
    } catch (error) {
      showMessage(error.response?.data?.message || "Request failed.", "error");
    }
  };

  const filteredModels = forklifts.filter(f => 
    f.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.make.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const pageCount = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const displayedModels = filteredModels.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    return 0;
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          
          {/* LEFT: LIST */}
          <Grid item xs={12} sm={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Oswald' }}>
                  AVAILABLE MODELS ({filteredModels.length})
                </Typography>
                <TextField placeholder="Search..." size="small" onChange={(e) => setSearchTerm(e.target.value)} />
              </Box>

              <Grid container spacing={2}>
                {displayedModels.map((forklift) => (
                  <Grid item xs={12} lg={4} sm={6} key={forklift._id}>
                    <Card onClick={() => setSelectedForklift(forklift)}
                      sx={{ cursor: 'pointer', border: selectedForklift?._id === forklift._id ? '3px solid #1a237e' : 'none' }}>
                      <CardMedia component="img" height="140" image={forklift.image} />
                      <CardContent sx={{ pb: 1 }}>
                        <Typography variant="h6" fontWeight="bold">{forklift.make} {forklift.model}</Typography>
                        <Chip 
                          label={forklift.status} 
                          size="small" 
                          color={forklift.status === 'Available' ? 'success' : forklift.status === 'Maintenance' ? 'error' : 'warning'} 
                          variant="outlined"
                        />
                      </CardContent>
                      <CardActions>
                         <Button size="small" sx={{color: '#1a237e'}}>VIEW SPECS</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {pageCount > 1 && <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><Pagination count={pageCount} onChange={(e, v) => setPage(v)} /></Box>}
            </Paper>
          </Grid>

          {/* RIGHT: SPECS & CALENDAR */}
          <Grid item xs={12} sm={4} sx={{ position: 'sticky', top: 20 }}>
            <Paper elevation={10} sx={{ p: 3, borderTop: '6px solid #1a237e' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1a237e' }}>SPECIFICATIONS & BOOKING</Typography>
              
              {selectedForklift ? (
                <Box>
                  <img src={selectedForklift.image} style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} alt="Selected" />
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>{selectedForklift.make} {selectedForklift.model}</Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Capacity:</strong> {selectedForklift.capacity}</Typography>
                    <Typography><strong>Power:</strong> {selectedForklift.power}</Typography>
                    <Typography><strong>Fuel:</strong> {selectedForklift.fuel}</Typography>
                  </Box>

                  <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>Select Rental Dates</Typography>
                    
                    <TextField 
                      fullWidth 
                      type="date" 
                      label="Start Date" 
                      InputLabelProps={{ shrink: true }}
                      size="small" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      inputProps={{ min: today }} 
                      sx={{ mb: 2, bgcolor: 'white' }}
                    />

                    <TextField 
                      fullWidth 
                      type="date" 
                      label="End Date" 
                      InputLabelProps={{ shrink: true }}
                      size="small" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      inputProps={{ min: startDate || today }} 
                      sx={{ mb: 1, bgcolor: 'white' }}
                    />
                    
                    {calculateDays() > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', fontWeight: 'bold' }}>
                        Total Duration: {calculateDays()} Day(s)
                      </Typography>
                    )}
                  </Box>

                  <Button 
                    variant="contained" fullWidth size="large" sx={{ mt: 2, bgcolor: '#1a237e', fontWeight: 'bold' }}
                    disabled={selectedForklift.status === 'Maintenance'}
                    onClick={() => handleRequest(selectedForklift)}
                  >
                    {selectedForklift.status === 'Maintenance' ? 'IN MAINTENANCE' : 'REQUEST DATES'}
                  </Button>
                </Box>
              ) : (
                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Select a model to view specs and book.</Typography>
              )}
            </Paper>
          </Grid>

        </Grid>
      </Box>

      {/* --- NEW: SNACKBAR UI POP-UP --- */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontSize: '1rem', fontWeight: 'bold' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
