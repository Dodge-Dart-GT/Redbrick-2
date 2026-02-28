import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, List, ListItem, 
  ListItemIcon, ListItemText, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, Divider, TextField, Pagination, Avatar, Stack 
} from '@mui/material';
import Navbar from '../components/Navbar';

// Icons
import ForkliftIcon from '@mui/icons-material/Forklift'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, total: 0 });
  
  const [openModal, setOpenModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  const [confirmCompleteModal, setConfirmCompleteModal] = useState(false);
  const [rentalToComplete, setRentalToComplete] = useState(null);

  const [rejectModal, setRejectModal] = useState(false);
  const [rentalToReject, setRentalToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || (userInfo.role !== 'admin' && userInfo.role !== 'staff' && userInfo.role !== 'owner')) {
        navigate('/login');
        return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      const { data } = await axios.get('/api/rentals/all', {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(sortedData);
      
      setStats({
        pending: sortedData.filter(r => r.status === 'Pending').length,
        active: sortedData.filter(r => r.status === 'Active').length,
        completed: sortedData.filter(r => r.status === 'Completed').length,
        total: sortedData.length
      });
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`/api/rentals/${id}`, { status: 'Active' });
      setOpenModal(false); 
      fetchData();
    } catch (error) {
      alert("Error updating status");
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
      fetchData();
      setRejectModal(false);
      setOpenModal(false);
    } catch (error) {
      alert("Error updating status");
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
      fetchData();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      case 'Completed': return 'default';
      default: return 'default';
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // --- THE FIX: DYNAMIC EARLY/LATE CALCULATION ---
  const getReturnStatus = (expectedEnd, actualReturn) => {
    if (!actualReturn) return null;
    
    // Normalize to compare just the calendar days (ignore exact hours/minutes)
    const expected = new Date(expectedEnd).setHours(0,0,0,0);
    const returned = new Date(actualReturn).setHours(0,0,0,0);
    
    if (returned < expected) return { label: 'Returned Early', color: '#2e7d32', bg: '#e8f5e9' }; // Green
    if (returned > expected) return { label: 'Returned Late', color: '#d32f2f', bg: '#ffebee' }; // Red
    return { label: 'Returned On Time', color: '#1565c0', bg: '#e3f2fd' }; // Blue
  };

  const filteredRequests = requests.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (`${r.user?.firstName || ''} ${r.user?.lastName || ''}`).toLowerCase().includes(searchLower) || 
      (r.forklift?.model || "").toLowerCase().includes(searchLower) || 
      (r._id || "").toLowerCase().includes(searchLower)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const displayedRequests = filteredRequests.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', pb: 8 }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1500, mx: 'auto' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1a237e' }}>
            ADMIN COMMAND CENTER
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" sx={{ bgcolor: '#1a237e', fontWeight: 'bold', '&:hover': { bgcolor: '#0d1440' } }} onClick={() => navigate('/inventory')}>
              MANAGE FLEET INVENTORY
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Pending Approval', val: stats.pending, col: '#ed6c02', icon: <NotificationsActiveIcon /> },
            { label: 'Active Fleet', val: stats.active, col: '#2e7d32', icon: <ForkliftIcon /> },
            { label: 'Completed', val: stats.completed, col: '#455a64', icon: <DoneAllIcon /> },
            { label: 'Total Logs', val: stats.total, col: '#1a237e', icon: <AssignmentIcon /> },
          ].map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ bgcolor: `${kpi.col}15`, color: kpi.col, width: 60, height: 60 }}>{kpi.icon}</Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>{kpi.val}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{kpi.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="900" color="#1a237e">CUSTOMER AGREEMENTS</Typography>
                <TextField 
                  placeholder="Search Customer, Model, or ID..." 
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
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>CUSTOMER</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>FORKLIFT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>DATES</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>STATUS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRequests.length > 0 ? displayedRequests.map((row) => {
                      const returnData = getReturnStatus(row.endDate, row.actualReturnDate);

                      return (
                      <TableRow key={row._id} hover>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body1" fontWeight="bold">{row.user?.firstName} {row.user?.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary">#{row._id.slice(-6).toUpperCase()}</Typography>
                        </TableCell>
                        
                        <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar src={row.forklift?.images?.[0] || row.forklift?.image} variant="rounded" sx={{ width: 45, height: 45, border: '1px solid #eee' }}>
                                    <ForkliftIcon />
                                </Avatar>
                                <Typography variant="body2" fontWeight="bold">{row.forklift?.model || 'Unavailable'}</Typography>
                            </Box>
                        </TableCell>

                        {/* TABLE DATES WITH EARLY/LATE BADGE */}
                        <TableCell sx={{ py: 2 }}>
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
                        
                        <TableCell sx={{ py: 2 }}><Chip label={row.status} color={getStatusColor(row.status)} sx={{ fontWeight: 'bold', px: 1 }} /></TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Details / Manage">
                              <IconButton color="primary" onClick={() => { setSelectedReq(row); setOpenModal(true); }} sx={{ bgcolor: '#f1f3f5' }}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {row.status === 'Active' && (
                              <Tooltip title="Mark as Returned">
                                <IconButton color="success" onClick={() => handleOpenComplete(row)} sx={{ bgcolor: '#e8f5e9' }}><DoneAllIcon /></IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                    }) : (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><Typography color="text.secondary" variant="h6">No matching records found.</Typography></TableCell></TableRow>
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

          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0', height: '100%' }}>
              <Typography variant="h6" fontWeight="900" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1a237e' }}>
                <NotificationsActiveIcon color="warning" /> RECENT ACTIVITY
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ 
                maxHeight: 450, 
                overflow: 'auto', 
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px' }
              }}>
                {requests.slice(0, 10).map((req, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 2, borderBottom: '1px solid #f1f3f5' }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircleIcon color={req.status === 'Active' ? 'success' : req.status === 'Rejected' ? 'error' : 'action'} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${req.forklift?.model || 'Vehicle'} - ${req.status}`} 
                      secondary={`${req.user?.firstName} ${req.user?.lastName}`} 
                      primaryTypographyProps={{ variant: 'body1', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'body2', mt: 0.5 }}
                    />
                  </ListItem>
                ))}
                {requests.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No recent activity.</Typography>}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* --- MODAL 1: FULL DETAILS & MANAGEMENT --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1a237e', color: 'white', py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
              <Typography variant="h6" fontWeight="bold">AGREEMENT REVIEW</Typography>
              <Typography variant="caption">Ref ID: #{selectedReq?._id.toUpperCase()}</Typography>
          </Box>
          <Chip label={selectedReq?.status} color={getStatusColor(selectedReq?.status)} sx={{ fontWeight: 'bold', px: 2, fontSize: '1rem', bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 3, md: 5 }, bgcolor: '#f8f9fa' }}>
          {selectedReq && (
            <Grid container spacing={4}>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 'bold' }}>
                  <PersonIcon /> CUSTOMER INFORMATION
                </Typography>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 4, bgcolor: 'white' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">Full Name</Typography>
                            <Typography variant="h6" fontWeight="bold">{selectedReq.user?.firstName} {selectedReq.user?.lastName}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">Contact Email</Typography>
                            <Typography variant="h6" fontWeight="bold">{selectedReq.user?.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">Phone Number</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedReq.user?.phone || 'Not Provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">Address</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedReq.user?.address || 'Not Provided'}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
              </Grid>

              {/* --- THE FIX: MODAL DATES WITH EARLY/LATE DISPLAY --- */}
              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 'bold' }}>
                  <BuildCircleIcon /> EQUIPMENT REQUESTED
                </Typography>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 4, bgcolor: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                       <Avatar src={selectedReq.forklift?.images?.[0] || selectedReq.forklift?.image} variant="rounded" sx={{ width: 80, height: 80, border: '1px solid #eee' }}>
                           <ForkliftIcon fontSize="large" />
                       </Avatar>
                       <Box>
                           <Typography variant="h6" fontWeight="900" color="#1a237e">{selectedReq.forklift?.make} {selectedReq.forklift?.model}</Typography>
                       </Box>
                   </Box>
                   <Grid container spacing={2}>
                      <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Lift Capacity</Typography>
                          <Typography variant="body2" fontWeight="bold">{selectedReq.forklift?.capacity ? `${selectedReq.forklift.capacity} lbs` : 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Horsepower</Typography>
                          <Typography variant="body2" fontWeight="bold">{selectedReq.forklift?.power ? `${selectedReq.forklift.power} HP` : 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Torque Rating</Typography>
                          <Typography variant="body2" fontWeight="bold">{selectedReq.forklift?.torque || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Fuel Type</Typography>
                          <Typography variant="body2" fontWeight="bold">{selectedReq.forklift?.fuel || 'N/A'}</Typography>
                      </Grid>
                   </Grid>
                </Paper>
              </Grid>

              {selectedReq.status === 'Pending' && (
                  <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: '#e3f2fd', borderRadius: 4, border: '1px solid #bbdefb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="bold" color="#0d47a1">Requires Administrative Action</Typography>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                              <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleOpenReject(selectedReq._id)} sx={{ fontWeight: 'bold', bgcolor: 'white' }}>REJECT REQUEST</Button>
                              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleAccept(selectedReq._id)} sx={{ fontWeight: 'bold' }}>APPROVE BOOKING</Button>
                          </Box>
                      </Paper>
                  </Grid>
              )}

              {selectedReq.status === 'Rejected' && selectedReq.rejectionReason && (
                <Grid item xs={12}>
                  <Box sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 4, border: '1px solid #ffcdd2' }}>
                    <Typography variant="subtitle2" color="error.main" fontWeight="bold">Reason for Rejection:</Typography>
                    <Typography variant="body1" color="error.dark" mt={1}>{selectedReq.rejectionReason}</Typography>
                  </Box>
                </Grid>
              )}

            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f1f3f5' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Close Window</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmCompleteModal} onClose={() => setConfirmCompleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#2e7d32', color: 'white', textAlign: 'center' }}>
          Confirm Equipment Return
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4, textAlign: 'center' }}>
          <DoneAllIcon sx={{ fontSize: 70, color: '#2e7d32', mb: 2 }} />
          <Typography variant="h6" fontWeight="900" gutterBottom>Has this vehicle been returned?</Typography>
          <Typography variant="body2" color="text.secondary">
            Marking this agreement as Completed will immediately return the <strong>{rentalToComplete?.forklift?.make} {rentalToComplete?.forklift?.model}</strong> back to the available inventory pool for future bookings.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setConfirmCompleteModal(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={executeCompleteRental} variant="contained" color="success" sx={{ fontWeight: 'bold', px: 4 }}>Mark Completed</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectModal} onClose={() => setRejectModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#d32f2f', color: 'white' }}>
          Decline Booking Request
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
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
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setRejectModal(false)} sx={{ fontWeight: 'bold', color: 'text.secondary', mr: 2 }}>Cancel</Button>
          <Button onClick={executeRejectRental} variant="contained" color="error" sx={{ fontWeight: 'bold', px: 4 }}>Confirm Rejection</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}