import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, List, ListItem,
  ListItemText, ListItemIcon, TextField, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Pagination, Avatar, Stack, Rating, Snackbar, Alert, CircularProgress, Container
} from '@mui/material';

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
import PersonIcon from '@mui/icons-material/Person'; 
import AssignmentIcon from '@mui/icons-material/Assignment'; 

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [stats, setStats] = useState({ requested: 0, active: 0, completed: 0, total: 0 });

  // Details Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // --- ADMIN MANAGEMENT MODALS ---
  const [confirmCompleteModal, setConfirmCompleteModal] = useState(false);
  const [rentalToComplete, setRentalToComplete] = useState(null);

  const [rejectModal, setRejectModal] = useState(false);
  const [rentalToReject, setRentalToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // --- CUSTOMER ACTION MODALS (Kept for Admin's personal rentals) ---
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rentalToCancel, setRentalToCancel] = useState(null);

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

  // Store logged-in user ID to conditionally show customer actions
  const currentUserInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchAllRentals();
  }, [navigate]);

  const fetchAllRentals = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { navigate('/login'); return; }

    try {
      const { data } = await axios.get(`/api/rentals/all`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRentals(sortedData);

      setStats({
        requested: sortedData.filter(r => r.status === 'Pending').length,
        active: sortedData.filter(r => r.status === 'Active').length,
        completed: sortedData.filter(r => r.status === 'Completed').length,
        total: sortedData.length 
      });
    } catch (error) {
      console.error("Error fetching rentals:", error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': 
      case 'Cancelled': return 'error'; 
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

  const filteredRentals = rentals.filter(r => 
    (r.forklift?.model || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.forklift?.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.max(1, Math.ceil(filteredRentals.length / ITEMS_PER_PAGE));
  const displayedRentals = filteredRentals.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);


  // ==========================================
  // ADMIN ACTION HANDLERS
  // ==========================================
  const handleAccept = async (id) => {
    try {
      await axios.put(`/api/rentals/${id}`, { status: 'Active' });
      setOpenModal(false); 
      fetchAllRentals();
      setSnackbar({ open: true, message: 'Booking Approved successfully.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error approving booking.', severity: 'error' });
    }
  };

  const handleOpenReject = (id) => {
    setRentalToReject(id);
    setRejectionReason(''); 
    setRejectModal(true);
  };

  const executeRejectRental = async () => {
    try {
      await axios.put(`/api/rentals/${rentalToReject}`, { 
        status: 'Rejected',
        rejectionReason: rejectionReason || 'Declined by Administrator.' 
      });
      fetchAllRentals();
      setRejectModal(false);
      setOpenModal(false);
      setSnackbar({ open: true, message: 'Booking Rejected successfully.', severity: 'info' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error rejecting booking.', severity: 'error' });
    }
  };

  const handleOpenComplete = (req) => {
    setRentalToComplete(req);
    setConfirmCompleteModal(true);
  };

  const executeCompleteRental = async () => {
    try {
      await axios.put(`/api/rentals/${rentalToComplete._id}`, { status: 'Completed' });
      setConfirmCompleteModal(false);
      fetchAllRentals();
      setSnackbar({ open: true, message: 'Rental marked as Completed.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error completing rental.', severity: 'error' });
    }
  };


  // ==========================================
  // CUSTOMER ACTION HANDLERS (Retained Logic)
  // ==========================================
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
      if (openModal) setOpenModal(false); 
      fetchAllRentals(); 
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
      fetchAllRentals(); 
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to submit review.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      
      <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 5 } }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight="900" sx={{ color: 'primary.main' }}>
            ADMIN COMMAND CENTER
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3}>
              {[
                { label: 'Pending Requests', val: stats.requested, col: '#ed6c02', icon: <NotificationsActiveIcon /> },
                { label: 'Active Fleet', val: stats.active, col: '#2e7d32', icon: <ForkliftIcon /> },
                { label: 'Completed Jobs', val: stats.completed, col: '#455a64', icon: <DoneAllIcon /> },
                { label: 'Total Records', val: stats.total, col: '#1a237e', icon: <AssignmentIcon /> },
              ].map((kpi, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3, bgcolor: 'background.paper', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
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

          <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="900" color="text.primary">GLOBAL RENTALS</Typography>
                <TextField 
                  placeholder="Search Customer or Model..." 
                  size="small" 
                  value={searchTerm} 
                  onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                  sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.default' } }}
                />
              </Box>

              {/* THE FIX: Mathematical lock. 5 rows * 76px = 380px. + 50px header = 430px exactly. */}
              <TableContainer sx={{ height: 430, overflowX: 'auto' }}>
                {/* THE FIX: Increased minWidth to 900 to give the columns enough physical pixels to breathe */}
                <Table sx={{ minWidth: 900, width: '100%', tableLayout: 'fixed' }}>
                  <TableHead sx={{ bgcolor: 'background.default', position: 'sticky', top: 0, zIndex: 1 }}>
                    <TableRow sx={{ height: 50 }}>
                      {/* THE FIX: Redistributed widths to give Status and Actions more space */}
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5, width: '10%' }}>REF ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5, width: '22%' }}>CUSTOMER</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5, width: '24%' }}>EQUIPMENT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5, width: '18%' }}>DATES</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5, width: '14%' }}>STATUS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', py: 1.5, width: '12%' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRentals.length > 0 ? (
                      displayedRentals.map((row) => {
                        const returnData = getReturnStatus(row.endDate, row.actualReturnDate);
                        const isMyPersonalRental = row.user?._id === currentUserInfo?._id;

                        return (
                          <TableRow key={row._id} hover sx={{ height: 76 }}>
                            <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              #{row._id.slice(-6).toUpperCase()}
                            </TableCell>
                            
                            <TableCell sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight="bold" noWrap>{row.user?.firstName} {row.user?.lastName}</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap display="block">{row.user?.email}</Typography>
                            </TableCell>

                            <TableCell sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar 
                                      src={row.forklift?.images?.[0] || row.forklift?.image} 
                                      variant="rounded" 
                                      sx={{ width: 36, height: 36, border: '1px solid', borderColor: 'divider' }}
                                  >
                                      <ForkliftIcon fontSize="small" />
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="body2" fontWeight="bold" noWrap>{row.forklift?.model || 'Vehicle Unavailable'}</Typography>
                                  </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography variant="caption" fontWeight="bold" color="text.primary" display="block">
                                Out: {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'N/A'}
                              </Typography>
                              
                              <Typography variant="caption" fontWeight="bold" color={row.status === 'Active' ? 'error.main' : 'text.secondary'} display="block">
                                {row.status === 'Completed' ? 'In: ' : 'Due: '} 
                                {row.status === 'Completed' && row.actualReturnDate 
                                    ? new Date(row.actualReturnDate).toLocaleDateString() 
                                    : (row.endDate ? new Date(row.endDate).toLocaleDateString() : 'N/A')}
                              </Typography>

                              {row.status === 'Completed' && returnData && (
                                  <Chip label={returnData.label} size="small" sx={{ mt: 0.2, bgcolor: returnData.bg, color: returnData.color, fontWeight: 'bold', fontSize: '0.6rem', height: 16 }} />
                              )}
                            </TableCell>
                            
                            <TableCell sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              {/* Width constraint removed here so the chip naturally embraces the text length */}
                              <Chip label={row.status} color={getStatusColor(row.status)} size="small" sx={{ fontWeight: 'bold', minWidth: 85 }} />
                            </TableCell>
                            
                            <TableCell align="center" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                <Tooltip title="View Details / Manage">
                                  <IconButton size="small" onClick={() => {setSelectedReq(row); setOpenModal(true);}} sx={{ bgcolor: 'action.hover' }}>
                                    <VisibilityIcon color="primary" fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                {row.status === 'Active' && (
                                  <Tooltip title="Mark as Returned">
                                    <IconButton size="small" color="success" onClick={() => handleOpenComplete(row)} sx={{ bgcolor: 'background.default', '&:hover': { bgcolor: 'success.main', color: 'white' } }}>
                                      <DoneAllIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {isMyPersonalRental && row.status === 'Pending' && (
                                  <Tooltip title="Cancel My Request">
                                    <IconButton size="small" onClick={() => handleOpenCancel(row)} sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}>
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {isMyPersonalRental && row.status === 'Completed' && (
                                  <Tooltip title="Leave a Review">
                                    <IconButton size="small" onClick={() => handleOpenReview(row)} sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}>
                                      <RateReviewIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      // Matches the exact 380px content area
                      <TableRow sx={{ height: 380 }}>
                        <TableCell colSpan={6} align="center" sx={{ borderBottom: 'none' }}>
                            <Typography color="text.secondary" variant="h6">No rentals found matching your criteria.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} color="primary" size="medium" shape="rounded" />
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight="900" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <NotificationsActiveIcon color="warning" /> RECENT ALERTS
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ 
                height: 400,
                overflow: 'auto', 
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px' }
              }}>
                {rentals.slice(0, 15).map((req, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{getAlertIcon(req.status)}</ListItemIcon>
                    <ListItemText 
                      primary={`Request for ${req.forklift?.model || 'Vehicle'}`} 
                      secondary={`${req.status} - ${new Date(req.createdAt).toLocaleDateString()}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold', color: 'text.primary' }}
                      secondaryTypographyProps={{ variant: 'caption', mt: 0.5 }}
                    />
                  </ListItem>
                ))}
                {rentals.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No recent alerts.</Typography>}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* --- REVIEW SUBMISSION MODAL --- */}
      <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', py: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <RateReviewIcon /> RATE YOUR EXPERIENCE
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 3, md: 5 }, borderColor: 'divider' }}>
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
                sx={{ bgcolor: 'background.default' }}
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
                      sx={{ width: 55, height: 55, border: '2px solid', borderColor: 'primary.main' }} 
                   />
                 )}
               </Box>
             </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'background.default' }}>
          <Button onClick={() => setReviewModalOpen(false)} sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 2 }}>Cancel</Button>
          <Button onClick={submitReview} variant="contained" size="large" sx={{ fontWeight: 'bold', bgcolor: 'primary.main', px: 5 }} disabled={uploading}>Submit Review</Button>
        </DialogActions>
      </Dialog>

      {/* --- CANCEL CONFIRMATION MODAL --- */}
      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'error.main', color: 'white', textAlign: 'center' }}>
          Cancel Booking Request
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4, textAlign: 'center', borderColor: 'divider' }}>
          <CancelIcon sx={{ fontSize: 70, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" fontWeight="900" gutterBottom>Are you sure?</Typography>
          <Typography variant="body2" color="text.secondary">
            This will permanently cancel your request for the <strong>{rentalToCancel?.forklift?.make} {rentalToCancel?.forklift?.model}</strong>. You will need to submit a new request if you change your mind.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, bgcolor: 'background.default' }}>
          <Button onClick={() => setCancelModalOpen(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Keep Booking</Button>
          <Button onClick={executeCancelBooking} variant="contained" color="error" sx={{ fontWeight: 'bold', px: 4 }}>Yes, Cancel It</Button>
        </DialogActions>
      </Dialog>

      {/* --- ADMIN: CONFIRM COMPLETE MODAL --- */}
      <Dialog open={confirmCompleteModal} onClose={() => setConfirmCompleteModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'success.main', color: 'white', textAlign: 'center' }}>
          Confirm Equipment Return
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4, textAlign: 'center', borderColor: 'divider' }}>
          <DoneAllIcon sx={{ fontSize: 70, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight="900" gutterBottom>Has this vehicle been returned?</Typography>
          <Typography variant="body2" color="text.secondary">
            Marking this agreement as Completed will immediately return the <strong>{rentalToComplete?.forklift?.make} {rentalToComplete?.forklift?.model}</strong> back to the available inventory pool for future bookings.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, bgcolor: 'background.default' }}>
          <Button onClick={() => setConfirmCompleteModal(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={executeCompleteRental} variant="contained" color="success" sx={{ fontWeight: 'bold', px: 4 }}>Mark Completed</Button>
        </DialogActions>
      </Dialog>

      {/* --- ADMIN: REJECT MODAL --- */}
      <Dialog open={rejectModal} onClose={() => setRejectModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'error.main', color: 'white' }}>
          Decline Booking Request
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4, borderColor: 'divider' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom fontWeight="500">
            Please provide a reason for declining this request. This message will be sent directly to the customer's tracking dashboard.
          </Typography>
          <TextField
            fullWidth multiline rows={4} variant="outlined"
            placeholder="e.g., The requested equipment is currently out of service for maintenance..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'background.default' }}>
          <Button onClick={() => setRejectModal(false)} sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 2 }}>Cancel</Button>
          <Button onClick={executeRejectRental} variant="contained" color="error" sx={{ fontWeight: 'bold', px: 4 }}>Confirm Rejection</Button>
        </DialogActions>
      </Dialog>


      {/* --- AGREEMENT DETAILS MODAL --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md" PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', py: 2.5 }}>
          AGREEMENT DETAILS
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 3, md: 5 }, borderColor: 'divider' }}>
          {selectedReq && (
            <Grid container spacing={4}>
              
              <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Avatar 
                    src={selectedReq.forklift?.images?.[0] || selectedReq.forklift?.image} 
                    variant="rounded" 
                    sx={{ width: 120, height: 120, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', boxShadow: 2 }}
                >
                    <ForkliftIcon sx={{ fontSize: 60 }} color="action" />
                </Avatar>
                <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight="900" letterSpacing={1.5}>
                        EQUIPMENT REQUESTED
                    </Typography>
                    <Typography variant="h4" fontWeight="900" color="primary.main" sx={{ mb: 1, mt: 0.5 }}>
                        {selectedReq.forklift?.make || 'Unknown Make'} {selectedReq.forklift?.model || ''}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'inline-block', bgcolor: 'action.hover', color: 'text.primary', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 'bold' }}>
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

              {/* ADMIN: CUSTOMER INFORMATION BLOCK */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 'bold' }}>
                  <PersonIcon /> CUSTOMER INFORMATION
                </Typography>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4, bgcolor: 'background.paper' }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">Full Name</Typography>
                            <Typography variant="h6" fontWeight="bold">{selectedReq.user?.firstName} {selectedReq.user?.lastName}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">Contact Email</Typography>
                            <Typography variant="h6" fontWeight="bold">{selectedReq.user?.email}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">Phone Number</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedReq.user?.phone || 'Not Provided'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">Address</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedReq.user?.address || 'Not Provided'}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 'bold' }}>
                  <CalendarMonthIcon /> RENTAL TIMEFRAME
                </Typography>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 4, bgcolor: 'background.default', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                      <Box sx={{ mt: 2, pt: 2, borderTop: '2px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      <Box sx={{ mt: 3, pt: 3, borderTop: '2px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 4, bgcolor: 'background.default', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

              {/* ADMIN ACTION BLOCK */}
              {selectedReq.status === 'Pending' && (
                  <Grid size={{ xs: 12 }}>
                      <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: 'action.hover', borderRadius: 4, border: '1px solid', borderColor: 'info.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="bold" color="info.main">Requires Administrative Action</Typography>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                              <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleOpenReject(selectedReq._id)} sx={{ fontWeight: 'bold', bgcolor: 'background.paper', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>REJECT REQUEST</Button>
                              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleAccept(selectedReq._id)} sx={{ fontWeight: 'bold' }}>APPROVE BOOKING</Button>
                          </Box>
                      </Paper>
                  </Grid>
              )}

              {selectedReq.status === 'Rejected' && selectedReq.rejectionReason && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2, fontWeight: 'bold' }}>
                    <CancelIcon /> REJECTION DETAILS
                  </Typography>
                  <Box sx={{ p: 4, bgcolor: 'error.main', color: 'white', borderRadius: 4 }}>
                      <Typography variant="body1" fontWeight="bold">{selectedReq.rejectionReason}</Typography>
                  </Box>
                </Grid>
              )}

            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'background.default' }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" size="large" sx={{ fontWeight: 'bold', bgcolor: 'primary.main', px: 5 }}>Close Window</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }}>{snackbar.message}</Alert>
      </Snackbar>

    </Box>
  );
}