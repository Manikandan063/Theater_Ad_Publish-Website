import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
    const { user, login } = useAuth(); // We can use login to refresh the local user state if needed, or better, fetch again
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        agencyName: user?.agencyName || '',
        theaterName: user?.theaterName || '',
        location: user?.location || '',
        contactNumber: user?.contactNumber || '',
        companyName: user?.companyName || ''
    });
    const [loading, setLoading] = useState(false);

    // Sync form data once user is loaded or changes
    React.useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                agencyName: user.agencyName || '',
                theaterName: user.theaterName || '',
                location: user.location || '',
                contactNumber: user.contactNumber || '',
                companyName: user.companyName || ''
            });
        }
    }, [user]);

    if (!user) return <div className="main-content"><p>Loading Account Profile...</p></div>;

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let endpoint = '';
            const role = user.role;
            if (role === 'theaterOwner') endpoint = `/api/theater-owners/${user.id}`;
            else if (role === 'adSeller') endpoint = `/api/ad-sellers/${user.id}`;
            else if (role === 'thirdParty') endpoint = `/api/third-parties/${user.id}`;
            else if (role === 'admin') endpoint = `/api/admin/${user.id}`;

            const res = await axios.put(endpoint, formData);
            if (res.data.success) {
                // Update local storage and context so UI updates immediately
                const updatedUser = { ...user, ...res.data.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Note: AuthContext doesn't have a direct 'setUser' exposed commonly, 
                // but since it reads from localStorage on re-render, we might need to alert them.
                // However, we can try to force a reload or just alert.
                alert('✅ Profile updated successfully!');
                setIsEditing(false);
                window.location.reload(); // Quickest way to sync AuthContext with localStorage
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <header className="dash-header">
                <div>
                    <h1>System Profile</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your account settings and credentials.</p>
                </div>
            </header>

            <div style={{ maxWidth: '800px', margin: '0 auto' }} className="glass-card slide-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: 'var(--gradient-primary)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: 'white'
                    }}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{user.name}</h2>
                        <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem' }}>{user.role?.toUpperCase()} Account</span>
                    </div>
                </div>

                <form onSubmit={handleUpdate}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            ) : (
                                <div className="profile-value">{user.name}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Registered Email</label>
                            <div className="profile-value" style={{ opacity: 0.6 }}>{user.email} (Non-editable)</div>
                        </div>

                        {user.role === 'theaterOwner' && (
                            <>
                                <div className="form-group">
                                    <label>Theater Name</label>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                            value={formData.theaterName}
                                            onChange={(e) => setFormData({...formData, theaterName: e.target.value})}
                                            required
                                        />
                                    ) : (
                                        <div className="profile-value">{user.theaterName || 'N/A'}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Theater Location</label>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            required
                                        />
                                    ) : (
                                        <div className="profile-value">{user.location || 'N/A'}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Contact Number</label>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                                            required
                                        />
                                    ) : (
                                        <div className="profile-value">{user.contactNumber || 'N/A'}</div>
                                    )}
                                </div>
                            </>
                        )}

                        {user.role === 'adSeller' && (
                            <div className="form-group">
                                <label>Agency Name</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                        value={formData.agencyName}
                                        onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                                    />
                                ) : (
                                    <div className="profile-value">{user.agencyName || 'N/A'}</div>
                                )}
                            </div>
                        )}

                        {user.role === 'thirdParty' && (
                            <div className="form-group">
                                <label>Company Name</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                    />
                                ) : (
                                    <div className="profile-value">{user.companyName || 'N/A'}</div>
                                )}
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label>Account ID</label>
                            <div className="profile-value" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.id}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        {isEditing ? (
                            <>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile Details</button>
                        )}
                    </div>
                </form>
            </div>
            <style jsx>{`
                .profile-value {
                    padding: 1rem;
                    background: rgba(255,255,255,0.03);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    border: 1px solid var(--glass-border);
                }
            `}</style>
        </div>
    );
};

export default Profile;
