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

  // REMOVED maxStock from state
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

    try {
      let finalImageUrl = formData.image;

      // Handle Image Logic: Upload vs URL
      if (!useImageUrl && imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        
        const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadRes.data.image;
      } else if (!useImageUrl && !imageFile && !formData.image) {
         alert("Please select a file or enter an image URL.");
         setUploading(false);
         return;
      }

      const newForkliftData = { ...formData, image: finalImageUrl, status: 'Available' };

      await axios.post('http://localhost:5000/api/forklifts', newForkliftData);

      alert('Forklift Added Successfully!');
      // Reset form (removed maxStock)
      setFormData({ make: '', model: '', capacity: '', power: '', torque: '', fuel: '', image: '' });
      setImageFile(null);
      fetchForklifts();

    } catch (error) {
      console.error("Error adding forklift:", error);
      alert('Error adding forklift.');
    } finally {
      setUploading(false);
    }
  };

  // 2. HANDLE STATUS CHANGE
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/forklifts/${id}`, { status: newStatus });
      setForklifts(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (error) {
      alert("Error updating status");
      fetchForklifts(); 
    }
  };

  // 3. DELETE FORKLIFT
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this forklift?")) {
      try {
        await axios.delete(`http://localhost:5000/api/forklifts/${id}`);
        fetchForklifts();
      } catch (error) {
        alert("Error deleting forklift");
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />

      <Box sx={{ p: 4 }}>
        {/* HEADER */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/owner')} sx={{ mr: 2 }}>
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: 'Oswald' }}>
            FLEET MANAGEMENT
          </Typography>
        </Box>

        <Grid container spacing={4}>

          {/* --- LEFT COLUMN: ADD NEW FORM --- */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e' }}>
                ADD NEW FORKLIFT
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Make" name="make" value={formData.make} onChange={handleChange} required /></Grid>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Model" name="model" value={formData.model} onChange={handleChange} required /></Grid>

                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Capacity" name="capacity" value={formData.capacity} onChange={handleChange} /></Grid>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Power" name="power" value={formData.power} onChange={handleChange} /></Grid>

                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Torque" name="torque" value={formData.torque} onChange={handleChange} /></Grid>
                  
                  {/* FUEL TYPE DROPDOWN */}
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel id="fuel-label">Fuel Type</InputLabel>
                      <Select
                        labelId="fuel-label"
                        name="fuel"
                        value={formData.fuel}
                        label="Fuel Type"
                        onChange={handleChange}
                      >
                        {fuelOptions.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* REMOVED MAX STOCK INPUT & HELPER TEXT */}

                  {/* IMAGE UPLOAD SECTION */}
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                       <FormControlLabel
                          control={<Switch checked={useImageUrl} onChange={() => setUseImageUrl(!useImageUrl)} />}
                          label={<Typography variant="body2" color="text.secondary">Use Image URL</Typography>}
                       />
                    </Box>

                    {useImageUrl ? (
                      <TextField 
                        fullWidth 
                        size="small" 
                        label="Paste Image URL" 
                        name="image" 
                        value={formData.image} 
                        onChange={handleChange} 
                        placeholder="https://..."
                        InputProps={{ startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} /> }}
                      />
                    ) : (
                      <>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="raised-button-file"
                          type="file"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="raised-button-file">
                          <Button
                            variant="outlined"
                            component="span"
                            fullWidth
                            startIcon={<CloudUploadIcon />}
                            sx={{ textTransform: 'none', borderColor: '#ccc', color: '#555' }}
                          >
                            {imageFile ? `Selected: ${imageFile.name}` : "Choose Image File"}
                          </Button>
                        </label>
                      </>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={uploading}
                      sx={{ bgcolor: '#1a237e', fontWeight: 'bold', py: 1.5 }}
                    >
                      {uploading ? 'Processing...' : 'ADD TO FLEET'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* --- RIGHT COLUMN: INVENTORY LIST --- */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>CURRENT INVENTORY ({forklifts.length})</Typography>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Make / Model</TableCell>
                      <TableCell>Specs</TableCell>
                      <TableCell>Status (Control)</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {forklifts.map((forklift) => (
                      <TableRow key={forklift._id}>
                        <TableCell>
                          <img src={forklift.image} alt="f" style={{ width: 60, height: 60, borderRadius: 4, objectFit: 'cover', border: '1px solid #eee' }} />
                        </TableCell>
                        <TableCell>
                          <strong>{forklift.make}</strong><br />{forklift.model}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                          {forklift.capacity} <br/> {forklift.fuel}
                        </TableCell>
                        
                        {/* STATUS DROPDOWN FOR OWNER */}
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={forklift.status}
                              onChange={(e) => handleStatusChange(forklift._id, e.target.value)}
                              sx={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 'bold',
                                color: forklift.status === 'Available' ? 'green' : forklift.status === 'Maintenance' ? 'red' : 'orange',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }
                              }}
                            >
                              <MenuItem value="Available">Available</MenuItem>
                              <MenuItem value="Maintenance">Maintenance</MenuItem>
                              <MenuItem value="Rented">Rented</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell align="center">
                          <IconButton color="error" onClick={() => handleDelete(forklift._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
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
