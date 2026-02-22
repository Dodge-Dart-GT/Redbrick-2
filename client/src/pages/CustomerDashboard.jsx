import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, List, ListItem,
  ListItemText, ListItemIcon, TextField, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Pagination // <-- NEW IMPORT FOR PAGINATION
} from '@mui/material';
import Navbar from '../components/Navbar';
import ForkliftIcon from '@mui/icons-material/Forklift';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoIcon from '@mui/icons-material/Info';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [myRentals, setMyRentals] = useState([]);
  const [stats, setStats] = useState({ requested: 0, active: 0, completed: 0, due: 0 });

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // --- NEW: PAGINATION & SEARCH STATE ---
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchMyRentals = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!userInfo) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get(`http://localhost:5000/api/rentals/myrequests/${userInfo._id}`);
        
        // Sort by newest first
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyRentals(sortedData);

        setStats({
          requested: sortedData.filter(r => r.status === 'Pending').length,
          active: sortedData.filter(r => r.status === 'Active').length,
          completed: sortedData.filter(r => r.status === 'Completed').length,
          due: 0 
        });

      } catch (error) {
        console.error("Error fetching rentals:", error);
      }
    };

    fetchMyRentals();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Pending': return 'primary';
      case 'Rejected': return 'error';
      case 'Completed': return 'default';
      default: return 'default';
    }
  };

  const getAlertIcon = (status) => {
    switch(status) {
      case 'Active': return <CheckCircleIcon fontSize="small" color="success" />;
      case 'Rejected': return <CancelIcon fontSize="small" color="error" />;
      case 'Completed': return <DoneAllIcon fontSize="small" color="action" />;
      case 'Pending': return <InfoIcon fontSize="small" color="info" />;
      default: return <InfoIcon fontSize="small" />;
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Modal Handlers
  const handleOpenDetails = (req) => {
    setSelectedReq(req);
    setOpenModal(true);
  };

  const handleCloseDetails = () => {
    setOpenModal(false);
    setSelectedReq(null);
  };

  // --- NEW: FILTER & PAGINATION LOGIC ---
  const filteredRentals = myRentals.filter(r => 
    r.forklift?.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.forklift?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r._id.includes(searchTerm)
  );

  const pageCount = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);
  const displayedRentals = filteredRentals.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to page 1 when typing a search
  };

  const kpiData = [
    { label: 'Requested', count: stats.requested, color: '#1976d2', icon: <ForkliftIcon /> },
    { label: 'Active', count: stats.active, color: '#2e7d32', icon: <ForkliftIcon /> },
    { label: 'Completed', count: stats.completed, color: '#00695c', icon: <ForkliftIcon /> },
    { label: 'Alerts', count: stats.due, color: '#d32f2f', icon: <WarningIcon /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {kpiData.map((kpi, index) => (
                <Grid item key={index} xs={6} sm={3}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: `4px solid ${kpi.color}` }}>
                    <Box sx={{ color: kpi.color, mb: 1 }}>{kpi.icon}</Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{kpi.count}</Typography>
                    <Chip label={kpi.label} size="small" sx={{ backgroundColor: kpi.color, color: 'white', fontWeight: 'bold' }} />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Oswald, sans-serif' }}>
                  YOUR RENTAL AGREEMENTS
                </Typography>
                <TextField 
                  placeholder="Search Models or ID..." 
                  size="small" 
                  variant="outlined" 
                  sx={{ width: 250 }} 
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </Box>

              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                    <TableRow>
                      <TableCell><strong>Ref ID</strong></TableCell>
                      <TableCell><strong>Forklift</strong></TableCell>
                      <TableCell><strong>Rent Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* NEW: WE MAP OVER displayedRentals INSTEAD OF myRentals */}
                    {displayedRentals.length > 0 ? (
                      displayedRentals.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell>...{row._id.slice(-6)}</TableCell>
                          <TableCell>{row.forklift?.make} {row.forklift?.model}</TableCell>
                          <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip label={row.status} color={getStatusColor(row.status)} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton color="primary" onClick={() => handleOpenDetails(row)}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          {searchTerm ? 'No rentals match your search.' : "You haven't rented any forklifts yet."}
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

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActiveIcon color="warning" /> RECENT ALERTS
              </Typography>
              <List>
                {/* Alerts stay unfiltered and only show the absolute 5 newest */}
                {myRentals.slice(0, 5).map((req, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 35, mt: 0.5, alignSelf: 'flex-start' }}>
                      {getAlertIcon(req.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Request for ${req.forklift?.model}`}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary" display="block">
                            Status: {req.status}
                          </Typography>
                          {req.status === 'Rejected' && req.rejectionReason && (
                            <Typography component="span" variant="caption" color="error.main" display="block" sx={{ mt: 0.5, lineHeight: 1.2 }}>
                              "{req.rejectionReason.length > 50 ? req.rejectionReason.substring(0, 50) + '...' : req.rejectionReason}"
                            </Typography>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
                {myRentals.length === 0 && <Typography variant="body2" color="text.secondary">No recent alerts.</Typography>}
              </List>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>NEED ANOTHER FORKLIFT?</Typography>
              <img
                src="https://plus.unsplash.com/premium_photo-1661962360662-7901306b3e34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
                alt="Forklift"
                style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
              />
              <Button
                variant="contained"
                sx={{ backgroundColor: '#242424' }}
                fullWidth
                onClick={() => navigate('/models')}
              >
                Browse Models
              </Button>
            </Paper>

          </Grid>
        </Grid>
      </Box>

      {/* --- CUSTOMER AGREEMENT DETAILS MODAL --- */}
      <Dialog open={openModal} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1a237e', color: 'white' }}>
          Agreement Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedReq && (
            <Grid container spacing={3}>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ForkliftIcon fontSize="small" /> EQUIPMENT DETAILS
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><strong>Make/Model:</strong> {selectedReq.forklift?.make} {selectedReq.forklift?.model}</Typography>
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

              {/* REJECTION REASON DISPLAY */}
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
          <Button onClick={handleCloseDetails} sx={{ color: '#1a237e', fontWeight: 'bold' }}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
