import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getDesignTokens } from './theme'; 

// --- IMPORT ALL PAGES ---
import HomePage from './pages/HomePage'; // <-- ADDED THIS
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

// --- LAYOUT WRAPPER ---
// This hides the global Navbar when on the homepage, 
// since the HomePage has its own custom landing-page Navbar.
function LayoutWrapper({ mode, toggleColorMode, children }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="App">
      {!isHomePage && <Navbar currentMode={mode} toggleMode={toggleColorMode} />}
      {children}
    </div>
  );
}

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
        <LayoutWrapper mode={mode} toggleColorMode={toggleColorMode}>
          <Routes>
            {/* 🟢 PUBLIC ROUTES */}
            <Route path="/" element={<HomePage currentMode={mode} toggleMode={toggleColorMode} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage mode="signup" />} />
            {/* Redirects /auth to /login so the HomePage buttons work instantly */}
            <Route path="/auth" element={<Navigate to="/login" replace />} />

            {/* 🔴 CORE APP ROUTES */}
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/models" element={<ForkliftModels />} />
            <Route path="/book/:id" element={<BookingPage />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/inventory" element={<ForkliftManagement />} /> 
            <Route path="/analytics" element={<AnalyticsDashboard />} /> 
            
            
            {/* Catch-all: sends lost users back to the homepage instead of models */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </ThemeProvider>
  );
}

export default App;