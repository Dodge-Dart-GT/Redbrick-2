import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import {
  Box, Grid, Paper, Typography, TextField, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, FormControlLabel, Switch, 
  FormControl, InputLabel, Select, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Divider, Container,
  InputAdornment, Pagination, Rating, Avatar, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelIcon from '@mui/icons-material/Cancel';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InfoIcon from '@mui/icons-material/Info';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import EvStationIcon from '@mui/icons-material/EvStation';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'; 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'; 
import StarIcon from '@mui/icons-material/Star';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

const fuelOptions = ['LPG', 'Diesel', 'Electric', 'Dual Fuel'];

export default function ForkliftManagement() {
  const navigate = useNavigate();
  const [forklifts, setForklifts] = useState([]);
  
  // --- SEARCH, FILTER, & PAGINATION STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  // --- ADD FORM STATE ---
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ make: '', model: '', capacity: '', power: '', torque: '', fuel: '' });
  
  // Add Image States
  const [addUrls, setAddUrls] = useState([]);
  const [tempAddUrl, setTempAddUrl] = useState('');
  const [addFiles, setAddFiles] = useState([]);
  const [addPreviews, setAddPreviews] = useState([]);

  // --- EDIT MODAL STATE ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditingSaving, setIsEditingSaving] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  
  // Edit Image States
  const [editUrls, setEditUrls] = useState([]);
  const [tempEditUrl, setTempEditUrl] = useState('');
  const [editFiles, setEditFiles] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);

  // --- SIMULATED CUSTOMER VIEW STATE ---
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedViewModel, setSelectedViewModel] = useState(null);
  const [activeViewImageIndex, setActiveViewImageIndex] = useState(0); 
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  useEffect(() => {
    fetchForklifts();
  }, []);

  const fetchForklifts = async () => {
    try {
      const { data } = await axios.get('/api/forklifts');
      setForklifts(data);
    } catch (error) {
      console.error("Error fetching forklifts:", error);
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredForklifts = forklifts.filter(f => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (f.make || '').toLowerCase().includes(searchLower) || (f.model || '').toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filteredForklifts.length / ITEMS_PER_PAGE));
  const displayedForklifts = filteredForklifts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // =====================================================================
  // ADD VEHICLE HANDLERS
  // =====================================================================
  const handleAddChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const pushAddUrl = () => {
    if (tempAddUrl.trim()) {
      setAddUrls(prev => [...prev, tempAddUrl.trim()]);
      setTempAddUrl('');
    }
  };

  const handleAddFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setAddFiles(prev => [...prev, ...files]);
    setAddPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    e.target.value = null; // reset input
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo || !userInfo.token) {
        alert("Authorization error. Please log in again.");
        setUploading(false); navigate('/login'); return;
    }

    try {
      let uploadedImageUrls = [];
      for (const file of addFiles) {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const uploadRes = await axios.post('/api/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` }
        });
        uploadedImageUrls.push(uploadRes.data.image || uploadRes.data.url); 
      }

      const finalImages = [...addUrls, ...uploadedImageUrls];
      if (finalImages.length === 0) {
         alert("Please provide at least one image (URL or Local File).");
         setUploading(false); return;
      }

      const newForkliftData = { 
        ...formData, 
        images: finalImages, 
        image: finalImages[0], 
        status: 'Available' 
      };

      await axios.post('/api/forklifts', newForkliftData, { headers: { Authorization: `Bearer ${userInfo.token}` } });

      alert('Vehicle Added Successfully!');
      setFormData({ make: '', model: '', capacity: '', power: '', torque: '', fuel: '' });
      setAddUrls([]); setAddFiles([]); setAddPreviews([]); setAddModalOpen(false);
      fetchForklifts();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding forklift.');
    } finally {
      setUploading(false);
    }
  };

  // =====================================================================
  // EDIT VEHICLE HANDLERS
  // =====================================================================
  const handleOpenEdit = (forklift) => {
    setEditFormData(forklift);
    const existingImages = forklift.images && forklift.images.length > 0 ? forklift.images : (forklift.image ? [forklift.image] : []);
    setEditUrls(existingImages);
    setEditFiles([]);
    setEditPreviews([]);
    setTempEditUrl('');
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const pushEditUrl = () => {
    if (tempEditUrl.trim()) {
      setEditUrls(prev => [...prev, tempEditUrl.trim()]);
      setTempEditUrl('');
    }
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setEditFiles(prev => [...prev, ...files]);
    setEditPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    e.target.value = null;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditingSaving(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      let uploadedImageUrls = [];
      for (const file of editFiles) {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const uploadRes = await axios.post('/api/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` }
        });
        uploadedImageUrls.push(uploadRes.data.image || uploadRes.data.url);
      }

      const finalImages = [...editUrls, ...uploadedImageUrls];
      
      const updatedData = { 
        ...editFormData, 
        images: finalImages,
        image: finalImages.length > 0 ? finalImages[0] : '' 
      };

      await axios.put(`/api/forklifts/${editFormData._id}`, updatedData, {
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

  // =====================================================================
  // DELETE & STATUS HANDLERS
  // =====================================================================
  const handleStatusChange = async (id, newStatus) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      await axios.put(`/api/forklifts/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      setForklifts(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (error) {
      alert("Error updating status"); fetchForklifts(); 
    }
  };

  const handleDelete = async (id) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (window.confirm("Are you sure you want to permanently remove this forklift?")) {
      try {
        await axios.delete(`/api/forklifts/${id}`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
        fetchForklifts();
      } catch (error) {
        alert("Error deleting forklift");
      }
    }
  };

  // =====================================================================
  // SIMULATED CUSTOMER VIEW HANDLERS
  // =====================================================================
  const handleOpenView = (forklift) => {
    setSelectedViewModel(forklift);
    setActiveViewImageIndex(0);
    setReviewPage(1);
    setViewModalOpen(true);
  };

  const handleNextView = () => {
    const currentIndex = filteredForklifts.findIndex(m => m._id === selectedViewModel._id);
    const nextIndex = (currentIndex + 1) % filteredForklifts.length; 
    setSelectedViewModel(filteredForklifts[nextIndex]);
    setActiveViewImageIndex(0); 
    setReviewPage(1);
  };

  const handlePrevView = () => {
    const currentIndex = filteredForklifts.findIndex(m => m._id === selectedViewModel._id);
    const prevIndex = (currentIndex - 1 + filteredForklifts.length) % filteredForklifts.length; 
    setSelectedViewModel(filteredForklifts[prevIndex]);
    setActiveViewImageIndex(0); 
    setReviewPage(1); 
  };

  const getModelImages = (model) => {
    if (!model) return [];
    if (model.images && model.images.length > 0) return model.images;
    if (model.image) return [model.image];
    return ['https://placehold.co/600x400?text=No+Vehicle+Image']; 
  };

  const renderAvailabilityText = (model) => {
    if (model.status === 'Rented') {
      return model.nextAvailableDate 
        ? `Available on: ${new Date(model.nextAvailableDate).toLocaleDateString()}`
        : 'Currently Rented';
    }
    if (model.status === 'Maintenance') return 'Currently in Maintenance';
    if (model.status === 'Retired') return 'Retired from Fleet';
    return 'Available Now';
  };

  const activeViewImagesArray = getModelImages(selectedViewModel);
  const reviewCount = selectedViewModel?.reviews?.length || 0;
  const reviewPageCount = Math.max(1, Math.ceil(reviewCount / REVIEWS_PER_PAGE));
  const displayedReviews = selectedViewModel?.reviews 
    ? [...selectedViewModel.reviews]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
        .slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)
    : [];

  // Render Gallery Item Component
  const GalleryItem = ({ url, isFile, onRemove }) => (
    <Box sx={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: `2px solid ${isFile ? '#1a237e' : '#e0e0e0'}` }} />
      <IconButton size="small" onClick={onRemove} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', color: 'error.main', p: 0.2, boxShadow: 2, '&:hover': { bgcolor: '#ffebee' } }}>
        <CancelIcon fontSize="small" />
      </IconButton>
      {isFile && <Chip label="NEW" size="small" sx={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', height: 16, fontSize: '0.6rem', fontWeight: 'bold', bgcolor: '#1a237e', color: 'white' }} />}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 5 } }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/owner-dashboard')} sx={{ mr: 2, fontWeight: 'bold' }}>Back</Button>
            <Typography variant="h4" sx={{ fontWeight: '900', color: 'primary.main' }}>FLEET MANAGEMENT</Typography>
          </Box>
          <Button variant="contained" color="primary" startIcon={<AddCircleIcon />} onClick={() => setAddModalOpen(true)} sx={{ fontWeight: 'bold', px: 3, py: 1.2 }}>
            ADD NEW VEHICLE
          </Button>
        </Box>

        {/* --- SEARCH & FILTER BAR --- */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2, borderRight: { md: '1px solid #eee' } }}>
                <FilterListIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">FILTERS:</Typography>
            </Box>
            
            <TextField 
                placeholder="Search make or model..." size="small" variant="outlined"
                value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                sx={{ width: { xs: '100%', sm: 300 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Equipment Status</InputLabel>
                <Select value={statusFilter} label="Equipment Status" onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}>
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Rented">Rented</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                </Select>
            </FormControl>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight="bold">Showing {filteredForklifts.length} Vehicle(s)</Typography>
        </Box>

        <Grid container spacing={4}>
          {/* --- INVENTORY LIST --- */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <TableContainer sx={{ minHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>IMAGE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>MODEL INFO</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>SPECS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>STATUS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedForklifts.length > 0 ? displayedForklifts.map((forklift) => {
                      const displayImage = forklift.images && forklift.images.length > 0 ? forklift.images[0] : (forklift.image || 'https://placehold.co/600x400?text=No+Vehicle+Image');
                      const isRented = forklift.status === 'Rented';

                      return (
                      <TableRow key={forklift._id} hover>
                        <TableCell>
                          <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <img src={displayImage} alt="forklift" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />
                            {forklift.images && forklift.images.length > 1 && (
                              <Chip size="small" label={`+${forklift.images.length - 1}`} sx={{ position: 'absolute', bottom: -8, right: -8, height: 18, fontSize: '0.65rem', fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="bold">{forklift.make}</Typography>
                          <Typography variant="body2" color="text.secondary">{forklift.model}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block" fontWeight="bold">Cap: {forklift.capacity ? `${forklift.capacity} lbs` : 'N/A'}</Typography>
                          <Typography variant="caption" color="text.secondary">Fuel: {forklift.fuel || 'N/A'}</Typography>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Tooltip title={isRented ? "Status locked by active rental agreement." : ""}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                              <Select 
                                value={forklift.status} disabled={isRented} 
                                onChange={(e) => handleStatusChange(forklift._id, e.target.value)} 
                                sx={{ 
                                  fontSize: '0.85rem', fontWeight: 'bold', 
                                  color: forklift.status === 'Available' ? 'success.main' : forklift.status === 'Maintenance' ? 'error.main' : 'warning.main', 
                                  bgcolor: 'background.default' 
                                }}
                              >
                                <MenuItem value="Available" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'success.main' }}>Available</MenuItem>
                                <MenuItem value="Maintenance" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'error.main' }}>Maintenance</MenuItem>
                                <MenuItem value="Rented" sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'warning.main' }}>Rented</MenuItem>
                              </Select>
                            </FormControl>
                          </Tooltip>
                          {isRented && forklift.nextAvailableDate && (
                            <Typography variant="caption" display="block" color="error.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                              Due: {new Date(forklift.nextAvailableDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Preview Customer View">
                              <IconButton color="info" onClick={() => handleOpenView(forklift)} sx={{ bgcolor: 'background.default', '&:hover': { bgcolor: 'action.hover' } }}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Vehicle">
                              <IconButton color="primary" onClick={() => handleOpenEdit(forklift)} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Vehicle">
                              <IconButton color="error" onClick={() => handleDelete(forklift._id)} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                            <InfoIcon sx={{ fontSize: 50, color: '#bdbdbd', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No vehicles found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} color="primary" size="large" shape="rounded" />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ===================================================================== */}
      {/* ADD NEW FORKLIFT MODAL */}
      {/* ===================================================================== */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>ADD NEW VEHICLE</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent dividers sx={{ borderColor: 'divider' }}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2}>
                <TextField fullWidth size="small" label="Make" name="make" value={formData.make} onChange={handleAddChange} required />
                <TextField fullWidth size="small" label="Model" name="model" value={formData.model} onChange={handleAddChange} required />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField fullWidth size="small" label="Capacity (lbs)" name="capacity" value={formData.capacity} onChange={handleAddChange} />
                <TextField fullWidth size="small" label="Power (HP)" name="power" value={formData.power} onChange={handleAddChange} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField fullWidth size="small" label="Torque" name="torque" value={formData.torque} onChange={handleAddChange} />
                <FormControl fullWidth size="small" required>
                  <InputLabel>Fuel</InputLabel>
                  <Select name="fuel" value={formData.fuel} label="Fuel" onChange={handleAddChange}>
                    {fuelOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>

              <Divider sx={{ my: 2, borderColor: 'divider' }}><Chip label="IMAGE GALLERY" size="small" fontWeight="bold" /></Divider>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  fullWidth size="small" label="Paste Image URL" value={tempAddUrl} onChange={(e) => setTempAddUrl(e.target.value)} 
                  placeholder="https://..." InputProps={{ startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} /> }} 
                />
                <Button variant="outlined" onClick={pushAddUrl} sx={{ fontWeight: 'bold' }}>ADD</Button>
              </Box>

              <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                <input accept="image/*" style={{ display: 'none' }} id="add-file-upload" multiple type="file" onChange={handleAddFileChange} />
                <label htmlFor="add-file-upload">
                  <Button variant="contained" component="span" startIcon={<AddPhotoAlternateIcon />} sx={{ bgcolor: '#424242', color: '#ffffff', '&:hover': { bgcolor: '#616161' } }}>
                    BROWSE LOCAL FILES
                  </Button>
                </label>
              </Box>

              {(addUrls.length > 0 || addPreviews.length > 0) && (
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={1} display="block">STAGED IMAGES:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {addUrls.map((url, i) => <GalleryItem key={`url-${i}`} url={url} isFile={false} onRemove={() => setAddUrls(addUrls.filter((_, idx) => idx !== i))} />)}
                    {addPreviews.map((url, i) => <GalleryItem key={`file-${i}`} url={url} isFile={true} onRemove={() => { setAddFiles(addFiles.filter((_, idx) => idx !== i)); setAddPreviews(addPreviews.filter((_, idx) => idx !== i)); }} />)}
                  </Box>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setAddModalOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>CANCEL</Button>
            <Button type="submit" variant="contained" disabled={uploading} sx={{ bgcolor: 'primary.main' }}>{uploading ? 'PROCESSING...' : 'SAVE VEHICLE'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ===================================================================== */}
      {/* EDIT FORKLIFT MODAL */}
      {/* ===================================================================== */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>EDIT VEHICLE DETAILS</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers sx={{ borderColor: 'divider' }}>
            {editFormData && (
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={2}>
                  <TextField fullWidth size="small" label="Make" name="make" value={editFormData.make} onChange={handleEditChange} required />
                  <TextField fullWidth size="small" label="Model" name="model" value={editFormData.model} onChange={handleEditChange} required />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField fullWidth size="small" label="Capacity (lbs)" name="capacity" value={editFormData.capacity} onChange={handleEditChange} />
                  <TextField fullWidth size="small" label="Power (HP)" name="power" value={editFormData.power} onChange={handleEditChange} />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField fullWidth size="small" label="Torque" name="torque" value={editFormData.torque} onChange={handleEditChange} />
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select name="fuel" value={editFormData.fuel} label="Fuel Type" onChange={handleEditChange}>
                      {fuelOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Stack>

                <Divider sx={{ my: 2, borderColor: 'divider' }}><Chip label="IMAGE GALLERY MANAGER" size="small" fontWeight="bold" /></Divider>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField 
                    fullWidth size="small" label="Add New Image URL" value={tempEditUrl} onChange={(e) => setTempEditUrl(e.target.value)} 
                    placeholder="https://..." InputProps={{ startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} /> }} 
                  />
                  <Button variant="outlined" onClick={pushEditUrl} sx={{ fontWeight: 'bold' }}>ADD</Button>
                </Box>

                <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                  <input accept="image/*" style={{ display: 'none' }} id="edit-file-upload" multiple type="file" onChange={handleEditFileChange} />
                  <label htmlFor="edit-file-upload">
                    <Button variant="contained" component="span" startIcon={<AddPhotoAlternateIcon />} sx={{ bgcolor: '#424242', color: '#ffffff', '&:hover': { bgcolor: '#616161' } }}>
                      BROWSE LOCAL FILES
                    </Button>
                  </label>
                </Box>

                {(editUrls.length > 0 || editPreviews.length > 0) && (
                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={1} display="block">MANAGE IMAGES (First image is primary):</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {editUrls.map((url, i) => <GalleryItem key={`edit-url-${i}`} url={url} isFile={false} onRemove={() => setEditUrls(editUrls.filter((_, idx) => idx !== i))} />)}
                      {editPreviews.map((url, i) => <GalleryItem key={`edit-file-${i}`} url={url} isFile={true} onRemove={() => { setEditFiles(editFiles.filter((_, idx) => idx !== i)); setEditPreviews(editPreviews.filter((_, idx) => idx !== i)); }} />)}
                    </Box>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setEditModalOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>CANCEL</Button>
            <Button type="submit" variant="contained" disabled={isEditingSaving} sx={{ bgcolor: 'primary.main' }}>{isEditingSaving ? 'SAVING...' : 'SAVE CHANGES'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ===================================================================== */}
      {/* SIMULATED CUSTOMER VIEW MODAL */}
      {/* ===================================================================== */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
        {selectedViewModel && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" component="span" fontWeight="bold">CUSTOMER PREVIEW</Typography>
              <IconButton onClick={() => setViewModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0, borderColor: 'divider' }}>
              <Box sx={{ position: 'relative', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                
                <IconButton 
                  onClick={handlePrevView} 
                  sx={{ position: 'absolute', left: 8, top: 130, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>

                <img 
                  src={activeViewImagesArray[activeViewImageIndex]} 
                  alt={selectedViewModel.model} 
                  style={{ width: '100%', height: '300px', objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }} 
                />

                <IconButton 
                  onClick={handleNextView} 
                  sx={{ position: 'absolute', right: 8, top: 130, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>

                {activeViewImagesArray.length > 1 && (
                  <Stack direction="row" spacing={1} sx={{ p: 1.5, width: '100%', overflowX: 'auto', bgcolor: 'background.paper' }}>
                    {activeViewImagesArray.map((imgUrl, index) => (
                      <Box 
                        key={index} 
                        onClick={() => setActiveViewImageIndex(index)}
                        sx={{ 
                          width: 60, height: 45, flexShrink: 0, cursor: 'pointer',
                          borderRadius: 1, overflow: 'hidden', 
                          border: '3px solid',
                          borderColor: activeViewImageIndex === index ? 'primary.main' : 'transparent',
                          opacity: activeViewImageIndex === index ? 1 : 0.6,
                          '&:hover': { opacity: 1 }
                        }}
                      >
                        <img src={imgUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Box sx={{ p: 4, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="h4" fontWeight="900" color="primary.main">{selectedViewModel.make} {selectedViewModel.model}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Rating value={selectedViewModel.rating || 0} readOnly size="small" precision={0.5} />
                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                            {selectedViewModel.rating ? selectedViewModel.rating.toFixed(1) : '0'} ({selectedViewModel.numReviews || 0} Reviews)
                        </Typography>
                    </Box>
                  </Box>
                  <Chip label={selectedViewModel.status || 'Available'} color={selectedViewModel.status === 'Available' ? 'success' : selectedViewModel.status === 'Rented' ? 'warning' : 'error'} sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                </Box>
                
                {selectedViewModel.status !== 'Available' && (
                    <Typography variant="subtitle2" color="error.main" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                       Notice: {renderAvailabilityText(selectedViewModel)}
                    </Typography>
                )}

                <List disablePadding sx={{ mt: selectedViewModel.status === 'Available' ? 3 : 1 }}>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><BuildCircleIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Make & Model" secondary={`${selectedViewModel.make} ${selectedViewModel.model}`} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><FitnessCenterIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Lift Capacity" secondary={selectedViewModel.capacity ? `${selectedViewModel.capacity} lbs` : 'Standard / Unspecified'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><EvStationIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Horsepower" secondary={selectedViewModel.power ? `${selectedViewModel.power} HP` : 'N/A'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><LocalGasStationIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Fuel Type" secondary={selectedViewModel.fuel || 'N/A'} />
                  </ListItem>
                </List>

                {/* CUSTOMER REVIEWS SECTION */}
                <Divider sx={{ my: 4, borderColor: 'divider' }} />
                <Typography variant="h6" fontWeight="900" color="primary.main" sx={{ mb: 3 }}>
                    VERIFIED CUSTOMER REVIEWS
                </Typography>

                {reviewCount > 0 ? (
                    <>
                        <Stack spacing={3}>
                            {displayedReviews.map((review, idx) => (
                                <Box key={idx} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 'bold' }}>
                                            {review.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{review.name}</Typography>
                                            <Rating value={review.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', alignSelf: 'flex-start' }}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    
                                    <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
                                        "{review.comment}"
                                    </Typography>

                                    {review.images && review.images.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                                            {review.images.map((img, imgIdx) => (
                                                <Avatar 
                                                  key={imgIdx} 
                                                  src={img} 
                                                  variant="rounded" 
                                                  sx={{ width: 80, height: 80, border: '1px solid #ccc', cursor: 'pointer' }} 
                                                  onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                        
                        {reviewPageCount > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pt: 2 }}>
                                <Pagination count={reviewPageCount} page={reviewPage} onChange={(e, value) => setReviewPage(value)} color="primary" />
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body1" color="text.secondary" fontWeight="bold">
                            No reviews yet for this model.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                            Book it today and be the first to leave feedback!
                        </Typography>
                    </Box>
                )}

              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={() => setViewModalOpen(false)} sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 2 }}>CLOSE PREVIEW</Button>
              <Button 
                variant="contained" size="large" 
                disabled={true} 
                startIcon={<CalendarMonthIcon />}
                sx={{ bgcolor: 'action.disabledBackground', color: 'text.disabled', fontWeight: '800', px: 4 }}
              >
                (CUSTOMER BOOKING BUTTON)
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}