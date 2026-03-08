import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT ALL PAGES ---
import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage'; // Uncomment if you have a register page
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import ForkliftModels from './pages/ForkliftModels';
import BookingPage from './pages/BookingPage'; 
import UserManagement from './pages/UserManagement';
import ForkliftManagement from './pages/ForkliftManagement'; 
import AnalyticsDashboard from './pages/AnalyticsDashboard'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* THE FIX: Default Route now redirects to the public Catalog instead of Login */}
          <Route path="/" element={<Navigate to="/models" replace />} />
          
          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Main Dashboards */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* Application Features */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/models" element={<ForkliftModels />} />
          <Route path="/book/:id" element={<BookingPage />} />
          
          {/* Owner/Admin Management Pages */}
          <Route path="/users" element={<UserManagement />} />
          <Route path="/inventory" element={<ForkliftManagement />} /> 
          <Route path="/analytics" element={<AnalyticsDashboard />} /> 
          
          {/* THE FIX: Fallback Route catches typos and sends them to the catalog */}
          <Route path="*" element={<Navigate to="/models" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;