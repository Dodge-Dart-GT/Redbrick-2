import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Drawer, 
  List, ListItem, ListItemIcon, ListItemText, Box, Avatar, 
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
import AssessmentIcon from '@mui/icons-material/Assessment'; // <-- NEW ICON FOR ANALYTICS

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Detect if the screen size is smaller than 'md' (900px)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) setUser(JSON.parse(userInfo));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // Dynamically generate menu items based on User Role
  const role = user?.role?.toLowerCase()?.trim() || 'user';
  const menuItems = [];

  if (role === 'owner') {
    menuItems.push({ text: 'Command Center', path: '/owner-dashboard', icon: <DashboardIcon /> });
    menuItems.push({ text: 'Fleet Management', path: '/inventory', icon: <LocalShippingIcon /> });
    menuItems.push({ text: 'User Accounts', path: '/users', icon: <PeopleIcon /> });
    menuItems.push({ text: 'Analytics', path: '/analytics', icon: <AssessmentIcon /> }); // <-- ADDED FOR OWNER
  } else if (role === 'admin' || role === 'staff') {
    menuItems.push({ text: 'Admin Hub', path: '/admin-dashboard', icon: <DashboardIcon /> });
    menuItems.push({ text: 'Fleet Management', path: '/inventory', icon: <LocalShippingIcon /> });
    menuItems.push({ text: 'Analytics', path: '/analytics', icon: <AssessmentIcon /> }); // <-- ADDED FOR ADMIN
  } else {
    menuItems.push({ text: 'My Dashboard', path: '/dashboard', icon: <DashboardIcon /> });
    menuItems.push({ text: 'Browse Models', path: '/models', icon: <LocalShippingIcon /> });
  }
  
  // Profile is available to everyone
  menuItems.push({ text: 'My Profile', path: '/profile', icon: <AccountCircleIcon /> });

  // Mobile Drawer Content
  const drawerContent = (
    <Box sx={{ width: 280, bgcolor: '#f8f9fa', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, bgcolor: '#1a237e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src="/RedBrickLogo.png" sx={{ width: 40, height: 40, bgcolor: 'white', p: 0.5 }} />
          <Typography variant="h6" fontWeight="900">RED BRICK</Typography>
        </Box>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List sx={{ pt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => { navigate(item.path); setDrawerOpen(false); }}
            sx={{ 
              mb: 1, mx: 1, borderRadius: 2,
              bgcolor: location.pathname === item.path ? '#e3f2fd' : 'transparent',
              color: location.pathname === item.path ? '#1a237e' : 'text.primary',
              '&:hover': { bgcolor: '#f1f3f5' }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#1a237e' : 'action.active' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 'bold' }} />
          </ListItem>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Button 
          fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} 
          onClick={handleLogout} sx={{ fontWeight: 'bold', borderWidth: 2 }}
        >
          LOG OUT
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#1a237e', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 1 }}>
          
          {/* LOGO SECTION */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate(menuItems[0]?.path || '/')}>
            <Avatar src="/RedBrickLogo.png" sx={{ width: 45, height: 45, bgcolor: 'white', p: 0.5 }} />
            <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: 1, display: { xs: 'none', sm: 'block' } }}>
              RED BRICK
            </Typography>
          </Box>

          {/* DESKTOP NAVIGATION */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => (
                <Button 
                  key={item.text} 
                  onClick={() => navigate(item.path)}
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
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Hello, <strong>{user?.firstName || 'User'}</strong>
                </Typography>
                <IconButton onClick={handleLogout} sx={{ color: '#ffcdd2', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.2)' } }}>
                  <LogoutIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            /* MOBILE VIEW: GREETING & HAMBURGER BUTTON */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                Hello, <strong>{user?.firstName || 'User'}</strong>
              </Typography>
              <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ p: 0.5 }}>
                <MenuIcon fontSize="large" />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER MENU */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { borderTopLeftRadius: 16, borderBottomLeftRadius: 16 } }}>
        {drawerContent}
      </Drawer>
    </>
  );
}