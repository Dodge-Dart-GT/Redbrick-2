import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Chip, Alert, Button
} from '@mui/material';
import Navbar from '../components/Navbar';

// Recharts for graphs
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Icons
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null); // <-- NEW: Error tracking state

  useEffect(() => {
    const fetchAnalytics = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const role = userInfo?.role?.toLowerCase()?.trim();

      if (!userInfo) {
        navigate('/login');
        return;
      }

      // THE FIX: We added 'staff' to the permitted roles here to perfectly match the Navbar!
      if (role !== 'owner' && role !== 'admin' && role !== 'staff') {
        setErrorMsg(`Access Denied: Your account role is "${role}". Only Admins and Owners can view this page.`);
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get('http://localhost:5000/api/analytics', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setAnalytics(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLoading(false);
        
        // THE FIX: Instead of silently deleting the token and logging you out, we display the exact error!
        const status = error.response?.status || 'Unknown';
        const message = error.response?.data?.message || error.message;
        setErrorMsg(`Server Error (${status}): ${message}. Your token might be expired or the server blocked access.`);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // --- NEW: GRACEFUL ERROR SCREEN ---
  if (errorMsg) {
    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
          <Navbar />
          <Box sx={{ p: 5, maxWidth: 800, mx: 'auto', mt: 10, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 4, fontSize: '1.1rem', p: 3, borderRadius: 3 }}>
                  <strong>Dashboard Load Failed:</strong> {errorMsg}
              </Alert>
              <Button variant="contained" size="large" onClick={() => navigate('/admin-dashboard')} sx={{ bgcolor: '#1a237e' }}>
                  RETURN TO ADMIN DASHBOARD
              </Button>
          </Box>
        </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', pb: 8 }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#1a237e', mb: 4, letterSpacing: '-0.5px' }}>
          BUSINESS ANALYTICS
        </Typography>

        <Grid container spacing={4}>
          {/* --- 1. KPI CARDS --- */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid #e0e0e0' }}>
              <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', width: 64, height: 64 }}><MonetizationOnIcon fontSize="large" /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight="900">₱{analytics?.kpis?.totalRevenue?.toLocaleString() || 0}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">TOTAL REVENUE</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid #e0e0e0' }}>
              <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0', width: 64, height: 64 }}><HandshakeIcon fontSize="large" /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight="900">{analytics?.kpis?.totalRentals || 0}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">TOTAL RENTALS</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid #e0e0e0' }}>
              <Avatar sx={{ bgcolor: '#fff3e0', color: '#e65100', width: 64, height: 64 }}><LocalShippingIcon fontSize="large" /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight="900">{analytics?.kpis?.activeRentals || 0}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">CURRENTLY ACTIVE RENTALS</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* --- 2. INCOME & RENTAL TRENDS (LINE CHART) --- */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0', height: 450 }}>
              <Typography variant="h6" fontWeight="bold" color="#1a237e" mb={3}>Income & Rental Trends</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={analytics?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke="#2e7d32" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#1565c0" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="income" name="Revenue (₱)" stroke="#2e7d32" strokeWidth={4} activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="rentals" name="Total Rentals" stroke="#1565c0" strokeWidth={4} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* --- 3. FORKLIFT UTILIZATION (BAR CHART) --- */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0', height: 450 }}>
              <Typography variant="h6" fontWeight="bold" color="#1a237e" mb={3}>Top 5 Utilized Models</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={analytics?.utilization || []} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="rentals" name="Times Rented" fill="#ff9800" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* --- 4. TOP CUSTOMERS TABLE --- */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight="bold" color="#1a237e" mb={3}>Top Customers (Most Frequent Renters)</Typography>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f1f3f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>CUSTOMER NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>EMAIL</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>TOTAL RENTALS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>TOTAL SPENT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.topCustomers?.length > 0 ? (
                      analytics.topCustomers.map((user, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{user._id?.firstName} {user._id?.lastName}</TableCell>
                          <TableCell>{user._id?.email}</TableCell>
                          <TableCell align="center"><Chip label={user.rentalsCount} color="primary" size="small" sx={{ fontWeight: 'bold' }} /></TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>₱{user.totalSpent.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>No customer data available yet.</TableCell>
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