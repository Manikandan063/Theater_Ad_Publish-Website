import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [role, setRole] = useState('adSeller');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', 
        theaterName: '', location: '', contactNumber: '', // For TheaterOwner
        agencyName: '', contactPerson: '', address: '',   // For AdSeller
        companyName: '', website: ''                      // For ThirdParty
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
            <div className="register-box">
                <h2>Join the Portal 🎭</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Register As</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="adSeller">Ad Seller</option>
                            <option value="theaterOwner">Theater Owner</option>
                            <option value="thirdParty">Third Party Partner</option>
                        </select>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="name" type="text" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input name="email" type="email" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input name="password" type="password" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input name="contactNumber" type="text" onChange={handleChange} required />
                        </div>

                        {/* Conditional Fields */}
                        {role === 'theaterOwner' && <>
                            <div className="form-group">
                                <label>Theater Name</label>
                                <input name="theaterName" type="text" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input name="location" type="text" onChange={handleChange} required />
                            </div>
                        </>}

                        {role === 'adSeller' && <>
                            <div className="form-group">
                                <label>Agency Name</label>
                                <input name="agencyName" type="text" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input name="contactPerson" type="text" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input name="address" type="text" onChange={handleChange} required />
                            </div>
                        </>}

                        {role === 'thirdParty' && <>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input name="companyName" type="text" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Website</label>
                                <input name="website" type="text" onChange={handleChange} />
                            </div>
                        </>}
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="register-btn">Register</button>
                    <p className="login-link">Already have an account? <Link to="/login">Login here</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Register;
