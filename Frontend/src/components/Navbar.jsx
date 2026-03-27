import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">🎬 Theatre Ads</Link>
            </div>
            <div className="navbar-links">
                {user.role === 'admin' && <Link to="/admin">Admin Hub</Link>}
                {user.role === 'theaterOwner' && <Link to="/theater-owner">Owner Dash</Link>}
                {user.role === 'adSeller' && <Link to="/ad-seller">Seller Dash</Link>}
                {user.role === 'thirdParty' && <Link to="/third-party">Partner Dash</Link>}
                
                <Link to="/profile" style={{ marginRight: '15px' }}>My Profile</Link>
                <span className="user-info">Welcome, {user.name}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
