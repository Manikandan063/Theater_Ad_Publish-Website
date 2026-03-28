import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
    const [formData, setFormData] = useState({
        brandName: '',
        contactPerson: '',
        email: '',
        phone: '',
        adLink: '',
        message: ''
    });

    const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
    const [videoFile, setVideoFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare data for submission
        const submitData = new FormData();
        submitData.append('brandName', formData.brandName);
        submitData.append('email', formData.email);
        submitData.append('message', formData.message);
        
        if (uploadMethod === 'url') {
            submitData.append('adLink', formData.adLink);
        } else if (videoFile) {
            submitData.append('videoFile', videoFile);
        }

        // For now, still just alert success since backend doesn't have a specific endpoint yet
        // but it's now prepared for actual multipart submission
        alert(`Thank you ${formData.brandName}! Your ${uploadMethod === 'url' ? 'video link' : 'video file'} has been received. Our Ad Publishing team will review it and contact you shortly.`);
        
        // Reset form
        setFormData({ brandName: '', contactPerson: '', email: '', phone: '', adLink: '', message: '' });
        setVideoFile(null);
        setUploadMethod('url');
    };

    return (
        <div className="home-page">
            <section className="hero-section glass-card" style={{ 
                margin: '2rem', 
                padding: '4rem 2rem', 
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                borderRadius: 'var(--radius-xl)'
            }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Publish Your Ad on Big Screens
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
                    Connect your brand with thousands of movie-goers. From Supreme Mobiles to global brands, we bridge the gap between businesses and theaters.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <a href="#submit-ad" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Submit Your Brand Ad</a>
                    <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Portal Login</Link>
                </div>
            </section>

            <div className="dash-grid" style={{ padding: '0 2rem' }}>
                <div className="glass-card" style={{ gridColumn: 'span 6' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Why Advertise With Us?</h2>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--brand-primary)', padding: '0.5rem', borderRadius: '50%', color: 'white' }}>✓</div>
                            <div>
                                <strong>Massive Reach:</strong> Get your ad seen by hundreds of viewers in every show.
                            </div>
                        </li>
                        <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--brand-primary)', padding: '0.5rem', borderRadius: '50%', color: 'white' }}>✓</div>
                            <div>
                                <strong>High Engagement:</strong> Theater ads have 4x higher recall than television or mobile ads.
                            </div>
                        </li>
                        <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--brand-primary)', padding: '0.5rem', borderRadius: '50%', color: 'white' }}>✓</div>
                            <div>
                                <strong>Direct Control:</strong> Publishers manage your schedule and screen placement exactly as you want.
                            </div>
                        </li>
                    </ul>
                </div>

                <div id="submit-ad" className="glass-card" style={{ gridColumn: 'span 6' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Brand Intake Form</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Are you a brand like <strong style={{color:'var(--brand-primary)'}}>Supreme Mobiles</strong> looking for screen space? 
                        Fill this out and our Ad Publishers will reach out.
                    </p>
                    <form onSubmit={handleSubmit} className="form-grid">
                        <div className="form-group" style={{ gridColumn: 'span 1' }}>
                            <label>Company/Brand Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Supreme Mobiles" 
                                value={formData.brandName} 
                                onChange={(e) => setFormData({...formData, brandName: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 1' }}>
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                placeholder="marketing@supreme.com" 
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ marginBottom: 0 }}>Ad Media Preview Source</label>
                                <div className="btn-group" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        type="button" 
                                        className={`btn ${uploadMethod === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setUploadMethod('url')}
                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                    >
                                        YouTube/URL
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn ${uploadMethod === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setUploadMethod('file')}
                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                    >
                                        Upload Video
                                    </button>
                                </div>
                            </div>
                            
                            {uploadMethod === 'url' ? (
                                <input 
                                    type="text" 
                                    placeholder="Paste your ad URL (YouTube/MP4) here..." 
                                    value={formData.adLink} 
                                    onChange={(e) => setFormData({...formData, adLink: e.target.value})} 
                                />
                            ) : (
                                <div style={{ 
                                    border: '1px dashed var(--border)', 
                                    borderRadius: 'var(--radius-md)', 
                                    padding: '1.5rem', 
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.05)'
                                }}>
                                    <input 
                                        type="file" 
                                        id="video-upload" 
                                        accept="video/*" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => setVideoFile(e.target.files[0])}
                                    />
                                    <label htmlFor="video-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>📁</div>
                                        <span>{videoFile ? videoFile.name : 'Click here to select a video file from your computer'}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MP4, WebM, MOV supported</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Message / Campaign Details</label>
                            <textarea 
                                rows="3" 
                                placeholder="Tell us which cities or theaters you are interested in..." 
                                value={formData.message} 
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', color: 'white', border: '1px solid var(--border)' }}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', padding: '1rem' }}>
                            Send to Ad Publisher
                        </button>
                    </form>

                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default Home;
