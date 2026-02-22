import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, List, ListItem,
  ListItemText, ListItemIcon, TextField
} from '@mui/material';
import Navbar from '../components/Navbar';
import ForkliftIcon from '@mui/icons-material/Forklift';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [myRentals, setMyRentals] = useState([]);
  const [stats, setStats] = useState({ requested: 0, active: 0, completed: 0, due: 0 });

  // 1. FETCH REAL DATA ON LOAD
  useEffect(() => {
    const fetchMyRentals = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!userInfo) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get(`http://localhost:5000/api/rentals/myrequests/${userInfo._id}`);
        setMyRentals(data);

        // Calculate Stats Dynamically
        setStats({
          requested: data.filter(r => r.status === 'Pending').length,
          active: data.filter(r => r.status === 'Active').length,
          completed: data.filter(r => r.status === 'Completed').length,
          due: 0 // Placeholder logic for now
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
      case 'Pending': return 'primary'; // 'Pending' is the new default status
      case 'Rejected': return 'error';
      case 'Completed': return 'default';
      default: return 'default';
    }
  };

  // KPI Card Config
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
          
          {/* --- LEFT COLUMN (KPIs & Table) --- */}
          <Grid item xs={12} md={8}>
            
            {/* 1. DYNAMIC KPI CARDS */}
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

            {/* 2. REAL RENTAL AGREEMENTS TABLE */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Oswald, sans-serif' }}>
                  YOUR RENTAL AGREEMENTS
                </Typography>
                <TextField placeholder="Search..." size="small" variant="outlined" sx={{ width: 200 }} />
              </Box>

              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                    <TableRow>
                      <TableCell><strong>Ref ID</strong></TableCell>
                      <TableCell><strong>Forklift</strong></TableCell>
                      <TableCell><strong>Rent Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myRentals.length > 0 ? (
                      myRentals.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell>...{row._id.slice(-6)}</TableCell>
                          <TableCell>{row.forklift?.make} {row.forklift?.model}</TableCell>
                          <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip label={row.status} color={getStatusColor(row.status)} size="small" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">You haven't rented any forklifts yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* --- RIGHT COLUMN (Alerts & Models) --- */}
          <Grid item xs={12} md={4}>
            
            {/* 3. DYNAMIC ALERTS (Based on recent activity) */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActiveIcon color="warning" /> ALERTS
              </Typography>
              <List>
                {myRentals.slice(0, 3).map((req, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <CheckCircleIcon fontSize="small" color={req.status === 'Active' ? 'success' : 'info'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Request for ${req.forklift?.model} is ${req.status}`}
                      secondary={new Date(req.createdAt).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
                {myRentals.length === 0 && <Typography variant="body2" color="text.secondary">No recent alerts.</Typography>}
              </List>
            </Paper>

            {/* 4. FORKLIFT MODELS LINK */}
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
    </Box>
  );
}
