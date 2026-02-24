import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, List, ListItem, 
  ListItemIcon, ListItemText, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, Divider, TextField, Pagination, Avatar 
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
import WarningIcon from '@mui/icons-material/Warning';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, total: 0 });
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

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) setUserRole(userInfo.role);
    fetchData();
  }, []);

  const fetchData = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      const { data } = await axios.get('http://localhost:5000/api/rentals/all', {
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
      await axios.put(`http://localhost:5000/api/rentals/${id}`, { status: 'Active' });
      fetchData();
    } catch (error) {
      alert("Error updating status");
    }
  };

  // Rejection Logic
  const handleOpenReject = (id) => {
    setRentalToReject(id);
    setRejectionReason(''); 
    setRejectModal(true);
  };

  const executeRejectRental = async () => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${rentalToReject}`, { 
        status: 'Rejected',
        rejectionReason: rejectionReason || 'Declined by Administrator.' 
      });
      fetchData();
      setRejectModal(false);
    } catch (error) {
      alert("Error updating status");
    }
  };

  // Completion Logic
  const handleOpenComplete = (req) => {
    setRentalToComplete(req);
    setConfirmCompleteModal(true);
  };

  const executeCompleteRental = async () => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${rentalToComplete._id}`, { status: 'Completed' });
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Search & Pagination Logic
  const filteredRequests = requests.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (`${r.user?.firstName} ${r.user?.lastName}`).toLowerCase().includes(searchLower) || 
      (r.forklift?.model || "").toLowerCase().includes(searchLower) || 
      r._id.toLowerCase().includes(searchLower)
    );
  });

  const pageCount = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const displayedRequests = filteredRequests.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* HEADER & ADMIN ACTIONS */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1a237e' }}>
            OWNER COMMAND CENTER
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {userRole === 'owner' && (
              <Button variant="outlined" color="primary" onClick={() => navigate('/users')} sx={{ fontWeight: 'bold', borderWidth: 2 }}>
                MANAGE ACCOUNTS
              </Button>
            )}
            <Button variant="contained" sx={{ bgcolor: '#1a237e', fontWeight: 'bold', '&:hover': { bgcolor: '#0d1440' } }} onClick={() => navigate('/inventory')}>
              MANAGE FLEET
            </Button>
          </Box>
        </Box>

        {/* 4 KPI CARDS */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Pending Approval', val: stats.pending, col: '#ed6c02', icon: <NotificationsActiveIcon /> },
            { label: 'Active Fleet', val: stats.active, col: '#2e7d32', icon: <ForkliftIcon /> },
            { label: 'Completed', val: stats.completed, col: '#455a64', icon: <DoneAllIcon /> },
            { label: 'Total Logs', val: stats.total, col: '#1a237e', icon: <AssignmentIcon /> },
          ].map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: `${kpi.col}15`, color: kpi.col, width: 56, height: 56 }}>{kpi.icon}</Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>{kpi.val}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{kpi.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* MAIN LAYOUT: Table (Left) + Recent Activity (Right) */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight="800">GLOBAL AGREEMENTS</Typography>
                <TextField 
                  placeholder="Search Customer, Model, or ID..." 
                  size="small" 
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                  sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f1f3f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>CUSTOMER</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>FORKLIFT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>DATES</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRequests.length > 0 ? displayedRequests.map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{row.user?.firstName} {row.user?.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary">#{row._id.slice(-6).toUpperCase()}</Typography>
                        </TableCell>
                        <TableCell fontWeight="600">{row.forklift?.model}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.startDate ? new Date(row.startDate).toLocaleDateString() : 'N/A'}</Typography>
                        </TableCell>
                        <TableCell><Chip label={row.status} color={getStatusColor(row.status)} size="small" sx={{ fontWeight: 'bold' }} /></TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton color="primary" onClick={() => { setSelectedReq(row); setOpenModal(true); }}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {row.status === 'Active' && (
                              <Tooltip title="Mark as Completed">
                                <IconButton color="secondary" onClick={() => handleOpenComplete(row)}><DoneAllIcon /></IconButton>
                              </Tooltip>
                            )}
                            {row.status === 'Pending' && (
                              <>
                                <Tooltip title="Accept">
                                  <IconButton color="success" onClick={() => handleAccept(row._id)}><CheckCircleIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton color="error" onClick={() => handleOpenReject(row._id)}><CancelIcon /></IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No matching records found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination count={pageCount} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* SIDEBAR: RECENT ACTIVITY */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActiveIcon color="warning" /> RECENT ACTIVITY
              </Typography>
              <List sx={{ pt: 0 }}>
                {requests.slice(0, 7).map((req, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #f1f3f5' }}>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <CheckCircleIcon color={req.status === 'Active' ? 'success' : req.status === 'Rejected' ? 'error' : 'action'} fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${req.forklift?.model} - ${req.status}`} 
                      secondary={req.user?.email} 
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                    />
                  </ListItem>
                ))}
                {requests.length === 0 && <Typography variant="caption">No recent activity.</Typography>}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* --- MODAL 1: FULL DETAILS --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1a237e', color: 'white' }}>Agreement Details</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedReq && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon fontSize="small" /> CUSTOMER INFORMATION
                </Typography>
                <Typography><strong>Name:</strong> {selectedReq.user?.firstName} {selectedReq.user?.lastName}</Typography>
                <Typography><strong>Email:</strong> {selectedReq.user?.email}</Typography>
                <Typography><strong>Phone:</strong> {selectedReq.user?.phone || 'N/A'}</Typography>
                <Typography><strong>Address:</strong> {selectedReq.user?.address || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ForkliftIcon fontSize="small" /> EQUIPMENT DETAILS
                </Typography>
                <Typography><strong>Make/Model:</strong> {selectedReq.forklift?.make} {selectedReq.forklift?.model}</Typography>
                <Typography><strong>Capacity / Power:</strong> {selectedReq.forklift?.capacity || 'N/A'} - {selectedReq.forklift?.power || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarMonthIcon fontSize="small" /> RENTAL PERIOD
                </Typography>
                <Typography><strong>Dates:</strong> {new Date(selectedReq.startDate).toLocaleDateString()} to {new Date(selectedReq.endDate).toLocaleDateString()}</Typography>
                <Typography><strong>Total Duration:</strong> {calculateDays(selectedReq.startDate, selectedReq.endDate)} Days</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <strong>Current Status:</strong> <Chip label={selectedReq.status} color={getStatusColor(selectedReq.status)} size="small" sx={{ ml: 1, fontWeight: 'bold' }} />
                </Typography>
              </Grid>

              {selectedReq.status === 'Rejected' && selectedReq.rejectionReason && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #ffcdd2' }}>
                    <Typography variant="subtitle2" color="error.main" fontWeight="bold">Reason for Rejection:</Typography>
                    <Typography variant="body2" color="error.dark">{selectedReq.rejectionReason}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 2: CONFIRM RETURN --- */}
      <Dialog open={confirmCompleteModal} onClose={() => setConfirmCompleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#455a64', color: 'white', textAlign: 'center' }}>
          Confirm Return
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, textAlign: 'center' }}>
          <DoneAllIcon sx={{ fontSize: 60, color: '#455a64', mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>Has this equipment been returned?</Typography>
          <Typography variant="body2" color="text.secondary">
            Marking this agreement as Completed will immediately return the <strong>{rentalToComplete?.forklift?.model}</strong> to the available inventory pool.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setConfirmCompleteModal(false)} sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button onClick={executeCompleteRental} variant="contained" sx={{ bgcolor: '#455a64' }}>Complete Rental</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 3: REJECT REQUEST --- */}
      <Dialog open={rejectModal} onClose={() => setRejectModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#d32f2f', color: 'white', textAlign: 'center' }}>
          Reject Request
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Provide a reason for declining this request. This will be sent directly to the customer's dashboard.
          </Typography>
          <TextField
            fullWidth multiline rows={3} variant="outlined"
            placeholder="e.g., Inventory not available, missing requirements..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setRejectModal(false)} sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button onClick={executeRejectRental} variant="contained" color="error">Confirm Rejection</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}