import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TheaterOwnerDashboard = () => {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [quotesRes, paymentsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/quotations/my/owner-quotes'),
                axios.get('http://localhost:5000/api/payments/my/history')
            ]);
            setQuotes(quotesRes.data.data);
            setPayments(paymentsRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleQuoteAction = async (quoteId, action) => {
        try {
            await axios.patch(`http://localhost:5000/api/quotations/${quoteId}/status`, { 
                status: action,
                message: action === 'accepted' ? 'Confirmed for next slot' : 'Price too low'
            });
            fetchInitialData();
            alert(`Quotation ${action}!`);
        } catch (err) {
            alert('Failed to update quotation');
        }
    };

    if (loading) return <p>Loading Dashboard...</p>;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <h1>Owner Portal: {user.theaterName || user.name}</h1>
                <div className="summary-stats">
                    <p>Total Revenue: 🏙️ <strong>₹{(payments || []).reduce((acc, p) => acc + (p.theaterOwnerShare || 0), 0).toFixed(2)}</strong></p>
                </div>
            </header>

            <div className="dash-grid">
                <section className="list-section">
                    <h3>Incoming Quotation Requests</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ad Agency</th>
                                <th>Ad Title</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(quotes || []).filter(q => q.status === 'pending').length > 0 ? (quotes || []).filter(q => q.status === 'pending').map(q => (
                                <tr key={q._id}>
                                    <td>{q.adSellerId?.agencyName}</td>
                                    <td>{q.advertisementId?.title}</td>
                                    <td>₹{q.price}</td>
                                    <td className="actions-cell">
                                        <button className="approve-btn" onClick={() => handleQuoteAction(q._id, 'accepted')}>Approve</button>
                                        <button className="reject-btn" onClick={() => handleQuoteAction(q._id, 'rejected')}>Reject</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4">No pending quotations found.</td></tr>}
                        </tbody>
                    </table>
                </section>

                <section className="list-section">
                    <h3>Recent Payments & Share 🏦</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Total</th>
                                <th>My Share (80%)</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(payments || []).length > 0 ? (payments || []).map(p => (
                                <tr key={p._id}>
                                    <td>{p.advertisementId?.title}</td>
                                    <td>₹{p.amount}</td>
                                    <td><strong>₹{p.theaterOwnerShare.toFixed(2)}</strong></td>
                                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                </tr>
                            )) : <tr><td colSpan="4">No payments found.</td></tr>}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
};

export default TheaterOwnerDashboard;
