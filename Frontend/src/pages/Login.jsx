import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('adSeller'); // Default role Select
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password, role);
        if (res.success) {
            // Redirect based on role
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
            <div className="login-box">
                <h2>🎬 Theatre Ad Portal</h2>
                <p>Welcome back! Please login to your account.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Your Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="adSeller">Ad Seller</option>
                            <option value="theaterOwner">Theater Owner</option>
                            <option value="thirdParty">Third Party Partner</option>
                            <option value="admin">Super Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-btn">Login</button>
                    <p className="register-link">Don't have an account? <Link to="/register">Register here</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Login;
