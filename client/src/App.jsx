import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT ALL PAGES ---
import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage'; // Uncomment if you have a register page
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ProfilePage from './pages/ProfilePage';
import ForkliftModels from './pages/ForkliftModels';
import BookingPage from './pages/BookingPage'; // <-- NEW BOOKING PAGE IMPORTED HERE
import UserManagement from './pages/UserManagement';
// import ForkliftManagement from './pages/ForkliftManagement'; // Uncomment when ready

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default Route redirects to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          
          {/* Main Dashboards */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          
          {/* Application Features */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/models" element={<ForkliftModels />} />
          
          {/* --- NEW BOOKING ROUTE --- */}
          {/* The ":id" tells React Router to expect a dynamic forklift ID in the URL */}
          <Route path="/book/:id" element={<BookingPage />} />
          
          {/* Owner/Admin Management Pages */}
          <Route path="/users" element={<UserManagement />} />
          {/* <Route path="/inventory" element={<ForkliftManagement />} /> */}
          
          {/* Fallback Route (Catches any typos in the URL and sends them back to login) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;