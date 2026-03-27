import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return <p>Loading Profile...</p>;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <h1>👤 My Profile</h1>
            </header>

            <div className="dash-grid">
                <section className="form-section" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontWeight: '600', color: '#64748b' }}>Full Name</label>
                            <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>{user.name}</p>
                        </div>
                        <div>
                            <label style={{ fontWeight: '600', color: '#64748b' }}>Email Address</label>
                            <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>{user.email}</p>
                        </div>
                        <div>
                            <label style={{ fontWeight: '600', color: '#64748b' }}>System Role</label>
                            <p style={{ margin: '5px 0', fontSize: '1.1rem', textTransform: 'capitalize' }}>
                                <span className={`status-badge approved`}>{user.role}</span>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Profile;
