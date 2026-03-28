import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar glass-card" style={{ 
            margin: '1rem', 
            borderRadius: 'var(--radius-xl)', 
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '1rem',
            zIndex: 1000,
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div className="navbar-brand">
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '2px', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>X-TOWN</span>
                </Link>
            </div>
            
            <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {!user ? (
                    <>
                        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Partner With Us</Link>
                        <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>Register Agency</Link>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Login</Link>
                    </>
                ) : (
                    <>
                        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>Profile</Link>
                        
                        {user.role === 'admin' && (
                            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
                        )}
                        {user.role === 'theaterOwner' && (
                            <Link to="/theater-owner" className={`nav-link ${isActive('/theater-owner') ? 'active' : ''}`}>Theater</Link>
                        )}
                        {user.role === 'adSeller' && (
                            <>
                                <Link to="/ad-seller" className={`nav-link ${isActive('/ad-seller') ? 'active' : ''}`}>Ads</Link>
                                <Link to="/third-party" className={`nav-link ${isActive('/third-party') ? 'active' : ''}`}>Partners</Link>
                            </>
                        )}
                        {user.role === 'thirdParty' && (
                            <Link to="/third-party" className={`nav-link ${isActive('/third-party') ? 'active' : ''}`}>Broker</Link>
                        )}
                        
                        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{user.name}</span>
                                </span>
                                <div style={{ padding: '0.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                            </Link>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}>
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
