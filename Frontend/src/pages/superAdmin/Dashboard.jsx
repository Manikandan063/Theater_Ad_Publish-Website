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
                axios.get('http://localhost:5000/api/theater-owners'),
                axios.get('http://localhost:5000/api/ad-sellers'),
                axios.get('http://localhost:5000/api/third-parties'),
                axios.get('http://localhost:5000/api/payments')
            ]);
            setOwners(ownersRes.data.data);
            setSellers(sellersRes.data.data);
            setParties(partiesRes.data.data);
            setPayments(paymentsRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <p>Loading Admin Portal...</p>;

    return (
        <div className="dashboard-container admin-dashboard">
            <header className="dash-header">
                <h1>Super Admin Control Center</h1>
                <div className="summary-stats">
                    <p>Total Revenue Flow: 💎 <strong>₹{payments.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}</strong></p>
                    <p>Total Users: 👤 <strong>{owners.length + sellers.length + parties.length}</strong></p>
                </div>
            </header>

            <div className="dash-grid">
                <section className="list-section">
                    <h3>🎬 Managed Theaters</h3>
                    <div className="scroll-list">
                        {owners.map(o => (
                            <div key={o._id} className="user-card">
                                <strong>{o.theaterName}</strong>
                                <p>Owner: {o.name}</p>
                                <span className="location-text">📍 {o.location}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="list-section">
                    <h3>💰 Registered Ad Sellers</h3>
                    <div className="scroll-list">
                        {sellers.map(s => (
                            <div key={s._id} className="user-card">
                                <strong>{s.agencyName}</strong>
                                <p>Email: {s.email}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="list-section">
                    <h3>🤝 Third Party Partners</h3>
                    <div className="scroll-list">
                        {parties.map(p => (
                            <div key={p._id} className="user-card">
                                <strong>{p.companyName}</strong>
                                <p>Contact: {p.email}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="list-section full-width">
                    <h3>🏦 System-Wide Financial Audit 📜</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Theater</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p._id}>
                                    <td>{p.advertisementId?.title}</td>
                                    <td>{p.theaterOwnerId?.theaterName}</td>
                                    <td>₹{p.amount}</td>
                                    <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
