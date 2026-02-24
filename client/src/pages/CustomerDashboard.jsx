import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, List, ListItem,
  ListItemText, ListItemIcon, TextField, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Pagination, Avatar
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

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchMyRentals = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) { navigate('/login'); return; }

      try {
        const { data } = await axios.get(`http://localhost:5000/api/rentals/myrequests/${userInfo._id}`);
        // Keep your newest-first sorting logic
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyRentals(sortedData);

        setStats({
          requested: sortedData.filter(r => r.status === 'Pending').length,
          active: sortedData.filter(r => r.status === 'Active').length,
          completed: sortedData.filter(r => r.status === 'Completed').length,
          due: sortedData.filter(r => r.status === 'Rejected').length 
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
      default: return <InfoIcon fontSize="small" color="info" />;
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter & Pagination Logic
  const filteredRentals = myRentals.filter(r => 
    r.forklift?.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.forklift?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r._id.includes(searchTerm)
  );

  const pageCount = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);
  const displayedRentals = filteredRentals.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          
          {/* --- KPI STATS --- */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {[
                { label: 'Requested', val: stats.requested, col: '#1976d2', icon: <ForkliftIcon /> },
                { label: 'Active', val: stats.active, col: '#2e7d32', icon: <CheckCircleIcon /> },
                { label: 'Completed', val: stats.completed, col: '#455a64', icon: <DoneAllIcon /> },
                { label: 'Rejected', val: stats.due, col: '#d32f2f', icon: <WarningIcon /> },
              ].map((kpi, i) => (
                <Grid item key={i} xs={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${kpi.col}15`, color: kpi.col, width: 50, height: 50 }}>{kpi.icon}</Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{kpi.val}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{kpi.label}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* --- MAIN TABLE SECTION --- */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="800">RENTAL AGREEMENTS</Typography>
                <TextField 
                  placeholder="Search Models or ID..." 
                  size="small" 
                  value={searchTerm} 
                  onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                  sx={{ width: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <TableContainer>
                <Table sx={{ minWidth: 600 }}>
                  <TableHead sx={{ bgcolor: '#f1f3f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>REF ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>FORKLIFT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>RENT DATE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRentals.length > 0 ? (
                      displayedRentals.map((row) => (
                        <TableRow key={row._id} hover>
                          <TableCell sx={{ fontFamily: 'monospace' }}>#{row._id.slice(-6).toUpperCase()}</TableCell>
                          <TableCell fontWeight="600">{row.forklift?.make} {row.forklift?.model}</TableCell>
                          <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell><Chip label={row.status} color={getStatusColor(row.status)} size="small" sx={{ fontWeight: 'bold' }} /></TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => {setSelectedReq(row); setOpenModal(true);}}>
                              <VisibilityIcon fontSize="small" color="primary"/>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No rentals found matching your search.</TableCell>
                      </TableRow>
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

          {/* --- SIDEBAR --- */}
          <Grid item xs={12} md={4}>
            {/* Scrollable Alerts */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActiveIcon color="warning" /> RECENT ALERTS
              </Typography>
              <List sx={{ 
                maxHeight: 320, 
                overflow: 'auto', 
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '10px' }
              }}>
                {myRentals.slice(0, 8).map((req, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #f1f3f5' }}>
                    <ListItemIcon sx={{ minWidth: 35 }}>{getAlertIcon(req.status)}</ListItemIcon>
                    <ListItemText 
                      primary={`Request for ${req.forklift?.model}`} 
                      secondary={`${req.status} - ${new Date(req.createdAt).toLocaleDateString()}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Industrial CTA Card */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#1a237e', color: 'white', textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="800">NEW RENTAL?</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>Explore our heavy-duty Gavril fleet.</Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2, mb: 2 }}>
                 <ForkliftIcon sx={{ fontSize: 80, opacity: 0.9 }} />
              </Box>
              <Button variant="contained" fullWidth sx={{ bgcolor: 'white', color: '#1a237e', fontWeight: 'bold', '&:hover': { bgcolor: '#f1f1f1' } }} onClick={() => navigate('/models')}>
                BROWSE MODELS
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* --- AGREEMENT DETAILS MODAL --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1a237e', color: 'white' }}>Agreement Details</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedReq && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ForkliftIcon fontSize="small" /> EQUIPMENT DETAILS
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography><strong>Make/Model:</strong> {selectedReq.forklift?.make} {selectedReq.forklift?.model}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonthIcon fontSize="small" /> RENTAL PERIOD
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography><strong>Dates:</strong> {new Date(selectedReq.startDate).toLocaleDateString()} to {new Date(selectedReq.endDate).toLocaleDateString()}</Typography>
                <Typography><strong>Total:</strong> {calculateDays(selectedReq.startDate, selectedReq.endDate)} Days</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <strong>Status:</strong> <Chip label={selectedReq.status} color={getStatusColor(selectedReq.status)} size="small" sx={{ ml: 1, fontWeight: 'bold' }} />
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>Reference ID: {selectedReq._id}</Typography>
              </Grid>

              {/* Keep your Rejection Reason Logic */}
              {selectedReq.status === 'Rejected' && selectedReq.rejectionReason && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #ffcdd2' }}>
                    <Typography variant="subtitle2" color="error.main" fontWeight="bold">Reason for Rejection:</Typography>
                    <Typography variant="body2" color="error.dark">{selectedReq.rejectionReason}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 'bold', color: '#1a237e' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}