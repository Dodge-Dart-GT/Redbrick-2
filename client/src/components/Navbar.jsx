import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider, Avatar } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

// Import the logo
import RedBrickLogo from '../assets/RedBrickLogo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Get User Info safely
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  const role = userInfo?.role?.toLowerCase()?.trim(); 

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // Smart routing for the logo click
  const handleLogoClick = () => {
    if (!userInfo) navigate('/login');
    else if (role === 'owner') navigate('/owner-dashboard');
    else if (role === 'admin' || role === 'staff') navigate('/admin-dashboard');
    else navigate('/dashboard');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
      <Toolbar>
        
        {/* --- THE FIX: ROUNDED LOGO IN NAVBAR --- */}
        <Box 
          sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} 
          onClick={handleLogoClick}
        >
          <Avatar 
            src={RedBrickLogo} 
            alt="Red Brick Logo" 
            sx={{ 
              width: 48, 
              height: 48, 
              backgroundColor: 'white',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              '& img': { objectFit: 'contain', p: 0.5 } // Keeps the letters from getting cut off
            }} 
          />
          <Typography variant="h6" component="div" sx={{ fontFamily: 'Oswald', fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
            RED BRICK
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* 1. MANAGEMENT LINKS (Owner, Admin, & Staff) */}
          {(role === 'owner' || role === 'admin' || role === 'staff') && (
            <>
              <Button color="inherit" onClick={() => navigate(role === 'owner' ? '/owner-dashboard' : '/admin-dashboard')}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => navigate('/inventory')}>Fleet</Button>
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