import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Get User Info safely
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  // THE FIX: Normalize the role to catch formatting issues (e.g. 'Admin' instead of 'admin')
  const role = userInfo?.role?.toLowerCase()?.trim(); 

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
      <Toolbar>
        {/* LOGO / BRAND */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Oswald', fontWeight: 'bold' }}>
          RED BRICK CORP.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* 1. MANAGEMENT LINKS (Owner, Admin, & Staff) */}
          {(role === 'owner' || role === 'admin' || role === 'staff') && (
            <>
              {/* Automatically routes 'owner' to /owner-dashboard, and admins to /admin-dashboard */}
              <Button color="inherit" onClick={() => navigate(role === 'owner' ? '/owner-dashboard' : '/admin-dashboard')}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => navigate('/inventory')}>Fleet</Button>
              
              {/* THE FIX: Moved Analytics here so ALL management roles can see it! */}
              <Button color="inherit" onClick={() => navigate('/analytics')}>Analytics</Button>
            </>
          )}

          {/* 2. OWNER ONLY LINKS */}
          {role === 'owner' && (
             <Button color="inherit" onClick={() => navigate('/users')}>Users</Button>
          )}

          {/* 3. CUSTOMER LINKS */}
          {(role === 'user' || role === 'customer') && (
             <>
               <Button color="inherit" onClick={() => navigate('/dashboard')}>Home</Button>
               <Button color="inherit" onClick={() => navigate('/models')}>Browse Models</Button>
             </>
          )}

          {/* --- USER PROFILE SECTION --- */}
          {userInfo ? (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                    Hello, <strong>{userInfo.firstName || userInfo.role}</strong>
                </Typography>

                <IconButton size="large" onClick={handleMenu} color="inherit">
                    <AccountCircle />
                </IconButton>
                
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>My Profile</MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
                </Menu>
            </Box>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
          )}

        </Box>
      </Toolbar>
    </AppBar>
  );
}