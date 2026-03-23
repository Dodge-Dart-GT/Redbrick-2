import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Avatar, 
  useTheme, useMediaQuery, Divider 
} from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment'; 
import LoginIcon from '@mui/icons-material/Login';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun

export default function Navbar({ currentMode, toggleMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Dynamic theme colors
  const primaryColor = theme.palette.mode === 'dark' ? '#B22222' : '#590016';
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        setUser(JSON.parse(userInfo));
    } else {
        setUser(null);
    }
  }, [location.pathname]); 

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null); 
    navigate('/'); 
  };

  const handleLogoClick = () => {
    // Unconditionally route to the homepage when the logo is clicked
    navigate('/');
  };

  let menuItems = [];

  if (user) {
    const role = user.role?.toLowerCase()?.trim() || 'user';
    if (role === 'owner') {
      menuItems.push({ text: 'Command Center', path: '/owner-dashboard', icon: <DashboardIcon /> });
      menuItems.push({ text: 'Fleet Management', path: '/inventory', icon: <LocalShippingIcon /> });
      menuItems.push({ text: 'User Accounts', path: '/users', icon: <PeopleIcon /> });
      menuItems.push({ text: 'Analytics', path: '/analytics', icon: <AssessmentIcon /> }); 
    } else if (role === 'admin' || role === 'staff') {
      menuItems.push({ text: 'Admin Hub', path: '/admin-dashboard', icon: <DashboardIcon /> });
      menuItems.push({ text: 'Fleet Management', path: '/inventory', icon: <LocalShippingIcon /> });
      menuItems.push({ text: 'Analytics', path: '/analytics', icon: <AssessmentIcon /> }); 
    } else {
      menuItems.push({ text: 'My Dashboard', path: '/dashboard', icon: <DashboardIcon /> });
    }
    menuItems.push({ text: 'Browse Models', path: '/models', icon: <LocalShippingIcon /> });
    menuItems.push({ text: 'My Profile', path: '/profile', icon: <AccountCircleIcon /> });
  } else {
    if (location.pathname !== '/') {
        menuItems.push({ text: 'Browse Models', path: '/models', icon: <LocalShippingIcon /> });
    }
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  const drawerContent = (
    <Box sx={{ width: 280, bgcolor: 'background.default', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, bgcolor: primaryColor, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => { handleLogoClick(); setDrawerOpen(false); }}>
          <Avatar src="/RedBrickLogo.png" sx={{ width: 40, height: 40, bgcolor: 'white', p: 0.5 }} />
          <Typography variant="h6" fontWeight="900">RED BRICK</Typography>
        </Box>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List sx={{ pt: 2, flexGrow: 1 }}>
        <ListItem disablePadding sx={{ mb: 1, mx: 1 }}>
            <ListItemButton onClick={toggleMode}>
                <ListItemIcon sx={{ color: currentMode === 'dark' ? '#ffca28' : primaryColor }}>
                    {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </ListItemIcon>
                <ListItemText primary={`${currentMode === 'light' ? 'Dark' : 'Light'} Mode`} />
            </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        {menuItems.map((item) => (
          <ListItem disablePadding key={item.text} sx={{ mb: 1, mx: 1 }}>
            <ListItemButton onClick={() => { navigate(item.path); setDrawerOpen(false); }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        {user ? (
            <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>LOG OUT</Button>
        ) : !isAuthPage && (
            <Button fullWidth variant="contained" sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#8b1a1a' : '#3a000e' } }} startIcon={<LoginIcon />} onClick={() => { navigate('/login'); setDrawerOpen(false); }}>LOG IN</Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: primaryColor }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={handleLogoClick}>
            <Avatar src="/RedBrickLogo.png" sx={{ width: 45, height: 45, bgcolor: 'white', p: 0.5 }} />
            <Typography variant="h5" fontWeight="900" sx={{ color: 'white' }}>RED BRICK</Typography>
          </Box>

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => (
                <Button key={item.text} onClick={() => navigate(item.path)} sx={{ color: 'white', fontWeight: 'bold' }}>{item.text}</Button>
              ))}
              <Box sx={{ ml: 2, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={toggleMode} sx={{ color: 'white' }}>
                  {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                {user ? (
                    <IconButton onClick={handleLogout} sx={{ color: '#ffcdd2' }}><LogoutIcon /></IconButton>
                ) : !isAuthPage && (
                    <Button variant="outlined" onClick={() => navigate('/login')} sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>Log In</Button>
                )}
              </Box>
            </Box>
          ) : (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>{drawerContent}</Drawer>
    </>
  );
}