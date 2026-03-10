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
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  // THE FIX: This now checks your login status every time you navigate to a new page!
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
    navigate('/models');
  };

  const menuItems = [];

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
    menuItems.push({ text: 'Browse Models', path: '/models', icon: <LocalShippingIcon /> });
  }
  
  const drawerContent = (
    <Box sx={{ width: 280, bgcolor: currentMode === 'dark' ? '#121212' : '#f8f9fa', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, bgcolor: currentMode === 'dark' ? '#1e1e1e' : '#1a237e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                <ListItemIcon sx={{ color: currentMode === 'dark' ? '#ffca28' : '#1a237e' }}>
                    {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </ListItemIcon>
                <ListItemText primary={`${currentMode === 'light' ? 'Dark' : 'Light'} Mode`} primaryTypographyProps={{ fontWeight: 'bold', color: 'text.primary' }} />
            </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        {menuItems.map((item) => (
          <ListItem disablePadding key={item.text} sx={{ mb: 1, mx: 1 }}>
            <ListItemButton 
              onClick={() => { navigate(item.path); setDrawerOpen(false); }}
              sx={{ 
                borderRadius: 2,
                bgcolor: location.pathname === item.path ? (currentMode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e3f2fd') : 'transparent',
                color: location.pathname === item.path ? (currentMode === 'dark' ? '#64b5f6' : '#1a237e') : 'text.primary',
                '&:hover': { bgcolor: currentMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f3f5' }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? (currentMode === 'dark' ? '#64b5f6' : '#1a237e') : 'action.active' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        {user ? (
            <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ fontWeight: 'bold', borderWidth: 2 }}>
                LOG OUT
            </Button>
        ) : (
            <Button fullWidth variant="contained" startIcon={<LoginIcon />} onClick={() => { navigate('/login'); setDrawerOpen(false); }} sx={{ bgcolor: '#1a237e', fontWeight: 'bold' }}>
                LOG IN / SIGN UP
            </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: currentMode === 'dark' ? '#1e1e1e' : '#1a237e', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 1 }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/models')}>
            <Avatar src="/RedBrickLogo.png" sx={{ width: 45, height: 45, bgcolor: 'white', p: 0.5 }} />
            <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: 1, display: { xs: 'none', sm: 'block' }, color: 'white' }}>
              RED BRICK
            </Typography>
          </Box>

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => (
                <Button 
                  key={item.text} onClick={() => navigate(item.path)}
                  sx={{ 
                    color: location.pathname === item.path ? '#64b5f6' : 'white', 
                    fontWeight: 'bold', px: 2,
                    borderBottom: location.pathname === item.path ? '3px solid #64b5f6' : '3px solid transparent',
                    borderRadius: 0, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <Box sx={{ ml: 2, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 2 }}>
                
                {/* DARK MODE TOGGLE BUTTON */}
                <IconButton onClick={toggleMode} sx={{ color: 'white' }}>
                  {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>

                {user ? (
                    <>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                        Hello, <strong>{user.firstName || 'User'}</strong>
                        </Typography>
                        <IconButton onClick={handleLogout} sx={{ color: '#ffcdd2', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.2)' } }}>
                        <LogoutIcon />
                        </IconButton>
                    </>
                ) : (
                    <Button variant="outlined" onClick={() => navigate('/login')} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 'bold', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                        Log In
                    </Button>
                )}

              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton onClick={toggleMode} sx={{ color: 'white' }}>
                  {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ p: 0.5, color: 'white' }}>
                <MenuIcon fontSize="large" />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { borderTopLeftRadius: 16, borderBottomLeftRadius: 16 } }}>
        {drawerContent}
      </Drawer>
    </>
  );
}