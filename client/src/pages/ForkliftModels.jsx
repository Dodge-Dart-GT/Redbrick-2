import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, TextField, Button, Card, CardMedia,
  CardContent, Chip, InputAdornment, List, ListItem, 
  ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Stack
} from '@mui/material';
import Navbar from '../components/Navbar';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import EvStationIcon from '@mui/icons-material/EvStation';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'; 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'; 

export default function ForkliftModels() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedModel, setSelectedModel] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); // NEW: Tracks which image is active

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/forklifts');
        setModels(data);
      } catch (error) {
        console.error('Failed to fetch models', error);
      }
    };
    fetchModels();
  }, []);

  const filteredModels = models.filter(m => 
    m.make?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (model) => {
    setSelectedModel(model);
    setActiveImageIndex(0); // Reset to first image when opening
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedModel(null), 300);
  };

  // Vehicle Navigation Logic
  const handleNext = () => {
    const currentIndex = filteredModels.findIndex(m => m._id === selectedModel._id);
    const nextIndex = (currentIndex + 1) % filteredModels.length; 
    setSelectedModel(filteredModels[nextIndex]);
    setActiveImageIndex(0); // Reset image index for the new vehicle
  };

  const handlePrev = () => {
    const currentIndex = filteredModels.findIndex(m => m._id === selectedModel._id);
    const prevIndex = (currentIndex - 1 + filteredModels.length) % filteredModels.length; 
    setSelectedModel(filteredModels[prevIndex]);
    setActiveImageIndex(0); // Reset image index for the new vehicle
  };

  // Helper to safely get the array of images
  const getModelImages = (model) => {
    if (!model) return [];
    if (model.images && model.images.length > 0) return model.images;
    if (model.image) return [model.image];
    return ['https://placehold.co/600x400?text=No+Vehicle+Image']; // Fixed fallback
  };

  const activeImagesArray = getModelImages(selectedModel);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1a237e', letterSpacing: '-0.5px' }}>
              OUR FLEET
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse {filteredModels.length} available models for your next project.
            </Typography>
          </Box>
          <TextField 
            placeholder="Search make or model..." size="small" variant="outlined"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'white', borderRadius: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
          />
        </Box>

        <Grid container spacing={4}>
          {filteredModels.map((model) => {
            const displayImage = getModelImages(model)[0];

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={model._id}>
                <Card 
                  elevation={0}
                  onClick={() => handleOpenModal(model)}
                  sx={{ 
                    borderRadius: 3, border: '1px solid #e0e0e0',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)', borderColor: '#1a237e' }
                  }}
                >
                  <CardMedia
                    component="img" height="220"
                    image={displayImage}
                    alt={`${model.make} ${model.model}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>{model.make} {model.model}</Typography>
                    <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label={model.status || 'Available'} size="small" color={model.status === 'Rented' ? 'error' : 'success'} sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                      <Typography variant="button" sx={{ color: '#1a237e', fontWeight: 'bold' }}>DETAILS</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      {/* --- MODAL --- */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedModel && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a237e', color: 'white' }}>
              <Typography variant="h6" component="span" fontWeight="bold">VEHICLE SPECIFICATIONS</Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0 }}>
              {/* IMAGE WRAPPER WITH CAROUSEL ARROWS FOR VEHICLES */}
              <Box sx={{ position: 'relative', bgcolor: '#f1f3f5', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                
                <IconButton 
                  onClick={handlePrev} 
                  sx={{ position: 'absolute', left: 8, top: 130, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>

                {/* Main Active Image */}
                <img 
                  src={activeImagesArray[activeImageIndex]} 
                  alt={selectedModel.model} 
                  style={{ width: '100%', height: '300px', objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }} 
                />

                <IconButton 
                  onClick={handleNext} 
                  sx={{ position: 'absolute', right: 8, top: 130, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>

                {/* THUMBNAIL GALLERY (Only shows if > 1 image) */}
                {activeImagesArray.length > 1 && (
                  <Stack direction="row" spacing={1} sx={{ p: 1.5, width: '100%', overflowX: 'auto', bgcolor: '#e0e0e0' }}>
                    {activeImagesArray.map((imgUrl, index) => (
                      <Box 
                        key={index} 
                        onClick={() => setActiveImageIndex(index)}
                        sx={{ 
                          width: 60, height: 45, flexShrink: 0, cursor: 'pointer',
                          borderRadius: 1, overflow: 'hidden', 
                          border: activeImageIndex === index ? '3px solid #1a237e' : '2px solid transparent',
                          opacity: activeImageIndex === index ? 1 : 0.6,
                          '&:hover': { opacity: 1 }
                        }}
                      >
                        <img src={imgUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" fontWeight="900" color="#1a237e">{selectedModel.make} {selectedModel.model}</Typography>
                  <Chip label={selectedModel.status || 'Available'} color={selectedModel.status === 'Rented' ? 'error' : 'success'} sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                </Box>

                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><BuildCircleIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Make & Model" secondary={`${selectedModel.make} ${selectedModel.model}`} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><FitnessCenterIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Lift Capacity" secondary={selectedModel.capacity || 'Standard / Unspecified'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><EvStationIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Power Type" secondary={selectedModel.power || 'Electric / Gas'} />
                  </ListItem>
                </List>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
              <Button onClick={handleCloseModal} sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 2 }}>CANCEL</Button>
              <Button 
                variant="contained" size="large" disabled={selectedModel.status === 'Rented'} startIcon={<CalendarMonthIcon />}
                sx={{ bgcolor: '#1a237e', fontWeight: '800', px: 4, '&:hover': { bgcolor: '#0d1440' } }}
                onClick={() => navigate(`/book/${selectedModel._id}`, { state: { model: selectedModel } })} 
              >
                {selectedModel.status === 'Rented' ? 'UNAVAILABLE' : 'BOOK MODEL'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}