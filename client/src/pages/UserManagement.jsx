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
// THE FIX: Removed Navbar import to prevent duplicate rendering

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
      const { data } = await axios.get('/api/users', {
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
      await axios.put(`/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      fetchUsers(); // Refresh the table after updating
    } catch (error) {
      alert("Failed to update user role.");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* THE FIX: <Navbar /> removed entirely from this file */}
      
      <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1200, mx: 'auto' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/owner-dashboard')} 
            sx={{ mr: 2, fontWeight: 'bold' }}
          >
            BACK
          </Button>
          <Typography variant="h4" sx={{ fontWeight: '900', color: 'primary.main' }}>
            ACCOUNT MANAGEMENT
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: 'background.paper' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
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
                      {(user.role === 'admin' || user.role === 'staff') && <Chip icon={<AdminPanelSettingsIcon />} label="STAFF" size="small" sx={{ fontWeight: 'bold', bgcolor: 'action.selected', px: 1 }} />}
                      {user.role === 'user' && <Chip icon={<PersonIcon />} label="USER" size="small" sx={{ fontWeight: 'bold', bgcolor: 'background.default', color: 'text.secondary', px: 1 }} />}
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
                          variant="contained" color="primary" size="small" sx={{ fontWeight: 'bold', boxShadow: 'none' }}
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