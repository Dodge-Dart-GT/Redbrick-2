import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, TextField, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, FormControlLabel, Switch, 
  FormControl, InputLabel, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const fuelOptions = ['LPG', 'Diesel', 'Electric', 'Dual Fuel'];

export default function ForkliftManagement() {
  const navigate = useNavigate();
  const [forklifts, setForklifts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [useImageUrl, setUseImageUrl] = useState(false); 

  const [formData, setFormData] = useState({
    make: '', model: '', capacity: '', power: '',
    torque: '', fuel: '', image: ''
  });

  useEffect(() => {
    fetchForklifts();
  }, []);

  const fetchForklifts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/forklifts');
      setForklifts(data);
    } catch (error) {
      console.error("Error fetching forklifts:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  // 1. HANDLE NEW FORKLIFT SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Grab the token for security clearance
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
        alert("Authorization error. Please log in again.");
        setUploading(false);
        navigate('/login');
        return;
    }

    try {
      let finalImageUrl = formData.image;

      // Handle Image Logic: Upload vs URL
      if (!useImageUrl && imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        
        // --- FIX: ADDED AUTHORIZATION HEADER HERE ---
        const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userInfo.token}` // Passes security check
          }
        });
        finalImageUrl = uploadRes.data.image;
      } else if (!useImageUrl && !imageFile && !formData.image) {
         alert("Please select a file or enter an image URL.");
         setUploading(false);
         return;
      }

      const newForkliftData = { ...formData, image: finalImageUrl, status: 'Available' };

      // --- FIX: ADDED AUTHORIZATION HEADER HERE AS WELL ---
      await axios.post('http://localhost:5000/api/forklifts', newForkliftData, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      alert('Forklift Added Successfully!');
      setFormData({ make: '', model: '', capacity: '', power: '', torque: '', fuel: '', image: '' });
      setImageFile(null);
      
      // Reset the file input visually
      document.getElementById('raised-button-file').value = ""; 
      fetchForklifts();

    } catch (error) {
      console.error("Error adding forklift:", error);
      alert(error.response?.data?.message || 'Error adding forklift.');
    } finally {
      setUploading(false);
    }
  };

  // 2. HANDLE STATUS CHANGE
  const handleStatusChange = async (id, newStatus) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      await axios.put(`http://localhost:5000/api/forklifts/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${userInfo.token}` } } // Added Security
      );
      setForklifts(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (error) {
      alert("Error updating status");
      fetchForklifts(); 
    }
  };

  // 3. DELETE FORKLIFT
  const handleDelete = async (id) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (window.confirm("Are you sure you want to remove this forklift?")) {
      try {
        await axios.delete(`http://localhost:5000/api/forklifts/${id}`, {
            headers: { Authorization: `Bearer ${userInfo.token}` } // Added Security
        });
        fetchForklifts();
      } catch (error) {
        alert("Error deleting forklift");
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Navbar />

      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/owner-dashboard')} sx={{ mr: 2, fontWeight: 'bold' }}>
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: '900', color: '#1a237e' }}>
            FLEET MANAGEMENT
          </Typography>
        </Box>

        <Grid container spacing={4}>

          {/* --- LEFT COLUMN: ADD NEW FORM --- */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: '800', mb: 3, color: '#1a237e', borderBottom: '2px solid #eee', pb: 1 }}>
                ADD NEW VEHICLE
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth size="small" label="Make" name="make" value={formData.make} onChange={handleChange} required /></Grid>
                  <Grid item xs={6}><TextField fullWidth size="small" label="Model" name="model" value={formData.model} onChange={handleChange} required /></Grid>

                  <Grid item xs={6}><TextField fullWidth size="small" label="Capacity" name="capacity" value={formData.capacity} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><TextField fullWidth size="small" label="Power" name="power" value={formData.power} onChange={handleChange} /></Grid>

                  <Grid item xs={6}><TextField fullWidth size="small" label="Torque" name="torque" value={formData.torque} onChange={handleChange} /></Grid>
                  
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel id="fuel-label">Fuel Type</InputLabel>
                      <Select labelId="fuel-label" name="fuel" value={formData.fuel} label="Fuel Type" onChange={handleChange}>
                        {fuelOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* IMAGE UPLOAD SECTION */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: 1 }}>
                       <FormControlLabel
                          control={<Switch checked={useImageUrl} onChange={() => setUseImageUrl(!useImageUrl)} size="small" />}
                          label={<Typography variant="caption" fontWeight="bold">Use Image URL</Typography>}
                       />
                    </Box>

                    {useImageUrl ? (
                      <TextField fullWidth size="small" label="Paste Image URL" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." InputProps={{ startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} /> }} />
                    ) : (
                      <Box sx={{ border: '1px dashed #ccc', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <input accept="image/*" style={{ display: 'none' }} id="raised-button-file" type="file" onChange={handleFileChange} />
                        <label htmlFor="raised-button-file">
                          <Button variant="outlined" component="span" fullWidth startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderColor: '#ccc', color: '#555', bgcolor: 'white' }}>
                            {imageFile ? imageFile.name : "Choose File..."}
                          </Button>
                        </label>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained" fullWidth disabled={uploading} sx={{ bgcolor: '#1a237e', fontWeight: 'bold', py: 1.5, '&:hover': { bgcolor: '#0d1440' } }}>
                      {uploading ? 'UPLOADING...' : 'ADD TO INVENTORY'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* --- RIGHT COLUMN: INVENTORY LIST --- */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: '800', mb: 2 }}>CURRENT INVENTORY ({forklifts.length})</Typography>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f3f5' }}>IMAGE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f3f5' }}>MODEL INFO</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f3f5' }}>SPECS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f3f5' }}>STATUS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f1f3f5' }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {forklifts.map((forklift) => (
                      <TableRow key={forklift._id} hover>
                        <TableCell>
                          <img src={forklift.image || 'https://via.placeholder.com/60'} alt="forklift" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{forklift.make}</Typography>
                          <Typography variant="caption" color="text.secondary">{forklift.model}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block">{forklift.capacity || 'N/A'}</Typography>
                          <Typography variant="caption" color="text.secondary">{forklift.fuel || 'N/A'}</Typography>
                        </TableCell>
                        
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={forklift.status}
                              onChange={(e) => handleStatusChange(forklift._id, e.target.value)}
                              sx={{ 
                                fontSize: '0.8rem', fontWeight: 'bold',
                                color: forklift.status === 'Available' ? '#2e7d32' : forklift.status === 'Maintenance' ? '#d32f2f' : '#ed6c02',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
                                bgcolor: '#f8f9fa'
                              }}
                            >
                              <MenuItem value="Available" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2e7d32' }}>Available</MenuItem>
                              <MenuItem value="Maintenance" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#d32f2f' }}>Maintenance</MenuItem>
                              <MenuItem value="Rented" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ed6c02' }}>Rented</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell align="center">
                          <IconButton color="error" onClick={() => handleDelete(forklift._id)} sx={{ '&:hover': { bgcolor: '#ffebee' } }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {forklifts.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No vehicles in inventory.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
}