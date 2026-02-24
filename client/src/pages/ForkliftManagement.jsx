import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, TextField, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, FormControlLabel, Switch, 
  FormControl, InputLabel, Select, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelIcon from '@mui/icons-material/Cancel';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const fuelOptions = ['LPG', 'Diesel', 'Electric', 'Dual Fuel'];

export default function ForkliftManagement() {
  const navigate = useNavigate();
  const [forklifts, setForklifts] = useState([]);
  
  // ADD FORM STATE
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [useImageUrl, setUseImageUrl] = useState(false); 
  const [formData, setFormData] = useState({
    make: '', model: '', capacity: '', power: '', torque: '', fuel: '', image: ''
  });

  // EDIT MODAL STATE
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditingSaving, setIsEditingSaving] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);

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

  // --- ADD FORKLIFT HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removeImage = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo || !userInfo.token) {
        alert("Authorization error. Please log in again.");
        setUploading(false);
        navigate('/login');
        return;
    }

    try {
      let uploadedImageUrls = [];
      let finalImageUrl = formData.image;

      if (!useImageUrl && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploadData = new FormData();
          uploadData.append('image', file);
          const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` }
          });
          uploadedImageUrls.push(uploadRes.data.image); 
        }
      } else if (!useImageUrl && imageFiles.length === 0 && !formData.image) {
         alert("Please select at least one image or provide a URL.");
         setUploading(false);
         return;
      }

      const newForkliftData = { 
        ...formData, 
        image: useImageUrl ? finalImageUrl : undefined,
        images: !useImageUrl ? uploadedImageUrls : [], 
        status: 'Available' 
      };

      await axios.post('http://localhost:5000/api/forklifts', newForkliftData, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      alert('Vehicle Added Successfully!');
      setFormData({ make: '', model: '', capacity: '', power: '', torque: '', fuel: '', image: '' });
      setImageFiles([]);
      setImagePreviews([]);
      document.getElementById('raised-button-file').value = ""; 
      fetchForklifts();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding forklift.');
    } finally {
      setUploading(false);
    }
  };

  // --- EDIT FORKLIFT HANDLERS ---
  const handleOpenEdit = (forklift) => {
    setEditFormData(forklift);
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setEditImageFiles(prev => [...prev, ...files]);
    setEditImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removeEditImage = (indexToRemove) => {
    setEditImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setEditImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditingSaving(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      let finalImages = editFormData.images || [];
      let finalImageUrl = editFormData.image || ''; // Capture the manually edited URL

      // If new local files were selected, upload them and overwrite the old array/url
      if (editImageFiles.length > 0) {
        let uploadedImageUrls = [];
        for (const file of editImageFiles) {
          const uploadData = new FormData();
          uploadData.append('image', file);
          const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` }
          });
          uploadedImageUrls.push(uploadRes.data.image);
        }
        finalImages = uploadedImageUrls;
        finalImageUrl = uploadedImageUrls[0] || ''; // Sync the main image to the first uploaded one
      }

      // Merge the updated text fields, URL, and image array
      const updatedData = { 
        ...editFormData, 
        images: finalImages,
        image: finalImageUrl 
      };

      await axios.put(`http://localhost:5000/api/forklifts/${editFormData._id}`, updatedData, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      alert('Vehicle Updated Successfully!');
      setEditModalOpen(false);
      fetchForklifts();
    } catch (error) {
      alert("Error updating forklift");
    } finally {
      setIsEditingSaving(false);
    }
  };

  // --- DELETE & STATUS HANDLERS ---
  const handleStatusChange = async (id, newStatus) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      await axios.put(`http://localhost:5000/api/forklifts/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      setForklifts(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (error) {
      alert("Error updating status");
      fetchForklifts(); 
    }
  };

  const handleDelete = async (id) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (window.confirm("Are you sure you want to remove this forklift?")) {
      try {
        await axios.delete(`http://localhost:5000/api/forklifts/${id}`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/owner-dashboard')} sx={{ mr: 2, fontWeight: 'bold' }}>Back</Button>
          <Typography variant="h4" sx={{ fontWeight: '900', color: '#1a237e' }}>FLEET MANAGEMENT</Typography>
        </Box>

        <Grid container spacing={4}>

          {/* --- LEFT COLUMN: ADD NEW FORM --- */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: '800', mb: 3, color: '#1a237e', borderBottom: '2px solid #eee', pb: 1 }}>
                ADD NEW VEHICLE
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={2}>
                    <TextField fullWidth size="small" label="Make" name="make" value={formData.make} onChange={handleChange} required />
                    <TextField fullWidth size="small" label="Model" name="model" value={formData.model} onChange={handleChange} required />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField fullWidth size="small" label="Capacity" name="capacity" value={formData.capacity} onChange={handleChange} />
                    <TextField fullWidth size="small" label="Power" name="power" value={formData.power} onChange={handleChange} />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField fullWidth size="small" label="Torque" name="torque" value={formData.torque} onChange={handleChange} />
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Fuel</InputLabel>
                      <Select name="fuel" value={formData.fuel} label="Fuel" onChange={handleChange}>
                        {fuelOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: 1 }}>
                       <FormControlLabel control={<Switch checked={useImageUrl} onChange={() => setUseImageUrl(!useImageUrl)} size="small" />} label={<Typography variant="caption" fontWeight="bold">Use Image URL</Typography>} />
                    </Box>

                    {useImageUrl ? (
                      <TextField fullWidth size="small" label="Paste Image URL" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." InputProps={{ startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} /> }} />
                    ) : (
                      <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                        <input accept="image/*" style={{ display: 'none' }} id="raised-button-file" multiple type="file" onChange={handleFileChange} />
                        <label htmlFor="raised-button-file">
                          <Button variant="contained" component="span" startIcon={<CloudUploadIcon />} sx={{ bgcolor: '#455a64', '&:hover': { bgcolor: '#263238' } }}>SELECT IMAGES</Button>
                        </label>
                        {imagePreviews.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: 'center' }}>
                            {imagePreviews.map((url, index) => (
                              <Box key={index} sx={{ position: 'relative', width: 60, height: 60 }}>
                                <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />
                                <IconButton size="small" onClick={() => removeImage(index)} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', color: 'error.main', p: 0.2, '&:hover': { bgcolor: '#ffebee' } }}>
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Grid>

                  <Button type="submit" variant="contained" fullWidth disabled={uploading} sx={{ bgcolor: '#1a237e', fontWeight: 'bold', py: 1.5, mt: 1, '&:hover': { bgcolor: '#0d1440' } }}>
                    {uploading ? 'PROCESSING UPLOADS...' : 'ADD TO INVENTORY'}
                  </Button>
                </Stack>
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
                      <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f1f3f5' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {forklifts.map((forklift) => {
                      const displayImage = forklift.images && forklift.images.length > 0 ? forklift.images[0] : (forklift.image || 'https://placehold.co/600x400?text=No+Vehicle+Image');

                      return (
                      <TableRow key={forklift._id} hover>
                        <TableCell>
                          <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <img src={displayImage} alt="forklift" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }} />
                            {forklift.images && forklift.images.length > 1 && (
                              <Chip size="small" label={`+${forklift.images.length - 1}`} sx={{ position: 'absolute', bottom: -8, right: -8, height: 18, fontSize: '0.65rem', fontWeight: 'bold', bgcolor: '#1a237e', color: 'white' }} />
                            )}
                          </Box>
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
                            <Select value={forklift.status} onChange={(e) => handleStatusChange(forklift._id, e.target.value)} sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: forklift.status === 'Available' ? '#2e7d32' : forklift.status === 'Maintenance' ? '#d32f2f' : '#ed6c02', '.MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, bgcolor: '#f8f9fa' }}>
                              <MenuItem value="Available" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2e7d32' }}>Available</MenuItem>
                              <MenuItem value="Maintenance" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#d32f2f' }}>Maintenance</MenuItem>
                              <MenuItem value="Rented" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ed6c02' }}>Rented</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Edit Vehicle">
                              <IconButton color="primary" onClick={() => handleOpenEdit(forklift)} sx={{ '&:hover': { bgcolor: '#e3f2fd' } }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Vehicle">
                              <IconButton color="error" onClick={() => handleDelete(forklift._id)} sx={{ '&:hover': { bgcolor: '#ffebee' } }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

        </Grid>
      </Box>

      {/* --- EDIT FORKLIFT MODAL --- */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1a237e', color: 'white' }}>
          EDIT VEHICLE DETAILS
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers>
            {editFormData && (
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={2}>
                  <TextField fullWidth size="small" label="Make" name="make" value={editFormData.make} onChange={handleEditChange} required />
                  <TextField fullWidth size="small" label="Model" name="model" value={editFormData.model} onChange={handleEditChange} required />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField fullWidth size="small" label="Capacity" name="capacity" value={editFormData.capacity} onChange={handleEditChange} />
                  <TextField fullWidth size="small" label="Power" name="power" value={editFormData.power} onChange={handleEditChange} />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField fullWidth size="small" label="Torque" name="torque" value={editFormData.torque} onChange={handleEditChange} />
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select name="fuel" value={editFormData.fuel} label="Fuel Type" onChange={handleEditChange}>
                      {fuelOptions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Stack>

                <Divider sx={{ my: 2 }}>IMAGE SETTINGS</Divider>

                {/* THE FIX: ADDED IMAGE URL FIELD HERE */}
                <TextField 
                  fullWidth 
                  size="small"
                  label="Primary Image URL" 
                  value={editFormData.image || ''} 
                  onChange={(e) => setEditFormData({...editFormData, image: e.target.value})}
                  helperText="Paste a direct link to update the main display image."
                  InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                  sx={{ mb: 2 }}
                />

                {/* Edit Images Section */}
                <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Or select local files to upload. This will overwrite the URL above.
                  </Typography>
                  <input accept="image/*" style={{ display: 'none' }} id="edit-button-file" multiple type="file" onChange={handleEditFileChange} />
                  <label htmlFor="edit-button-file">
                    <Button variant="contained" component="span" startIcon={<CloudUploadIcon />} sx={{ bgcolor: '#455a64', '&:hover': { bgcolor: '#263238' } }}>
                      UPLOAD LOCAL FILES
                    </Button>
                  </label>
                  {editImagePreviews.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: 'center' }}>
                      {editImagePreviews.map((url, index) => (
                        <Box key={index} sx={{ position: 'relative', width: 60, height: 60 }}>
                          <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />
                          <IconButton size="small" onClick={() => removeEditImage(index)} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', color: 'error.main', p: 0.2, '&:hover': { bgcolor: '#ffebee' } }}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
            <Button onClick={() => setEditModalOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>CANCEL</Button>
            <Button type="submit" variant="contained" disabled={isEditingSaving} sx={{ bgcolor: '#1a237e' }}>
              {isEditingSaving ? 'SAVING...' : 'SAVE CHANGES'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </Box>
  );
}