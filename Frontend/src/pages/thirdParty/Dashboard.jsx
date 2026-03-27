import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ThirdPartyDashboard = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Third party views all payments they are managing or a general history
            const response = await axios.get('http://localhost:5000/api/payments/my/history');
            setPayments(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <p>Loading Dashboard...</p>;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <h1>Third Party Partner Portal</h1>
                <div className="summary-stats">
                    <p>Total Broker Commissions (20% from both sides): 💸 <strong>₹{(payments || []).reduce((acc, p) => acc + (p.thirdPartyShare || 0), 0).toFixed(2)}</strong></p>
                </div>
            </header>

            <div className="dash-grid">
                <section className="list-section full-width">
                    <h3>Transparent Platform Transactions 📈</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Owner</th>
                                <th>Ad Seller</th>
                                <th>Total</th>
                                <th>Broker Commission (20%)</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(payments || []).length > 0 ? (payments || []).map(p => (
                                <tr key={p._id}>
                                    <td>{p.advertisementId?.title}</td>
                                    <td>{p.theaterOwnerId?.theaterName}</td>
                                    <td>{p.adSellerId?.agencyName}</td>
                                    <td>₹{p.amount}</td>
                                    <td className="commission-text"><strong>₹{p.thirdPartyShare.toFixed(2)}</strong></td>
                                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                </tr>
                            )) : <tr><td colSpan="6">No transactions recorded yet.</td></tr>}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
};

export default ThirdPartyDashboard;
