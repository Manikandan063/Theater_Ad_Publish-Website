import React from 'react';

const Footer = () => {
    return (
        <footer className="glass-card" style={{ 
            marginTop: '3rem', 
            padding: '2rem', 
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a href="#" className="nav-link" style={{ fontSize: '0.85rem', opacity: 0.7 }}>Platform Guidelines</a>
                    <a href="#" className="nav-link" style={{ fontSize: '0.85rem', opacity: 0.7 }}>Ad Specification</a>
                    <a href="#" className="nav-link" style={{ fontSize: '0.85rem', opacity: 0.7 }}>Privacy Policy</a>
                    <a href="#" className="nav-link" style={{ fontSize: '0.85rem', opacity: 0.7 }}>Contact Support</a>
                </div>
                
                <div style={{ width: '40px', height: '1px', background: 'var(--glass-border)' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        © {new Date().getFullYear()} <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>X-TOWN</span> Ad Broker System
                    </p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                        PREMIUM CINEMA ADVERTISING NETWORK
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
