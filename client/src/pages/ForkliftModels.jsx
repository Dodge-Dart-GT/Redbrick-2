import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, TextField, Button, Card, CardMedia,
  CardContent, Chip, InputAdornment, List, ListItem, 
  ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Stack, MenuItem, Select, FormControl, InputLabel,
  Rating, Divider, Pagination, Container, Paper, useTheme, useMediaQuery
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

export default function ForkliftModels() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [makeFilter, setMakeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const MODELS_PER_PAGE = isMobile ? 6 : 8; 
  const [selectedModel, setSelectedModel] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); 
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 3;

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

  const activeImagesArray = getModelImages(selectedModel);

  const handleNextImage = (e) => {
    e.stopPropagation(); 
    if (activeImagesArray.length <= 1) return;
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % activeImagesArray.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (activeImagesArray.length <= 1) return;
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + activeImagesArray.length) % activeImagesArray.length);
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
      
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 } }}>
        
        <Box sx={{ mb: 4 }}>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="900" sx={{ color: '#B22222', letterSpacing: '-0.5px' }}>
              OUR FLEET
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse {filteredModels.length} models for your next project.
            </Typography>
        </Box>

        {/* SEARCH & FILTERS */}
        <Box sx={{ 
          display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 4, p: 2, 
          bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2, borderRight: { md: '1px solid', borderColor: 'divider' } }}>
                <FilterListIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">FILTERS</Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                <Grid item xs={12} sm={4}>
                    <TextField 
                        fullWidth placeholder="Search models..." size="small"
                        value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Manufacturer</InputLabel>
                        <Select value={makeFilter} label="Manufacturer" onChange={(e) => {setMakeFilter(e.target.value); setPage(1);}}>
                            {uniqueMakes.map(make => <MenuItem key={make} value={make}>{make}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={statusFilter} label="Status" onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}>
                            <MenuItem value="All">All Statuses</MenuItem>
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Rented">Rented</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Box>

        <Grid container spacing={isMobile ? 2 : 4}>
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
                    bgcolor: 'background.paper', transition: 'all 0.2s', cursor: 'pointer', height: '100%', 
                    display: 'flex', flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6, borderColor: '#B22222' }
                  }}
                >
                  <CardMedia
                    component="img" 
                    height={isMobile ? "180" : "220"}
                    image={displayImage}
                    alt={`${model.make} ${model.model}`}
                    loading="lazy" // SPEED OPTIMIZATION
                    sx={{ objectFit: 'cover', opacity: isAvailable ? 1 : 0.7, bgcolor: 'action.hover' }}
                  />
                  
                  {getModelImages(model).length > 1 && (
                      <Chip 
                        size="small" label={`+${getModelImages(model).length - 1} Photos`} 
                        sx={{ position: 'absolute', top: 12, right: 12, height: 20, fontSize: '0.6rem', fontWeight: 'bold', bgcolor: 'rgba(255,255,255,0.9)', color: '#000', backdropFilter: 'blur(4px)' }} 
                      />
                  )}

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, p: isMobile ? 2 : 3 }}>
                    <Typography variant="subtitle1" fontWeight="900" sx={{ lineHeight: 1.2, color: 'text.primary' }}>{model.make} {model.model}</Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={model.rating || 0} readOnly size="small" precision={0.5} />
                        <Typography variant="caption" color="text.secondary">({model.numReviews || 0})</Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                        <span><strong>Cap:</strong> {model.capacity || 'N/A'}</span>
                        <span><strong>HP:</strong> {model.power || 'N/A'}</span>
                    </Typography>

                    <Box sx={{ mt: 'auto', pt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                      <Chip 
                        label={model.status || 'Available'} size="small" 
                        sx={{ fontWeight: 'bold', fontSize: '0.7rem', bgcolor: isAvailable ? '#2e7d32' : '#ed6c02', color: 'white' }} 
                      />
                      <Typography variant="caption" sx={{ color: '#B22222', fontWeight: 'bold' }}>VIEW SPECS</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} color="primary" size={isMobile ? "small" : "medium"} />
            </Box>
        )}
      </Container>

      {/* MODAL */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal} 
        maxWidth="sm" 
        fullWidth 
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, bgcolor: 'background.paper' } }}
      >
        {selectedModel && (
          <>
            <DialogTitle 
              component="div" // NESTING FIX
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                bgcolor: '#B22222', 
                color: 'white', 
                py: isMobile ? 1.5 : 2 
              }}
            >
              <Typography variant="h6" component="span" fontWeight="bold">VEHICLE SPECIFICATIONS</Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0, bgcolor: 'background.paper', borderColor: 'divider' }}>
              <Box sx={{ position: 'relative', bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', height: isMobile ? '250px' : '350px', overflow: 'hidden' }}>
                {activeImagesArray.length > 1 && (
                  <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 8, zIndex: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    <ArrowBackIosNewIcon fontSize="small" />
                  </IconButton>
                )}
                
                <img 
                    src={activeImagesArray[activeImageIndex]} 
                    alt="Forklift View" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
                
                {activeImagesArray.length > 1 && (
                  <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 8, zIndex: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ p: isMobile ? 2 : 4 }}>
                <Typography variant="h5" fontWeight="900" sx={{ color: '#B22222' }}>{selectedModel.make} {selectedModel.model}</Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>LIFT CAPACITY</Typography>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: 'text.primary' }}>{selectedModel.capacity || 'N/A'}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>HORSEPOWER</Typography>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: 'text.primary' }}>{selectedModel.power || 'N/A'}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />
                
                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon><BuildCircleIcon sx={{ color: '#B22222' }} /></ListItemIcon>
                    <ListItemText primary="Equipment Type" secondary={selectedModel.type || 'Forklift'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon><FitnessCenterIcon sx={{ color: '#B22222' }} /></ListItemIcon>
                    <ListItemText primary="Status" secondary={selectedModel.status || 'Available'} />
                  </ListItem>
                </List>

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" fontWeight="900" sx={{ mb: 2, color: '#B22222' }}>CUSTOMER REVIEWS</Typography>
                
                <Stack spacing={2}>
                    {displayedReviews.length > 0 ? displayedReviews.map((review, i) => (
                      <Box key={i} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography variant="caption" fontWeight="bold" sx={{ color: 'text.primary' }}>{review.name || 'Verified User'}</Typography>
                           <Rating value={review.rating} readOnly size="small" />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontStyle: 'italic' }}>"{review.comment}"</Typography>
                      </Box>
                    )) : (
                      <Typography variant="body2" color="text.disabled">No reviews yet for this model.</Typography>
                    )}
                </Stack>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Button 
                fullWidth variant="contained" size="large" 
                disabled={!isBookable} 
                onClick={handleBookClick} 
                startIcon={<CalendarMonthIcon />}
                sx={{ bgcolor: '#B22222', fontWeight: '800', py: 1.5, '&:hover': { bgcolor: '#8b1a1a' } }}
              >
                BOOK RENTAL
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}