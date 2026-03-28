import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import AdSellerDashboard from './pages/adSeller/Dashboard';
import TheaterOwnerDashboard from './pages/theaterOwner/Dashboard';
import ThirdPartyDashboard from './pages/thirdParty/Dashboard';
import SuperAdminDashboard from './pages/superAdmin/Dashboard';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Role-based Private Routes */}
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/ad-seller/*" element={<PrivateRoute role="adSeller"><AdSellerDashboard /></PrivateRoute>} />
              <Route path="/theater-owner/*" element={<PrivateRoute role="theaterOwner"><TheaterOwnerDashboard /></PrivateRoute>} />
              <Route path="/third-party/*" element={<PrivateRoute role="thirdParty"><ThirdPartyDashboard /></PrivateRoute>} />
              <Route path="/admin/*" element={<PrivateRoute role="admin"><SuperAdminDashboard /></PrivateRoute>} />
              
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
