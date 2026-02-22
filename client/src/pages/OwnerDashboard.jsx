import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, List, ListItem, 
  ListItemIcon, ListItemText, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, Divider, TextField, Pagination // <-- NEW IMPORTS
} from '@mui/material';
import Navbar from '../components/Navbar';
import ForkliftIcon from '@mui/icons-material/Forklift'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ requests: 0 });
  const [userRole, setUserRole] = useState('');
  
  // View Details Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // Confirm Completion Modal State
  const [confirmCompleteModal, setConfirmCompleteModal] = useState(false);
  const [rentalToComplete, setRentalToComplete] = useState(null);

  // Rejection Modal State
  const [rejectModal, setRejectModal] = useState(false);
  const [rentalToReject, setRentalToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // --- NEW: PAGINATION & SEARCH STATE ---
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) setUserRole(userInfo.role);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requestRes = await axios.get('http://localhost:5000/api/rentals/all');
      
      // Sort so the newest requests are always at the top
      const sortedData = requestRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRequests(sortedData);
      const pendingCount = sortedData.filter(r => r.status === 'Pending').length;
      setStats({ requests: pendingCount });
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${id}`, { status: 'Active' });
      alert("Agreement Accepted! The forklift is now marked as Rented.");
      fetchData();
    } catch (error) {
      alert("Error updating status");
    }
  };

  // --- REJECTION MODAL HANDLERS ---
  const handleOpenReject = (id) => {
    setRentalToReject(id);
    setRejectionReason(''); 
    setRejectModal(true);
  };

  const handleCloseReject = () => {
    setRejectModal(false);
    setRentalToReject(null);
  };

  const executeRejectRental = async () => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${rentalToReject}`, { 
        status: 'Rejected',
        rejectionReason: rejectionReason || 'Declined by Administrator.' 
      });
      fetchData();
      handleCloseReject();
    } catch (error) {
      alert("Error updating status");
    }
  };

  // --- View Details Handlers ---
  const handleOpenDetails = (req) => {
    setSelectedReq(req);
    setOpenModal(true);
  };

  const handleCloseDetails = () => {
    setOpenModal(false);
    setSelectedReq(null);
  };

  // --- Completion Handlers ---
  const handleOpenComplete = (req) => {
    setRentalToComplete(req);
    setConfirmCompleteModal(true);
  };

  const handleCloseComplete = () => {
    setConfirmCompleteModal(false);
    setRentalToComplete(null);
  };

  const executeCompleteRental = async () => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${rentalToComplete._id}`, { status: 'Completed' });
      alert("Rental Completed! The forklift is now available in your inventory.");
      handleCloseComplete();
      fetchData();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Pending': return 'info';
      case 'Rejected': return 'error';
      case 'Completed': return 'default';
      default: return 'default';
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // --- NEW: FILTER & PAGINATION LOGIC ---
  const filteredRequests = requests.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = `${r.user?.firstName} ${r.user?.lastName}`.toLowerCase();
    const modelName = r.forklift?.model?.toLowerCase() || "";
    const refId = r._id.toLowerCase();
    
    return customerName.includes(searchLower) || 
           modelName.includes(searchLower) || 
           refId.includes(searchLower);
  });

  const pageCount = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const displayedRequests = filteredRequests.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to page 1 when searching
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      
      <Box sx={{ p: 4 }}>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {userRole === 'owner' && (
            <Button variant="contained" color="error" onClick={() => navigate('/users')} sx={{ fontWeight: 'bold' }}>
              MANAGE ACCOUNTS
            </Button>
          )}
          <Button variant="contained" color="secondary" onClick={() => navigate('/inventory')} sx={{ fontWeight: 'bold' }}>
            MANAGE FLEET
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: `4px solid #0288d1` }}>
                  <NotificationsActiveIcon sx={{ color: '#0288d1' }} />
                  <Typography variant="h4" fontWeight="bold">{stats.requests}</Typography>
                  <Typography variant="body2">Pending</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: `4px solid #2e7d32` }}>
                   <ForkliftIcon sx={{ color: '#2e7d32' }} />
                   <Typography variant="h4" fontWeight="bold">-</Typography>
                   <Typography variant="body2">Active Fleet</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Paper elevation={3} sx={{ p: 3 }}>
              {/* --- NEW: SEARCH BAR IN HEADER --- */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Oswald' }}>
                  RENTAL AGREEMENTS
                </Typography>
                <TextField 
                  placeholder="Search Customer, Model, or ID..." 
                  size="small" 
                  variant="outlined" 
                  sx={{ width: 280 }} 
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                    <TableRow>
                      <TableCell><strong>Customer</strong></TableCell>
                      <TableCell><strong>Forklift</strong></TableCell>
                      <TableCell><strong>Start Date</strong></TableCell>
                      <TableCell><strong>End Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* NEW: MAP OVER displayedRequests INSTEAD OF requests */}
                    {displayedRequests.length > 0 ? (
                      displayedRequests.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell>{row.user?.firstName} {row.user?.lastName}</TableCell>
                          <TableCell>{row.forklift?.model}</TableCell>
                          <TableCell>{row.startDate ? new Date(row.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{row.endDate ? new Date(row.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              
                              <Tooltip title="View Details">
                                <IconButton color="primary" onClick={() => handleOpenDetails(row)}>
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>

                              {row.status === 'Active' && (
                                <Tooltip title="Mark as Completed/Returned">
                                  <IconButton color="secondary" onClick={() => handleOpenComplete(row)}>
                                    <DoneAllIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {row.status === 'Pending' && (
                                <>
                                  <Tooltip title="Accept">
                                    <IconButton color="success" onClick={() => handleAccept(row._id)}>
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton color="error" onClick={() => handleOpenReject(row._id)}>
                                      <CancelIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {searchTerm ? 'No rental agreements match your search.' : 'No rental agreements found.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* --- NEW: PAGINATION CONTROLS --- */}
              {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={pageCount} 
                    page={page} 
                    onChange={(e, value) => setPage(value)} 
                    color="primary" 
                    shape="rounded"
                  />
                </Box>
              )}

            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>RECENT ACTIVITY</Typography>
              <List>
                {requests.slice(0, 5).map((req, i) => (
                  <ListItem key={i}>
                    <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={`Request: ${req.forklift?.model}`} secondary={req.user?.email} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* --- FULL DETAILS MODAL --- */}
      <Dialog open={openModal} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1a237e', color: 'white' }}>
          Agreement Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedReq && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" /> CUSTOMER INFORMATION
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><strong>Name:</strong> {selectedReq.user?.firstName} {selectedReq.user?.lastName}</Typography>
                <Typography><strong>Email:</strong> {selectedReq.user?.email}</Typography>
                <Typography><strong>Phone:</strong> {selectedReq.user?.phone || 'N/A'}</Typography>
                <Typography><strong>Address:</strong> {selectedReq.user?.address || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ForkliftIcon fontSize="small" /> EQUIPMENT DETAILS
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><strong>Make/Model:</strong> {selectedReq.forklift?.make} {selectedReq.forklift?.model}</Typography>
                <Typography><strong>Capacity:</strong> {selectedReq.forklift?.capacity || 'N/A'}</Typography>
                <Typography><strong>Power Type:</strong> {selectedReq.forklift?.power || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonthIcon fontSize="small" /> RENTAL PERIOD
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><strong>Start Date:</strong> {selectedReq.startDate ? new Date(selectedReq.startDate).toLocaleDateString() : 'N/A'}</Typography>
                <Typography><strong>Due Date:</strong> {selectedReq.endDate ? new Date(selectedReq.endDate).toLocaleDateString() : 'N/A'}</Typography>
                <Typography><strong>Total Duration:</strong> {calculateDays(selectedReq.startDate, selectedReq.endDate)} Days</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <strong>Current Status:</strong> 
                  <Chip label={selectedReq.status} color={getStatusColor(selectedReq.status)} size="small" sx={{ ml: 1 }} />
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Reference ID: {selectedReq._id}
                </Typography>
              </Grid>

              {selectedReq.status === 'Rejected' && selectedReq.rejectionReason && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #ffcdd2' }}>
                    <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                      Reason for Rejection:
                    </Typography>
                    <Typography variant="body2" color="error.dark">
                      {selectedReq.rejectionReason}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {selectedReq?.status === 'Pending' && (
            <>
              <Button onClick={() => { handleAccept(selectedReq._id); handleCloseDetails(); }} variant="contained" color="success">
                Accept
              </Button>
              <Button onClick={() => { handleCloseDetails(); handleOpenReject(selectedReq._id); }} variant="outlined" color="error">
                Reject
              </Button>
            </>
          )}
          {selectedReq?.status === 'Active' && (
             <Button onClick={() => { handleCloseDetails(); handleOpenComplete(selectedReq); }} variant="contained" color="secondary">
               Mark as Completed
             </Button>
          )}
          <Button onClick={handleCloseDetails} sx={{ color: '#1a237e' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* --- CONFIRM COMPLETION MODAL --- */}
      <Dialog open={confirmCompleteModal} onClose={handleCloseComplete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#2e7d32', color: 'white', textAlign: 'center' }}>
          Confirm Return
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Has this forklift been returned?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Marking this agreement as <strong>Completed</strong> will automatically make the <strong>{rentalToComplete?.forklift?.model}</strong> available in your inventory for other customers to rent.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
          <Button onClick={handleCloseComplete} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={executeCompleteRental} variant="contained" color="success">
            Yes, Complete Rental
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- REJECT REQUEST MODAL --- */}
      <Dialog open={rejectModal} onClose={handleCloseReject} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#d32f2f', color: 'white', textAlign: 'center' }}>
          Reject Request
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please provide a reason for rejecting this rental request. This note will be visible to the customer on their dashboard.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="e.g., Inventory not available, missing requirements..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
          <Button onClick={handleCloseReject} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={executeRejectRental} variant="contained" color="error">
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}