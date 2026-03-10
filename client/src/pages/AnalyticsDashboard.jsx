import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Chip, Alert, Button,
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
// THE FIX: Removed Navbar import to prevent double rendering

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

import HandshakeIcon from '@mui/icons-material/Handshake';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People'; 

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); 

  useEffect(() => {
    const fetchAnalytics = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const role = userInfo?.role?.toLowerCase()?.trim();

      if (!userInfo) return navigate('/login');

      if (role !== 'owner' && role !== 'admin' && role !== 'staff') {
        setErrorMsg(`Access Denied. Only Admins and Owners can view this page.`);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data } = await axios.get(`/api/analytics?timeframe=${timeframe}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setAnalytics(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLoading(false);
        const status = error.response?.status || 'Unknown';
        const message = error.response?.data?.message || error.message;
        setErrorMsg(`Server Error (${status}): ${message}`);
        
        if (status === 401 || status === 403) {
           localStorage.removeItem('userInfo');
           navigate('/login');
        }
      }
    };
    
    fetchAnalytics();
  }, [navigate, timeframe]);

  if (loading && !analytics) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (errorMsg) {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          {/* THE FIX: Navbar removed */}
          <Box sx={{ p: 5, maxWidth: 800, mx: 'auto', mt: 10, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 4, fontSize: '1.1rem', p: 3, borderRadius: 3 }}>
                  <strong>Dashboard Load Failed:</strong> {errorMsg}
              </Alert>
              <Button variant="contained" size="large" onClick={() => navigate('/admin-dashboard')} sx={{ bgcolor: 'primary.main' }}>
                  RETURN TO ADMIN DASHBOARD
              </Button>
          </Box>
        </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* THE FIX: Navbar removed */}
      
      <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1400, mx: 'auto' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" fontWeight="900" sx={{ color: 'primary.main', letterSpacing: '-0.5px' }}>
              BUSINESS ANALYTICS
            </Typography>

            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'background.paper' }}>
                <InputLabel>Chart Time Range</InputLabel>
                <Select value={timeframe} label="Chart Time Range" onChange={(e) => setTimeframe(e.target.value)}>
                    <MenuItem value="week">Last 7 Days</MenuItem>
                    <MenuItem value="month">Last 30 Days</MenuItem>
                    <MenuItem value="year">This Past Year</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                </Select>
            </FormControl>
        </Box>

        {loading && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mb: 2 }} />}

        <Grid container spacing={4}>
          
          {/* --- KPI CARDS --- */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Avatar sx={{ bgcolor: 'rgba(21, 101, 192, 0.15)', color: '#1565c0', width: 64, height: 64 }}><HandshakeIcon fontSize="large" /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight="900">{analytics?.kpis?.totalRentals || 0}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">TOTAL RENTALS</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Avatar sx={{ bgcolor: 'rgba(230, 81, 0, 0.15)', color: '#e65100', width: 64, height: 64 }}><LocalShippingIcon fontSize="large" /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight="900">{analytics?.kpis?.activeRentals || 0}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">CURRENTLY ACTIVE RENTALS</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Avatar sx={{ bgcolor: 'rgba(46, 125, 50, 0.15)', color: '#2e7d32', width: 64, height: 64 }}><PeopleIcon fontSize="large" /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight="900">{analytics?.kpis?.totalUniqueCustomers || 0}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">UNIQUE CUSTOMERS</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* --- RENTAL FREQUENCY LINE CHART --- */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: 450 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main" mb={3}>Rental Frequency Over Time</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={analytics?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="currentColor" />
                  <YAxis stroke="currentColor" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: 'inherit', borderColor: 'var(--mui-palette-divider)' }} />
                  <Line type="monotone" dataKey="rentals" name="Total Rentals" stroke="#1565c0" strokeWidth={4} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* --- FORKLIFT UTILIZATION BAR CHART --- */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: 450 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main" mb={3}>Top 5 Utilized Models</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={analytics?.utilization || []} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.2} />
                  <XAxis type="number" axisLine={false} tickLine={false} stroke="currentColor" />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} stroke="currentColor" />
                  <Tooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ borderRadius: '8px', backgroundColor: 'inherit', borderColor: 'var(--mui-palette-divider)' }} />
                  <Bar dataKey="rentals" name="Times Rented" fill="#ff9800" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* --- TIME-BASED CUSTOMER BREAKDOWN TABLE --- */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main" mb={3}>Top Customers & Rental Frequency</Typography>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>CUSTOMER NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>EMAIL</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>LAST 7 DAYS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>LAST 30 DAYS</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>THIS YEAR</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>ALL TIME</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.topCustomers?.length > 0 ? (
                      analytics.topCustomers.map((user, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{user._id?.firstName} {user._id?.lastName}</TableCell>
                          <TableCell>{user._id?.email}</TableCell>
                          <TableCell align="center">
                              {user.rentalsWeek > 0 ? <Chip label={user.rentalsWeek} color="primary" size="small" sx={{ fontWeight: 'bold' }} /> : '-'}
                          </TableCell>
                          <TableCell align="center">
                              {user.rentalsMonth > 0 ? <Chip label={user.rentalsMonth} color="info" size="small" sx={{ fontWeight: 'bold' }} /> : '-'}
                          </TableCell>
                          <TableCell align="center">{user.rentalsYear}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.totalRentals}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No customer data available yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
}