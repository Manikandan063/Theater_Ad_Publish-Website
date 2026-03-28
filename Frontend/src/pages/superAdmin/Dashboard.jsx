import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [owners, setOwners] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [parties, setParties] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [ownersRes, sellersRes, partiesRes, paymentsRes] = await Promise.all([
                axios.get('/api/theater-owners'),
                axios.get('/api/ad-sellers'),
                axios.get('/api/third-parties'),
                axios.get('/api/payments')
            ]);
            setOwners(ownersRes.data.data || []);
            setSellers(sellersRes.data.data || []);
            setParties(partiesRes.data.data || []);
            setPayments(paymentsRes.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="main-content"><p>Loading Admin Command Center...</p></div>;

    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalUsers = owners.length + sellers.length + parties.length;

    return (
        <div className="main-content">
            <header className="dash-header">
                <div>
                    <h1>Platform Control Center</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Global system overview and financial auditing.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="badge badge-success" style={{ padding: '0.5rem 1rem' }}>System Operational</div>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total GTV (Gross Transaction Value)</div>
                    <div className="stat-value">₹{totalRevenue.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Platform Participants</div>
                    <div className="stat-value">{totalUsers}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Theaters</div>
                    <div className="stat-value">{owners.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">System Commission</div>
                    <div className="stat-value">0%</div>
                </div>
            </div>

            <div className="dash-grid" style={{ marginTop: '2.5rem' }}>
                <div style={{ gridColumn: 'span 12' }}>
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Global Transaction Ledger</h3>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Campaign</th>
                                        <th>Theater</th>
                                        <th>Publisher</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length > 0 ? payments.map(p => (
                                        <tr key={p._id}>
                                            <td style={{ fontWeight: 600 }}>{p.advertisementId?.title}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{p.theaterOwnerId?.theaterName}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{p.adSellerId?.agencyName || p.adSellerId?.name}</td>
                                            <td className="price-tag">₹{p.amount}</td>
                                            <td>
                                                <span className={`badge badge-${p.status === 'paid' ? 'success' : 'pending'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No system transactions.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div style={{ gridColumn: 'span 4', marginTop: '1.5rem' }} className="glass-card">
                    <h4>🎬 Screens ({owners.length})</h4>
                    <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {owners.map(o => (
                            <div key={o._id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{o.theaterName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.location}</div>
                                </div>
                                <div className="badge badge-success" style={{ fontSize: '0.6rem' }}>Online</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ gridColumn: 'span 4', marginTop: '1.5rem' }} className="glass-card">
                    <h4>💰 Publishers ({sellers.length})</h4>
                    <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {sellers.map(s => (
                            <div key={s._id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.agencyName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ gridColumn: 'span 4', marginTop: '1.5rem' }} className="glass-card">
                    <h4>🤝 Brokers ({parties.length})</h4>
                    <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {parties.map(p => (
                            <div key={p._id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.companyName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
