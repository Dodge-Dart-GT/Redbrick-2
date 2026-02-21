import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ForkliftModels from './pages/ForkliftModels';
import ForkliftManagement from './pages/ForkliftManagement';
import UserManagement from './pages/UserManagement';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar'; // Import Navbar

function App() {
  return (
    <AuthProvider>
      {/* 1. ROUTER MUST WRAP EVERYTHING */}
      <Router>
        
        {/* 2. NAVBAR GOES INSIDE ROUTER, BUT OUTSIDE ROUTES */}
        <div style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>
          {/* Optional: You can put <Navbar /> here if you want it on every page */}
           
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Customer Routes */}
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/models" element={<ForkliftModels />} />

            {/* Admin / Owner Routes */}
            <Route path="/owner" element={<OwnerDashboard />} /> 
            <Route path="/inventory" element={<ForkliftManagement />} />
            <Route path="/users" element={<UserManagement />} />

            {/* Shared Route */}
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
