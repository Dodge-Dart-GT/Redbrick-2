import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import Navbar from '../components/Navbar';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    // Security check
    if (!userInfo || userInfo.role !== 'owner') {
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      // Assumes you have a PUT route at /api/users/:id/role
      await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      fetchUsers(); // Refresh the table after updating
    } catch (error) {
      alert("Failed to update user role.");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Navbar />
      
      <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1200, mx: 'auto' }}>
        
        {/* THE FIX: Hardcoded navigate('/owner-dashboard') instead of going back in browser history */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/owner-dashboard')} 
            sx={{ mr: 2, fontWeight: 'bold' }}
          >
            BACK
          </Button>
          <Typography variant="h4" sx={{ fontWeight: '900', color: '#1a237e' }}>
            ACCOUNT MANAGEMENT
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f1f3f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 2.5 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2.5 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2.5 }}>Current Role</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2.5, pr: 4 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell sx={{ py: 2.5 }}>
                      <Typography variant="body1" fontWeight="bold">{user.firstName} {user.lastName}</Typography>
                    </TableCell>
                    
                    <TableCell sx={{ py: 2.5, color: 'text.secondary' }}>
                      {user.email}
                    </TableCell>
                    
                    <TableCell sx={{ py: 2.5 }}>
                      {user.role === 'owner' && <Chip icon={<SecurityIcon />} label="OWNER" color="secondary" size="small" sx={{ fontWeight: 'bold', px: 1 }} />}
                      {(user.role === 'admin' || user.role === 'staff') && <Chip icon={<AdminPanelSettingsIcon />} label="STAFF" size="small" sx={{ fontWeight: 'bold', bgcolor: '#e0e0e0', px: 1 }} />}
                      {user.role === 'user' && <Chip icon={<PersonIcon />} label="USER" size="small" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', color: 'text.secondary', px: 1 }} />}
                    </TableCell>
                    
                    <TableCell align="right" sx={{ py: 2.5, pr: 4 }}>
                      {user.role === 'owner' ? (
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">PROTECTED</Typography>
                      ) : user.role === 'admin' || user.role === 'staff' ? (
                        <Button 
                          variant="outlined" color="error" size="small" sx={{ fontWeight: 'bold' }}
                          onClick={() => handleRoleChange(user._id, 'user')}
                        >
                          DEMOTE TO USER
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" color="primary" size="small" sx={{ fontWeight: 'bold', bgcolor: '#1976d2', boxShadow: 'none' }}
                          onClick={() => handleRoleChange(user._id, 'staff')}
                        >
                          PROMOTE TO ADMIN
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      </Box>
    </Box>
  );
}