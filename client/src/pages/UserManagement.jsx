import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 1. SECURITY CHECK: Kick out anyone who isn't the Owner
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'owner') {
      alert("Access Denied: Only the Owner can manage accounts.");
      navigate('/owner'); 
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/users');
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const action = newRole === 'admin' ? 'Promote to Admin' : 'Demote to User';
    if (window.confirm(`Are you sure you want to ${action}?`)) {
      try {
        await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole });
        fetchUsers(); // Refresh list
      } catch (error) {
        alert("Error updating role");
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      <Box sx={{ p: 4 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/owner')} sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: 'Oswald' }}>
            ACCOUNT MANAGEMENT
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#eee' }}>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Current Role</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.toUpperCase()} 
                        color={user.role === 'owner' ? 'secondary' : user.role === 'admin' ? 'primary' : 'default'} 
                        size="small" 
                        icon={user.role === 'owner' ? <SecurityIcon /> : user.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {/* Logic: Don't edit Owner. Toggle others. */}
                      {user.role !== 'owner' && (
                        <>
                          {user.role === 'user' ? (
                            <Button 
                              variant="contained" size="small" color="primary"
                              onClick={() => handleRoleChange(user._id, 'admin')}
                            >
                              Promote to Admin
                            </Button>
                          ) : (
                            <Button 
                              variant="outlined" size="small" color="error"
                              onClick={() => handleRoleChange(user._id, 'user')}
                            >
                              Demote to User
                            </Button>
                          )}
                        </>
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
