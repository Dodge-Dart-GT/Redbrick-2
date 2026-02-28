import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, TextField, Button, Card, CardMedia,
  CardContent, Chip, InputAdornment, List, ListItem, 
  ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Stack, MenuItem, Select, FormControl, InputLabel,
  Rating, Avatar, Divider, Pagination
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
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'; // <-- NEW IMPORT

export default function ForkliftModels() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [makeFilter, setMakeFilter] = useState('All');
  
  const [selectedModel, setSelectedModel] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); 
  
  // Review Pagination State
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

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

  const uniqueMakes = ['All', ...new Set(models.map(m => m.make).filter(Boolean))];

  const filteredModels = models.filter(m => {
    const matchesSearch = (m.make || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.model || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesMake = makeFilter === 'All' || m.make === makeFilter;
    
    return matchesSearch && matchesStatus && matchesMake;
  });

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

  const handleNext = () => {
    const currentIndex = filteredModels.findIndex(m => m._id === selectedModel._id);
    const nextIndex = (currentIndex + 1) % filteredModels.length; 
    setSelectedModel(filteredModels[nextIndex]);
    setActiveImageIndex(0); 
    setReviewPage(1);
  };

  const handlePrev = () => {
    const currentIndex = filteredModels.findIndex(m => m._id === selectedModel._id);
    const prevIndex = (currentIndex - 1 + filteredModels.length) % filteredModels.length; 
    setSelectedModel(filteredModels[prevIndex]);
    setActiveImageIndex(0); 
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

  const activeImagesArray = getModelImages(selectedModel);
  const isBookable = selectedModel ? (selectedModel.status === 'Available' || selectedModel.status === 'Rented') : false;

  const reviewCount = selectedModel?.reviews?.length || 0;
  const reviewPageCount = Math.max(1, Math.ceil(reviewCount / REVIEWS_PER_PAGE));
  const displayedReviews = selectedModel?.reviews 
    ? [...selectedModel.reviews]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
        .slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)
    : [];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', pb: 8 }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1a237e', letterSpacing: '-0.5px' }}>
              OUR FLEET
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse {filteredModels.length} available models for your next project.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5, p: 2, bgcolor: 'white', borderRadius: 3, border: '1px solid #e0e0e0', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2, borderRight: { md: '1px solid #eee' } }}>
                <FilterListIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">FILTERS:</Typography>
            </Box>
            
            <TextField 
                placeholder="Search models..." size="small" variant="outlined"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: { xs: '100%', sm: 250 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Manufacturer</InputLabel>
                <Select value={makeFilter} label="Manufacturer" onChange={(e) => setMakeFilter(e.target.value)}>
                    {uniqueMakes.map(make => <MenuItem key={make} value={make}>{make}</MenuItem>)}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Rented">Rented</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                </Select>
            </FormControl>
        </Box>

        <Grid container spacing={4}>
          {filteredModels.map((model) => {
            const displayImage = getModelImages(model)[0];
            const isAvailable = model.status === 'Available';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={model._id}>
                <Card 
                  elevation={0}
                  onClick={() => handleOpenModal(model)}
                  sx={{ 
                    borderRadius: 3, border: '1px solid #e0e0e0', position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)', borderColor: '#1a237e' }
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

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1.2 }}>{model.make} {model.model}</Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={model.rating || 0} readOnly size="small" precision={0.5} emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            ({model.numReviews || 0})
                        </Typography>
                    </Box>
                    
                    {/* --- THE FIX: APPENDED lbs AND HP TO THE CARDS --- */}
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <span><strong>Cap:</strong> {model.capacity ? `${model.capacity} lbs` : 'N/A'}</span>
                        <span><strong>Pwr:</strong> {model.power ? `${model.power} HP` : 'N/A'}</span>
                    </Typography>

                    <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f3f5' }}>
                      <Chip 
                        label={model.status || 'Available'} size="small" 
                        color={isAvailable ? 'success' : model.status === 'Rented' ? 'warning' : 'error'} 
                        sx={{ fontWeight: 'bold', borderRadius: 1 }} 
                      />
                      <Typography variant="button" sx={{ color: '#1a237e', fontWeight: 'bold' }}>DETAILS</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
          {filteredModels.length === 0 && (
              <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
                  <InfoIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No vehicles found matching your filters.</Typography>
                  <Button onClick={() => {setStatusFilter('All'); setMakeFilter('All'); setSearchTerm('');}} sx={{ mt: 2 }}>Clear Filters</Button>
              </Box>
          )}
        </Grid>
      </Box>

      {/* MODAL */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedModel && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a237e', color: 'white' }}>
              <Typography variant="h6" component="span" fontWeight="bold">VEHICLE SPECIFICATIONS</Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0 }}>
              <Box sx={{ position: 'relative', bgcolor: '#f1f3f5', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                
                <IconButton 
                  onClick={handlePrev} 
                  sx={{ position: 'absolute', left: 8, top: 130, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>

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

              <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="h4" fontWeight="900" color="#1a237e">{selectedModel.make} {selectedModel.model}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Rating value={selectedModel.rating || 0} readOnly size="small" precision={0.5} />
                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                            {selectedModel.rating ? selectedModel.rating.toFixed(1) : '0'} ({selectedModel.numReviews || 0} Reviews)
                        </Typography>
                    </Box>
                  </Box>
                  <Chip label={selectedModel.status || 'Available'} color={selectedModel.status === 'Available' ? 'success' : selectedModel.status === 'Rented' ? 'warning' : 'error'} sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                </Box>
                
                {selectedModel.status !== 'Available' && (
                    <Typography variant="subtitle2" color="error.main" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                       Notice: {renderAvailabilityText(selectedModel)}
                    </Typography>
                )}

                {/* --- THE FIX: ADDED UNITS AND RENAMED LABELS TO THE MODAL --- */}
                <List disablePadding sx={{ mt: selectedModel.status === 'Available' ? 3 : 1 }}>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><BuildCircleIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Make & Model" secondary={`${selectedModel.make} ${selectedModel.model}`} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><FitnessCenterIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Lift Capacity" secondary={selectedModel.capacity ? `${selectedModel.capacity} lbs` : 'Standard / Unspecified'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><EvStationIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Horsepower" secondary={selectedModel.power ? `${selectedModel.power} HP` : 'N/A'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}><LocalGasStationIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Fuel Type" secondary={selectedModel.fuel || 'N/A'} />
                  </ListItem>
                </List>

                {/* CUSTOMER REVIEWS SECTION */}
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" fontWeight="900" color="#1a237e" sx={{ mb: 3 }}>
                    VERIFIED CUSTOMER REVIEWS
                </Typography>

                {reviewCount > 0 ? (
                    <>
                        <Stack spacing={3}>
                            {displayedReviews.map((review, idx) => (
                                <Box key={idx} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e0e0e0' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#1a237e', fontWeight: 'bold' }}>
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
                                <Pagination 
                                    count={reviewPageCount} 
                                    page={reviewPage} 
                                    onChange={(e, value) => setReviewPage(value)} 
                                    color="primary" 
                                />
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f1f3f5', borderRadius: 3 }}>
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

            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
              <Button onClick={handleCloseModal} sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 2 }}>CANCEL</Button>
              <Button 
                variant="contained" size="large" 
                disabled={!isBookable} 
                startIcon={<CalendarMonthIcon />}
                sx={{ bgcolor: '#1a237e', fontWeight: '800', px: 4, '&:hover': { bgcolor: '#0d1440' } }}
                onClick={() => navigate(`/book/${selectedModel._id}`, { state: { model: selectedModel } })} 
              >
                {selectedModel.status === 'Available' ? 'BOOK MODEL' : (selectedModel.status === 'Rented' ? 'RESERVE FUTURE DATE' : 'UNAVAILABLE')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}