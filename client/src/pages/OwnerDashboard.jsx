import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, List, ListItem, 
  ListItemIcon, ListItemText, Button 
} from '@mui/material';
import Navbar from '../components/Navbar';
import ForkliftIcon from '@mui/icons-material/Forklift'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ requests: 0 });
  const [userRole, setUserRole] = useState(''); // NEW: Store role

  useEffect(() => {
    // 1. Get Role
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) setUserRole(userInfo.role);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requestRes = await axios.get('http://localhost:5000/api/rentals/all');
      setRequests(requestRes.data);
      const pendingCount = requestRes.data.filter(r => r.status === 'Pending').length;
      setStats({ requests: pendingCount });
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${id}`, { status: 'Active' });
      alert("Agreement Accepted!");
      fetchData();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Reject request?")) {
      try {
        await axios.put(`http://localhost:5000/api/rentals/${id}`, { status: 'Rejected' });
        fetchData();
      } catch (error) {
        alert("Error updating status");
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Pending': return 'info';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      
      <Box sx={{ p: 4 }}>
        
        {/* BUTTONS SECTION */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          
          {/* ONLY OWNER SEES THIS */}
          {userRole === 'owner' && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => navigate('/users')}
              sx={{ fontWeight: 'bold' }}
            >
              MANAGE ACCOUNTS
            </Button>
          )}

          {/* ADMIN & OWNER SEE THIS */}
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => navigate('/inventory')}
            sx={{ fontWeight: 'bold' }}
          >
            MANAGE FLEET
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: `4px solid #0288d1` }}>
                  <NotificationsActiveIcon sx={{ color: '#0288d1' }} />
                  <Typography variant="h4" fontWeight="bold">{stats.requests}</Typography>
                  <Typography variant="body2">Pending</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: `4px solid #2e7d32` }}>
                   <ForkliftIcon sx={{ color: '#2e7d32' }} />
                   <Typography variant="h4" fontWeight="bold">-</Typography>
                   <Typography variant="body2">Stats</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Oswald' }}>
                RENTAL AGREEMENTS
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                    <TableRow>
                      <TableCell><strong>Customer</strong></TableCell>
                      <TableCell><strong>Forklift</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell>{row.user?.firstName} {row.user?.lastName}</TableCell>
                        <TableCell>{row.forklift?.model}</TableCell>
                        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell><Chip label={row.status} color={getStatusColor(row.status)} size="small" /></TableCell>
                        <TableCell align="center">
                          {row.status === 'Pending' && (
                            <Box>
                              <Tooltip title="Accept"><IconButton color="success" onClick={() => handleAccept(row._id)}><CheckCircleIcon /></IconButton></Tooltip>
                              <Tooltip title="Reject"><IconButton color="error" onClick={() => handleReject(row._id)}><CancelIcon /></IconButton></Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>RECENT ACTIVITY</Typography>
              <List>
                {requests.slice(0, 5).map((req, i) => (
                  <ListItem key={i}><ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon><ListItemText primary={`Request: ${req.forklift?.model}`} secondary={req.user?.email} /></ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
