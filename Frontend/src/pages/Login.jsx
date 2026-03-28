import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('adSeller'); 
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password, role);
        if (res.success) {
            const dashboard = role === 'admin' ? '/admin' : 
                             role === 'theaterOwner' ? '/theater-owner' : 
                             role === 'adSeller' ? '/ad-seller' : '/third-party';
            navigate(dashboard);
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box glass-card slide-in">
                <h2>X-TOWN</h2>
                <p className="auth-subtitle">Premium Theatre Ad Portal & Brokerage</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Your Access Level</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            style={{ background: 'var(--bg-elevated)', cursor: 'pointer' }}
                        >
                            <option value="adSeller">Ad Publisher (Brand)</option>
                            <option value="theaterOwner">Theater Owner (Screen)</option>
                            <option value="thirdParty">Third Party Partner (Agent)</option>
                            <option value="admin">Platform Administrator</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Business Email</label>
                        <input 
                            type="email" 
                            placeholder="name@company.com"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Secure Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', fontSize: '1rem' }}>
                        Sign In to Dashboard
                    </button>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        New to X-TOWN? <Link to="/register" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Initialize Account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
