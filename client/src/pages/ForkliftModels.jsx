import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, TextField, Button, Card, CardMedia,
  CardContent, Chip, InputAdornment, List, ListItem, 
  ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Stack, MenuItem, Select, FormControl, InputLabel,
  Rating, Avatar, Divider, Pagination, Container, Paper
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import EvStationIcon from '@mui/icons-material/EvStation';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'; 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'; 
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

export default function ForkliftModels() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [makeFilter, setMakeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const MODELS_PER_PAGE = 8; 
  const [selectedModel, setSelectedModel] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); 
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const { data } = await axios.get('/api/forklifts');
        setModels(data);
      } catch (error) {
        console.error('Failed to fetch models', error);
      }
    };
    fetchModels();
  }, []);

  const uniqueMakes = ['All', ...new Set(models.map(m => m.make).filter(Boolean))];

  const filteredModels = models.filter(m => {
    const matchesSearch = (m.make || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.model || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesMake = makeFilter === 'All' || m.make === makeFilter;
    return matchesSearch && matchesStatus && matchesMake;
  });

  const pageCount = Math.max(1, Math.ceil(filteredModels.length / MODELS_PER_PAGE));
  const displayedModels = filteredModels.slice((page - 1) * MODELS_PER_PAGE, page * MODELS_PER_PAGE);

  const handleOpenModal = (model) => {
    setSelectedModel(model);
    setActiveImageIndex(0); 
    setReviewPage(1); 
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedModel(null), 300);
  };

  const getModelImages = (model) => {
    if (!model) return [];
    if (model.images && model.images.length > 0) return model.images;
    if (model.image) return [model.image];
    return ['https://placehold.co/600x400?text=No+Vehicle+Image']; 
  };

  // --- Image Carousel Handlers ---
  const activeImagesArray = getModelImages(selectedModel);

  const handleNextImage = () => {
    if (activeImagesArray.length <= 1) return;
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % activeImagesArray.length);
  };

  const handlePrevImage = () => {
    if (activeImagesArray.length <= 1) return;
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + activeImagesArray.length) % activeImagesArray.length);
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

  const handleBookClick = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login', { 
        state: { redirectTo: `/book/${selectedModel._id}`, modelData: { model: selectedModel } } 
      });
    } else {
      navigate(`/book/${selectedModel._id}`, { state: { model: selectedModel } });
    }
  };

  const isBookable = selectedModel ? (selectedModel.status === 'Available' || selectedModel.status === 'Rented') : false;
  const reviewCount = selectedModel?.reviews?.length || 0;
  const reviewPageCount = Math.max(1, Math.ceil(reviewCount / REVIEWS_PER_PAGE));
  const displayedReviews = selectedModel?.reviews 
    ? [...selectedModel.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
        .slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)
    : [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      
      <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 5 } }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: 'primary.main', letterSpacing: '-0.5px' }}>
              OUR FLEET
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse {filteredModels.length} available models for your next project.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5, p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 3, border: '1px solid', borderColor: 'divider', alignItems: 'center' 
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2, borderRight: { md: '1px solid', borderColor: 'divider' } }}>
                <FilterListIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">FILTERS:</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
                <TextField 
                    placeholder="Search models..." size="small" variant="outlined"
                    value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                    sx={{ width: { xs: '100%', sm: 250 } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Manufacturer</InputLabel>
                    <Select value={makeFilter} label="Manufacturer" onChange={(e) => {setMakeFilter(e.target.value); setPage(1);}}>
                        {uniqueMakes.map(make => <MenuItem key={make} value={make}>{make}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}>
                        <MenuItem value="All">All Statuses</MenuItem>
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Rented">Rented</MenuItem>
                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>

        <Grid container spacing={4}>
          {displayedModels.map((model) => {
            const displayImage = getModelImages(model)[0];
            const isAvailable = model.status === 'Available';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={model._id}>
                <Card 
                  elevation={0}
                  onClick={() => handleOpenModal(model)}
                  sx={{ 
                    borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: 6, borderColor: 'primary.main' }
                  }}
                >
                  <CardMedia
                    component="img" height="220"
                    image={displayImage}
                    alt={`${model.make} ${model.model}`}
                    sx={{ objectFit: 'cover', opacity: isAvailable ? 1 : 0.7 }}
                  />
                  
                  {!isAvailable && (
                      <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', px: 1.5, py: 0.5, borderRadius: 1, backdropFilter: 'blur(4px)' }}>
                          <Typography variant="caption" fontWeight="bold">
                             {renderAvailabilityText(model)}
                          </Typography>
                      </Box>
                  )}

                  {/* Show indicator if model has multiple images - FIXED TEXT COLOR */}
                  {getModelImages(model).length > 1 && (
                      <Chip 
                        size="small" 
                        label={`+${getModelImages(model).length - 1} Photos`} 
                        sx={{ 
                          position: 'absolute', top: 12, right: 12, height: 20, 
                          fontSize: '0.65rem', fontWeight: 'bold', 
                          bgcolor: 'rgba(255,255,255,0.9)', 
                          color: '#000000', // Forces the text to be black regardless of theme
                          backdropFilter: 'blur(4px)' 
                        }} 
                      />
                  )}

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1.2, color: 'text.primary' }}>{model.make} {model.model}</Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={model.rating || 0} readOnly size="small" precision={0.5} emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            ({model.numReviews || 0})
                        </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <span><strong>Cap:</strong> {model.capacity ? `${model.capacity} lbs` : 'N/A'}</span>
                        <span><strong>Pwr:</strong> {model.power ? `${model.power} HP` : 'N/A'}</span>
                    </Typography>

                    <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                      <Chip 
                        label={model.status || 'Available'} size="small" 
                        color={isAvailable ? 'success' : model.status === 'Rented' ? 'warning' : 'error'} 
                        sx={{ fontWeight: 'bold', borderRadius: 1 }} 
                      />
                      <Typography variant="button" sx={{ color: 'primary.main', fontWeight: 'bold' }}>DETAILS</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
          {filteredModels.length === 0 && (
              <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
                  <InfoIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No vehicles found matching your filters.</Typography>
                  <Button onClick={() => {setStatusFilter('All'); setMakeFilter('All'); setSearchTerm(''); setPage(1);}} sx={{ mt: 2 }}>Clear Filters</Button>
              </Box>
          )}
        </Grid>

        {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} color="primary" size="large" shape="rounded" />
            </Box>
        )}

      </Container>

      {/* MODAL */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
        {selectedModel && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" component="span" fontWeight="bold">VEHICLE SPECIFICATIONS</Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0, borderColor: 'divider' }}>
              
              <Box sx={{ position: 'relative', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                
                {activeImagesArray.length > 1 && (
                  <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
                    <ArrowBackIosNewIcon />
                  </IconButton>
                )}
                
                <img src={activeImagesArray[activeImageIndex]} alt={selectedModel.model} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                
                {activeImagesArray.length > 1 && (
                  <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
                    <ArrowForwardIosIcon />
                  </IconButton>
                )}

                {/* Image Indicators (Dots) */}
                {activeImagesArray.length > 1 && (
                  <Box sx={{ position: 'absolute', bottom: 12, display: 'flex', gap: 1, bgcolor: 'rgba(0,0,0,0.4)', px: 1.5, py: 0.5, borderRadius: 4 }}>
                    {activeImagesArray.map((_, index) => (
                      <Box key={index} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: activeImageIndex === index ? 'white' : 'rgba(255,255,255,0.4)', transition: 'background-color 0.2s' }} />
                    ))}
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="h4" fontWeight="900" color="primary.main">{selectedModel.make} {selectedModel.model}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Rating value={selectedModel.rating || 0} readOnly size="small" precision={0.5} />
                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                            {selectedModel.rating ? selectedModel.rating.toFixed(1) : '0'} ({selectedModel.numReviews || 0} Reviews)
                        </Typography>
                    </Box>
                  </Box>
                  <Chip label={selectedModel.status || 'Available'} color={selectedModel.status === 'Available' ? 'success' : selectedModel.status === 'Rented' ? 'warning' : 'error'} sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                </Box>
                
                <List disablePadding sx={{ mt: 3 }}>
                  <ListItem disableGutters><ListItemIcon><BuildCircleIcon color="action" /></ListItemIcon><ListItemText primary="Make & Model" secondary={`${selectedModel.make} ${selectedModel.model}`} /></ListItem>
                  <ListItem disableGutters><ListItemIcon><FitnessCenterIcon color="action" /></ListItemIcon><ListItemText primary="Lift Capacity" secondary={selectedModel.capacity ? `${selectedModel.capacity} lbs` : 'Standard'} /></ListItem>
                  <ListItem disableGutters><ListItemIcon><EvStationIcon color="action" /></ListItemIcon><ListItemText primary="Horsepower" secondary={selectedModel.power ? `${selectedModel.power} HP` : 'N/A'} /></ListItem>
                </List>

                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" fontWeight="900" color="primary.main" sx={{ mb: 3 }}>VERIFIED CUSTOMER REVIEWS</Typography>
                
                {displayedReviews.length > 0 ? (
                  <Stack spacing={2}>
                    {displayedReviews.map((review, i) => (
                      <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                           <Typography variant="subtitle2" fontWeight="bold">{review.name || 'Anonymous'}</Typography>
                           <Rating value={review.rating} readOnly size="small" />
                        </Box>
                        <Typography variant="body2">{review.comment}</Typography>
                      </Paper>
                    ))}
                    {reviewPageCount > 1 && (
                      <Pagination count={reviewPageCount} page={reviewPage} onChange={(e, v) => setReviewPage(v)} size="small" sx={{ alignSelf: 'center' }} />
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">No reviews for this model yet.</Typography>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={handleCloseModal} sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 2 }}>CANCEL</Button>
              <Button variant="contained" size="large" disabled={!isBookable} startIcon={<CalendarMonthIcon />} sx={{ bgcolor: 'primary.main', fontWeight: '800', px: 4 }} onClick={handleBookClick}>
                BOOK MODEL
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
} 