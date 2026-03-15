import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Pagination,
  TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  
  // --- NEW: Search & Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const USERS_PER_PAGE = 10;

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
      await axios.put(`/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      fetchUsers(); 
    } catch (error) {
      alert("Failed to update user role.");
    }
  };

  // --- NEW: Filter & Search Logic ---
  const filteredUsers = users.filter(user => {
    // 1. Search Logic
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (user.firstName || '').toLowerCase().includes(searchLower) || 
      (user.lastName || '').toLowerCase().includes(searchLower) || 
      (user.email || '').toLowerCase().includes(searchLower);
    
    // 2. Role Filter Logic
    const matchesRole = roleFilter === 'All' 
        ? true 
        : roleFilter === 'staff' 
            ? (user.role === 'admin' || user.role === 'staff') // Groups admins and staff together
            : user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate Pagination based on the FILTERED results
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const displayedUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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

        {/* --- NEW: Search & Filter Control Bar --- */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2, borderRight: { md: '1px solid #eee' } }}>
                <FilterListIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">FILTERS:</Typography>
            </Box>
            
            <TextField 
                placeholder="Search name or email..." size="small" variant="outlined"
                value={searchTerm} 
                onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                sx={{ width: { xs: '100%', sm: 300 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Account Role</InputLabel>
                <Select 
                    value={roleFilter} 
                    label="Account Role" 
                    onChange={(e) => {setRoleFilter(e.target.value); setPage(1);}}
                >
                    <MenuItem value="All">All Roles</MenuItem>
                    <MenuItem value="owner">Owners</MenuItem>
                    <MenuItem value="staff">Staff / Admins</MenuItem>
                    <MenuItem value="user">Customers</MenuItem>
                </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />
            
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
              Showing {filteredUsers.length} User(s)
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
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((user) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <InfoIcon sx={{ fontSize: 50, color: '#bdbdbd', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">No accounts found.</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Try adjusting your search terms or filters.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={(e, v) => setPage(v)} 
                color="primary" 
                size="large" 
                shape="rounded" 
              />
            </Box>
          )}
        </Paper>

      </Box>
    </Box>
  );
}