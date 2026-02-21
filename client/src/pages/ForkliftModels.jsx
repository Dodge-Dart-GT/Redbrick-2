import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { 
  Box, Grid, Paper, Typography, TextField, Button, 
  Card, CardMedia, CardContent, CardActions, Pagination, Divider, Chip
} from '@mui/material';
import Navbar from '../components/Navbar';

export default function ForkliftModels() {
  const [forklifts, setForklifts] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForklift, setSelectedForklift] = useState(null);
  const [page, setPage] = useState(1);
  const [rentalDays, setRentalDays] = useState(1); // NEW: Duration State
  
  const ITEMS_PER_PAGE = 6;

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

  const handleRequest = async (forklift) => {
    const userInfo = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')) 
      : null;
    
    if (!userInfo) {
      alert("Please login to request a rental.");
      return;
    }

    // Validation: Must rent for at least 1 day
    if (rentalDays < 1) {
      alert("Please enter a valid number of days.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/rentals', {
        userId: userInfo._id,
        forkliftId: forklift._id,
        durationDays: rentalDays // Send the days to the server
      });
      
      alert(`Request sent for ${rentalDays} day(s)! Check your Dashboard.`);
    } catch (error) {
      alert("Request failed. You might have already requested this unit.");
    }
  };

  const filteredModels = forklifts.filter(f => 
    f.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.make.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const pageCount = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const displayedModels = filteredModels.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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

          {/* RIGHT: SPECS */}
          <Grid item xs={12} sm={4} sx={{ position: 'sticky', top: 20 }}>
            <Paper elevation={10} sx={{ p: 3, borderTop: '6px solid #1a237e' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#1a237e' }}>SPECIFICATIONS</Typography>
              
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

                  {/* NEW: DURATION INPUT */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>How many days?</Typography>
                    <TextField 
                      type="number" 
                      fullWidth 
                      size="small" 
                      value={rentalDays} 
                      onChange={(e) => setRentalDays(e.target.value)}
                      inputProps={{ min: 1 }}
                      sx={{ bgcolor: 'white' }}
                    />
                  </Box>

                  <Button 
                    variant="contained" fullWidth size="large" sx={{ mt: 2, bgcolor: '#1a237e', fontWeight: 'bold' }}
                    disabled={selectedForklift.status !== 'Available'}
                    onClick={() => handleRequest(selectedForklift)}
                  >
                    {selectedForklift.status === 'Available' ? 'REQUEST RENTAL' : 'UNAVAILABLE'}
                  </Button>
                </Box>
              ) : (
                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Select a model to view specs.</Typography>
              )}
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
}
