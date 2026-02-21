import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null); // Menu state

  // Get User Info safely
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  const role = userInfo?.role; // 'owner', 'admin', or 'user'

  // Open Menu
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close Menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Logout Logic
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
          
          {/* --- NAVIGATION LINKS BASED ON ROLE --- */}
          
          {/* 1. MANAGEMENT LINKS (Owner & Admin) */}
          {(role === 'owner' || role === 'admin') && (
            <>
              <Button color="inherit" onClick={() => navigate('/owner')}>Dashboard</Button>
              <Button color="inherit" onClick={() => navigate('/inventory')}>Fleet</Button>
            </>
          )}

          {/* 2. OWNER ONLY LINKS */}
          {role === 'owner' && (
             <Button color="inherit" onClick={() => navigate('/users')}>Users</Button>
          )}

          {/* 3. CUSTOMER LINKS */}
          {role === 'user' && (
             <>
               <Button color="inherit" onClick={() => navigate('/dashboard')}>Home</Button>
               <Button color="inherit" onClick={() => navigate('/models')}>Browse Models</Button>
             </>
          )}

          {/* --- USER PROFILE SECTION --- */}
          {userInfo ? (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                {/* User Greeting */}
                <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                    Hello, <strong>{userInfo.firstName}</strong>
                </Typography>

                <IconButton
                    size="large"
                    onClick={handleMenu}
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>My Profile</MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
                </Menu>
            </Box>
          ) : (
            // If not logged in
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
          )}

        </Box>
      </Toolbar>
    </AppBar>
  );
}
