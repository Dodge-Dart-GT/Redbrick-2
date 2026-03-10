import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getDesignTokens } from './theme'; 

// --- IMPORT ALL PAGES ---
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import ForkliftModels from './pages/ForkliftModels';
import BookingPage from './pages/BookingPage'; 
import UserManagement from './pages/UserManagement';
import ForkliftManagement from './pages/ForkliftManagement'; 
import AnalyticsDashboard from './pages/AnalyticsDashboard'; 
import Navbar from './components/Navbar'; 

function App() {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode); // Remembers preference
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Router>
        <div className="App">
          <Navbar currentMode={mode} toggleMode={toggleColorMode} />
          <Routes>
            <Route path="/" element={<Navigate to="/models" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/models" element={<ForkliftModels />} />
            <Route path="/book/:id" element={<BookingPage />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/inventory" element={<ForkliftManagement />} /> 
            <Route path="/analytics" element={<AnalyticsDashboard />} /> 
            <Route path="*" element={<Navigate to="/models" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;