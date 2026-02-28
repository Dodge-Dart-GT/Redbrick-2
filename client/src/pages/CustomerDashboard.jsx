import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, List, ListItem,
  ListItemText, ListItemIcon, TextField, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Pagination, Avatar, Stack, Rating, Snackbar, Alert, CircularProgress
} from '@mui/material';
import Navbar from '../components/Navbar';

// Icons
import ForkliftIcon from '@mui/icons-material/Forklift';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoIcon from '@mui/icons-material/Info';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import RateReviewIcon from '@mui/icons-material/RateReview'; 
import StarIcon from '@mui/icons-material/Star';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'; 

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [myRentals, setMyRentals] = useState([]);
  const [stats, setStats] = useState({ requested: 0, active: 0, completed: 0, due: 0 });

  // Details Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // --- NEW: Cancel Booking Modal State ---
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rentalToCancel, setRentalToCancel] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState("");
  const [uploading, setUploading] = useState(false); 
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 5; 

  useEffect(() => {
    fetchMyRentals();
  }, [navigate]);

  const fetchMyRentals = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { navigate('/login'); return; }

    try {
      const { data } = await axios.get(`/api/rentals/myrequests/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMyRentals(sortedData);

      setStats({
        requested: sortedData.filter(r => r.status === 'Pending').length,
        active: sortedData.filter(r => r.status === 'Active').length,
        completed: sortedData.filter(r => r.status === 'Completed').length,
        // Combined Rejected and Cancelled into the same warning metric
        due: sortedData.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length 
      });
    } catch (error) {
      console.error("Error fetching rentals:", error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Pending': return 'primary';
      case 'Rejected': 
      case 'Cancelled': return 'error'; // Both return red chips
      case 'Completed': return 'default';
      default: return 'default';
    }
  };

  const getAlertIcon = (status) => {
    switch(status) {
      case 'Active': return <CheckCircleIcon fontSize="small" color="success" />;
      case 'Rejected': 
      case 'Cancelled': return <CancelIcon fontSize="small" color="error" />;
      case 'Completed': return <DoneAllIcon fontSize="small" color="action" />;
      default: return <InfoIcon fontSize="small" color="info" />;
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  };

  const getReturnStatus = (expectedEnd, actualReturn) => {
    if (!actualReturn) return null;
    const expected = new Date(expectedEnd).setHours(0,0,0,0);
    const returned = new Date(actualReturn).setHours(0,0,0,0);
    
    if (returned < expected) return { label: 'Returned Early', color: '#2e7d32', bg: '#e8f5e9' }; 
    if (returned > expected) return { label: 'Returned Late', color: '#d32f2f', bg: '#ffebee' }; 
    return { label: 'Returned On Time', color: '#1565c0', bg: '#e3f2fd' }; 
  };

  const filteredRentals = myRentals.filter(r => 
    (r.forklift?.model || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.forklift?.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.max(1, Math.ceil(filteredRentals.length / ITEMS_PER_PAGE));
  const displayedRentals = filteredRentals.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // --- NEW: CANCEL BOOKING HANDLERS ---
  const handleOpenCancel = (rental) => {
    setRentalToCancel(rental);
    setCancelModalOpen(true);
  };

  const executeCancelBooking = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      await axios.put(`/api/rentals/${rentalToCancel._id}`, 
        { status: 'Cancelled' }, 
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setSnackbar({ open: true, message: 'Booking successfully cancelled.', severity: 'info' });
      setCancelModalOpen(false);
      if (openModal) setOpenModal(false); // Close details modal if open
      fetchMyRentals(); 
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to cancel booking.', severity: 'error' });
    }
  };

  const handleOpenReview = (rental) => {
    setReviewTarget(rental);
    setRating(0);
    setComment("");
    setReviewImage("");
    setUploading(false);
    setReviewModalOpen(true);
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); 
    setUploading(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo?.token}` 
        } 
      };
      
      const { data } = await axios.post('/api/upload', formData, config);
      
      setReviewImage(data.url || data.secure_url || data); 
      setUploading(false);
      setSnackbar({ open: true, message: 'Image uploaded successfully!', severity: 'success' });
    } catch (error) {
      console.error("Upload Error:", error);
      setUploading(false);
      setSnackbar({ open: true, message: 'Image upload failed. Please try again.', severity: 'error' });
    }
  };

  const submitReview = async () => {
    if (!rating || !comment) {
      setSnackbar({ open: true, message: 'Rating and Comment are required fields.', severity: 'warning' });
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      await axios.post(`/api/forklifts/${reviewTarget.forklift._id}/reviews`, {
        rating,
        comment,
        images: reviewImage ? [reviewImage] : []
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      setSnackbar({ open: true, message: 'Review successfully submitted! Thank you.', severity: 'success' });
      setReviewModalOpen(false);
      fetchMyRentals(); 
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to submit review.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', pb: 8 }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1500, mx: 'auto' }}>
        <Grid container spacing={4}>
          
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3}>
              {[
                { label: 'Pending Requests', val: stats.requested, col: '#1976d2', icon: <ForkliftIcon /> },
                { label: 'Active Rentals', val: stats.active, col: '#2e7d32', icon: <CheckCircleIcon /> },
                { label: 'Completed Jobs', val: stats.completed, col: '#455a64', icon: <DoneAllIcon /> },
                { label: 'Rejected / Cancelled', val: stats.due, col: '#d32f2f', icon: <WarningIcon /> },
              ].map((kpi, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } }}>
                    <Avatar sx={{ bgcolor: `${kpi.col}15`, color: kpi.col, width: 60, height: 60 }}>{kpi.icon}</Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>{kpi.val}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="900" color="#1a237e">RENTAL AGREEMENTS</Typography>
                <TextField 
                  placeholder="Search Models or ID..." 
                  size="small" 
                  value={searchTerm} 
                  onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                  sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <TableContainer sx={{ minHeight: 400 }}>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: '#f1f3f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>REF ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>EQUIPMENT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>DATES</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>STATUS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRentals.length > 0 ? (
                      displayedRentals.map((row) => {
                        const returnData = getReturnStatus(row.endDate, row.actualReturnDate);

                        return (
                          <TableRow key={row._id} hover>
                            <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', py: 2.5 }}>
                              #{row._id.slice(-6).toUpperCase()}
                            </TableCell>
                            
                            <TableCell sx={{ py: 2.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar 
                                      src={row.forklift?.images?.[0] || row.forklift?.image} 
                                      variant="rounded" 
                                      sx={{ width: 55, height: 55, border: '1px solid #eee' }}
                                  >
                                      <ForkliftIcon />
                                  </Avatar>
                                  <Box>
                                      <Typography variant="body1" fontWeight="bold">{row.forklift?.make || 'Unknown Make'}</Typography>
                                      <Typography variant="body2" color="text.secondary">{row.forklift?.model || 'Vehicle Unavailable'}</Typography>
                                  </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={{ py: 2.5 }}>
                              <Typography variant="body2" fontWeight="bold" color="text.primary">
                                Out: {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'N/A'}
                              </Typography>
                              
                              <Typography variant="body2" fontWeight="bold" color={row.status === 'Active' ? 'error.main' : 'text.secondary'}>
                                {row.status === 'Completed' ? 'In: ' : 'Due: '} 
                                {row.status === 'Completed' && row.actualReturnDate 
                                    ? new Date(row.actualReturnDate).toLocaleDateString() 
                                    : (row.endDate ? new Date(row.endDate).toLocaleDateString() : 'N/A')}
                              </Typography>

                              {row.status === 'Completed' && returnData && (
                                  <Chip label={returnData.label} size="small" sx={{ mt: 0.5, bgcolor: returnData.bg, color: returnData.color, fontWeight: 'bold', fontSize: '0.65rem', height: 20 }} />
                              )}
                            </TableCell>
                            
                            <TableCell sx={{ py: 2.5 }}>
                              <Chip label={row.status} color={getStatusColor(row.status)} sx={{ fontWeight: 'bold', px: 1 }} />
                            </TableCell>
                            
                            <TableCell align="center" sx={{ py: 2.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="View Details">
                                  <IconButton onClick={() => {setSelectedReq(row); setOpenModal(true);}} sx={{ bgcolor: '#f1f3f5', '&:hover': { bgcolor: '#e0e0e0' } }}>
                                    <VisibilityIcon color="primary"/>
                                  </IconButton>
                                </Tooltip>
                                
                                {/* --- THE FIX: NEW CANCEL BUTTON IN TABLE --- */}
                                {row.status === 'Pending' && (
                                  <Tooltip title="Cancel Request">
                                    <IconButton onClick={() => handleOpenCancel(row)} sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
                                      <CancelIcon color="error"/>
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {row.status === 'Completed' && (
                                  <Tooltip title="Leave a Review">
                                    <IconButton onClick={() => handleOpenReview(row)} sx={{ bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' } }}>
                                      <RateReviewIcon color="success"/>
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                            <Typography color="text.secondary" variant="h6">No rentals found matching your criteria.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                  <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} color="primary" size="large" shape="rounded" />
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0', mb: 4 }}>
              <Typography variant="h6" fontWeight="900" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1a237e' }}>
                <NotificationsActiveIcon color="warning" /> RECENT ALERTS
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ 
                maxHeight: 350, 
                overflow: 'auto', 
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px' }
              }}>
                {myRentals.slice(0, 8).map((req, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 2, borderBottom: '1px solid #f1f3f5' }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{getAlertIcon(req.status)}</ListItemIcon>
                    <ListItemText 
                      primary={`Request for ${req.forklift?.model || 'Vehicle'}`} 
                      secondary={`${req.status} - ${new Date(req.createdAt).toLocaleDateString()}`}
                      primaryTypographyProps={{ variant: 'body1', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'body2', mt: 0.5 }}
                    />
                  </ListItem>
                ))}
                {myRentals.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No recent alerts.</Typography>}
              </List>
            </Paper>

            <Paper elevation={0} sx={{ p: 5, borderRadius: 4, bgcolor: '#1a237e', color: 'white', textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="900" mb={1}>NEW PROJECT?</Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>Explore our heavy-duty fleet to find the perfect equipment.</Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 3, borderRadius: '50%', mb: 4, display: 'inline-flex' }}>
                 <ForkliftIcon sx={{ fontSize: 70, opacity: 0.9 }} />
              </Box>
              <Button variant="contained" size="large" fullWidth sx={{ bgcolor: 'white', color: '#1a237e', fontWeight: 'bold', py: 1.5, '&:hover': { bgcolor: '#f1f1f1' } }} onClick={() => navigate('/models')}>
                BROWSE CATALOG
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* --- REVIEW SUBMISSION MODAL --- */}
      <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1a237e', color: 'white', py: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <RateReviewIcon /> RATE YOUR EXPERIENCE
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 3, md: 5 }, bgcolor: '#f8f9fa' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
             <Typography variant="h6" fontWeight="bold">How was the {reviewTarget?.forklift?.make} {reviewTarget?.forklift?.model}?</Typography>
             <Typography variant="body2" color="text.secondary">Your feedback helps others choose the right equipment.</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
             <Rating 
                value={rating} 
                onChange={(event, newValue) => setRating(newValue)} 
                size="large"
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                sx={{ fontSize: '3.5rem', color: '#ffb400' }}
             />

             <TextField
                label="Share your thoughts..."
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ bgcolor: 'white' }}
             />

             <Box sx={{ width: '100%', textAlign: 'left', mt: 1 }}>
               <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                 Attach a Photo (Optional)
               </Typography>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Button
                   variant="outlined"
                   component="label"
                   startIcon={uploading ? <CircularProgress size={20} /> : <PhotoCameraIcon />}
                   disabled={uploading}
                   sx={{ py: 1, px: 3, fontWeight: 'bold' }}
                 >
                   {uploading ? 'Uploading...' : 'Take or Upload Photo'}
                   <input
                     type="file"
                     hidden
                     accept="image/*"
                     onChange={uploadFileHandler}
                   />
                 </Button>
                 
                 {reviewImage && (
                   <Avatar 
                      src={reviewImage} 
                      variant="rounded" 
                      sx={{ width: 55, height: 55, border: '2px solid #1a237e' }} 
                   />
                 )}
               </Box>
             </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f1f3f5' }}>
          <Button onClick={() => setReviewModalOpen(false)} sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 2 }}>Cancel</Button>
          <Button onClick={submitReview} variant="contained" size="large" sx={{ fontWeight: 'bold', bgcolor: '#1a237e', px: 5 }} disabled={uploading}>Submit Review</Button>
        </DialogActions>
      </Dialog>

      {/* --- NEW: CANCEL CONFIRMATION MODAL --- */}
      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#d32f2f', color: 'white', textAlign: 'center' }}>
          Cancel Booking Request
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4, textAlign: 'center' }}>
          <CancelIcon sx={{ fontSize: 70, color: '#d32f2f', mb: 2 }} />
          <Typography variant="h6" fontWeight="900" gutterBottom>Are you sure?</Typography>
          <Typography variant="body2" color="text.secondary">
            This will permanently cancel your request for the <strong>{rentalToCancel?.forklift?.make} {rentalToCancel?.forklift?.model}</strong>. You will need to submit a new request if you change your mind.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setCancelModalOpen(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Keep Booking</Button>
          <Button onClick={executeCancelBooking} variant="contained" color="error" sx={{ fontWeight: 'bold', px: 4 }}>Yes, Cancel It</Button>
        </DialogActions>
      </Dialog>

      {/* --- AGREEMENT DETAILS MODAL --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1a237e', color: 'white', py: 2.5 }}>
          AGREEMENT DETAILS
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 3, md: 5 }, bgcolor: '#f8f9fa' }}>
          {selectedReq && (
            <Grid container spacing={4}>
              
              <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Avatar 
                    src={selectedReq.forklift?.images?.[0] || selectedReq.forklift?.image} 
                    variant="rounded" 
                    sx={{ width: 120, height: 120, border: '1px solid #e0e0e0', bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                    <ForkliftIcon sx={{ fontSize: 60 }} color="action" />
                </Avatar>
                <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight="900" letterSpacing={1.5}>
                        EQUIPMENT REQUESTED
                    </Typography>
                    <Typography variant="h4" fontWeight="900" color="#1a237e" sx={{ mb: 1, mt: 0.5 }}>
                        {selectedReq.forklift?.make || 'Unknown Make'} {selectedReq.forklift?.model || ''}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'inline-block', bgcolor: '#e0e0e0', color: '#616161', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 'bold' }}>
                        Ref ID: #{selectedReq._id.toUpperCase()}
                    </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>
                  CURRENT STATUS
                </Typography> 
                <Chip label={selectedReq.status} color={getStatusColor(selectedReq.status)} sx={{ fontWeight: 'bold', px: 3, py: 3, fontSize: '1.2rem', borderRadius: 2 }} />
              </Grid>

              <Grid size={{ xs: 12 }}><Divider /></Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 'bold' }}>
                  <CalendarMonthIcon /> RENTAL TIMEFRAME
                </Typography>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 4, bgcolor: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Stack direction="row" spacing={4} justifyContent="space-between">
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Start Date</Typography>
                            <Typography variant="h6" fontWeight="900">{new Date(selectedReq.startDate).toLocaleDateString()}</Typography>
                        </Box>
                        <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Expected End</Typography>
                            <Typography variant="h6" fontWeight="900">{new Date(selectedReq.endDate).toLocaleDateString()}</Typography>
                        </Box>
                    </Stack>
                    
                    {selectedReq.status === 'Completed' && selectedReq.actualReturnDate && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '2px dashed #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Actual Return</Typography>
                              <Typography variant="h6" fontWeight="900" color="#2e7d32">{new Date(selectedReq.actualReturnDate).toLocaleDateString()}</Typography>
                          </Box>
                          <Box textAlign="right">
                             {(() => {
                               const rData = getReturnStatus(selectedReq.endDate, selectedReq.actualReturnDate);
                               return rData ? <Chip label={rData.label} sx={{ bgcolor: rData.bg, color: rData.color, fontWeight: 'bold' }} size="small" /> : null;
                             })()}
                          </Box>
                      </Box>
                    )}

                    {!selectedReq.actualReturnDate && (
                      <Box sx={{ mt: 3, pt: 3, borderTop: '2px dashed #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="bold" color="text.secondary">Total Duration:</Typography>
                          <Typography variant="h5" color="primary.main" fontWeight="900">{calculateDays(selectedReq.startDate, selectedReq.endDate)} Day(s)</Typography>
                      </Box>
                    )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 'bold' }}>
                  <BuildCircleIcon /> VEHICLE SPECIFICATIONS
                </Typography>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 4, bgcolor: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <Grid container spacing={3}>
                      <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Lift Capacity</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedReq.forklift?.capacity ? `${selectedReq.forklift.capacity} lbs` : 'N/A'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Horsepower</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedReq.forklift?.power ? `${selectedReq.forklift.power} HP` : 'N/A'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Torque Rating</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedReq.forklift?.torque || 'N/A'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Fuel Type</Typography>
                          <Typography variant="body1" fontWeight="bold">{selectedReq.forklift?.fuel || 'N/A'}</Typography>
                      </Grid>
                   </Grid>
                </Paper>
              </Grid>

              {/* --- THE FIX: NEW CANCEL SECTION INSIDE MODAL --- */}
              {selectedReq.status === 'Pending' && (
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: '#ffebee', borderRadius: 4, border: '1px solid #ffcdd2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold" color="#c62828">Change of Plans?</Typography>
                        <Typography variant="body2" color="text.secondary">You can safely cancel this booking before it is approved.</Typography>
                      </Box>
                      <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => handleOpenCancel(selectedReq)} sx={{ fontWeight: 'bold', boxShadow: 'none' }}>
                        CANCEL BOOKING
                      </Button>
                  </Paper>
                </Grid>
              )}

              {selectedReq.status === 'Rejected' && selectedReq.rejectionReason && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2, fontWeight: 'bold' }}>
                    <CancelIcon /> REJECTION DETAILS
                  </Typography>
                  <Box sx={{ p: 4, bgcolor: '#ffebee', borderRadius: 4, border: '1px solid #ffcdd2' }}>
                      <Typography variant="body1" color="error.dark" fontWeight="500">{selectedReq.rejectionReason}</Typography>
                  </Box>
                </Grid>
              )}

            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f1f3f5' }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" size="large" sx={{ fontWeight: 'bold', bgcolor: '#1a237e', px: 5 }}>Close Window</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }}>{snackbar.message}</Alert>
      </Snackbar>

    </Box>
  );
}