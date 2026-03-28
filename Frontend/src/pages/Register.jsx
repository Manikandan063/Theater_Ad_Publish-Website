import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [role, setRole] = useState('adSeller');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', 
        theaterName: '', location: '', contactNumber: '',
        agencyName: '', contactPerson: '', address: '',
        companyName: '', website: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        let subData = { name: formData.name, email: formData.email, password: formData.password, contactNumber: formData.contactNumber };
        
        if (role === 'theaterOwner') {
            subData = { ...subData, theaterName: formData.theaterName, location: formData.location };
        } else if (role === 'adSeller') {
            subData = { ...subData, agencyName: formData.agencyName, contactPerson: formData.contactPerson, address: formData.address };
        } else if (role === 'thirdParty') {
            subData = { ...subData, companyName: formData.companyName, website: formData.website };
        }

        const res = await register(subData, role);
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
        <div className="register-container">
            <div className="register-box glass-card slide-in">
                <h2>Join X-TOWN</h2>
                <p className="auth-subtitle">Initialize your business partnership today.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Business Partnership Type</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            style={{ background: 'var(--bg-elevated)', cursor: 'pointer' }}
                        >
                            <option value="adSeller">Ad Publisher (Brand)</option>
                            <option value="theaterOwner">Theater Owner (Screen)</option>
                            <option value="thirdParty">Third Party Partner (Agent)</option>
                        </select>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Primary Representative Name</label>
                            <input name="name" type="text" placeholder="John Doe" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Business Email</label>
                            <input name="email" type="email" placeholder="john@company.com" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Security Password</label>
                            <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Primary Contact Number</label>
                            <input name="contactNumber" type="text" placeholder="+91 98XXX XXXXX" onChange={handleChange} required />
                        </div>

                        {/* Conditional Fields */}
                        {role === 'theaterOwner' && <>
                            <div className="form-group">
                                <label>Theater Name</label>
                                <input name="theaterName" type="text" placeholder="PVR Cinemas" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Location / City</label>
                                <input name="location" type="text" placeholder="Mumbai, MH" onChange={handleChange} required />
                            </div>
                        </>}

                        {role === 'adSeller' && <>
                            <div className="form-group">
                                <label>Agency / Brand Name</label>
                                <input name="agencyName" type="text" placeholder="Ogilvy & Mather" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Registered Address</label>
                                <input name="address" type="text" placeholder="Business Park, Bangalore" onChange={handleChange} required />
                            </div>
                        </>}

                        {role === 'thirdParty' && <>
                            <div className="form-group">
                                <label>Consultancy Name</label>
                                <input name="companyName" type="text" placeholder="AdStream Global" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Official Website</label>
                                <input name="website" type="text" placeholder="https://adstream.com" onChange={handleChange} />
                            </div>
                        </>}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', fontSize: '1rem' }}>
                        Initialize Partnership
                    </button>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Already a partner? <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
