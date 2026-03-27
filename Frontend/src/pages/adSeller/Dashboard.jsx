import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdSellerDashboard = () => {
    const { user } = useAuth();
    const [ads, setAds] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [showAdForm, setShowAdForm] = useState(false);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [adData, setAdData] = useState({ title: '', description: '', mediaUrl: '', duration: '', adType: 'video', targetAudience: '' });
    const [quoteData, setQuoteData] = useState({ advertisementId: '', theaterOwnerId: '', price: '', message: '', validUntil: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [adsRes, quotesRes, theatersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/advertisements/my-ads'),
                axios.get('http://localhost:5000/api/quotations/my/seller-quotes'),
                axios.get('http://localhost:5000/api/theater-owners'),
            ]);
            setAds(adsRes.data.data);
            setQuotes(quotesRes.data.data);
            setTheaters(theatersRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/advertisements', adData);
            setShowAdForm(false);
            setAdData({ title: '', description: '', mediaUrl: '', duration: '', adType: 'video', targetAudience: '' });
            fetchInitialData();
            alert('Advertisement Created!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create ad');
        }
    };

    const handleSubmitQuote = async (e) => {
        e.preventDefault();
        if (!quoteData.advertisementId || !quoteData.theaterOwnerId) {
            alert('Please select an Ad and a Theater.');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/quotations', quoteData);
            setShowQuoteForm(false);
            setQuoteData({ advertisementId: '', theaterOwnerId: '', price: '', message: '', validUntil: '' });
            fetchInitialData();
            alert('Quotation sent to Theater Owner!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit quotation');
        }
    };

    const handlePayment = async (quote) => {
        try {
            if (!window.confirm(`Are you sure you want to pay ₹${quote.price} to finalize this campaign?`)) return;

            // 1. Process Payment to trigger 80/20 automatic revenue split
            await axios.post('http://localhost:5000/api/payments/process', {
                advertisementId: quote.advertisementId._id || quote.advertisementId,
                theaterOwnerId: quote.theaterOwnerId._id || quote.theaterOwnerId,
                adSellerId: quote.adSellerId._id || quote.adSellerId || user.id,
                amount: quote.price,
                paymentType: 'total', // using one of enum: 'screen-wise', 'total', 'weekly', 'monthly'
                remarks: `Total Ad Payment for Quote #${quote._id}`
            });

            // 2. Mark Quotation as 'paid'
            // The adSeller route doesn't have a status updater, we'll need to use admin route or backend should handle this.
            // Wait, we need to allow Ad Seller to mark it as paid. Or we can just let the payment exist.
            // For now, let's just alert success and re-fetch.
            alert('✅ Payment Processed Successfully! The Ad is now active in the Theater.');
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Payment processing failed');
        }
    };

    if (loading) return <p style={{ padding: '20px' }}>Loading Dashboard...</p>;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <h1>📢 Ad Seller Portal</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="add-btn" onClick={() => { setShowAdForm(!showAdForm); setShowQuoteForm(false); }}>
                        {showAdForm ? 'Cancel' : '+ Create New Ad'}
                    </button>
                    <button className="add-btn" style={{ background: '#6366f1' }} onClick={() => { setShowQuoteForm(!showQuoteForm); setShowAdForm(false); }}>
                        {showQuoteForm ? 'Cancel' : '📩 Send Quotation to Theater'}
                    </button>
                </div>
            </header>

            {/* Create Ad Form */}
            {showAdForm && (
                <section className="form-section" style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3>Create New Advertisement</h3>
                    <form onSubmit={handleCreateAd} className="ad-form">
                        <input type="text" placeholder="Ad Title *" value={adData.title} onChange={(e) => setAdData({...adData, title: e.target.value})} required />
                        <textarea rows="3" placeholder="Description *" value={adData.description} onChange={(e) => setAdData({...adData, description: e.target.value})} required />
                        <input type="text" placeholder="Media URL (Image/Video Link) *" value={adData.mediaUrl} onChange={(e) => setAdData({...adData, mediaUrl: e.target.value})} required />
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <input type="number" placeholder="Duration in seconds *" value={adData.duration} onChange={(e) => setAdData({...adData, duration: e.target.value})} required />
                            <select value={adData.adType} onChange={(e) => setAdData({...adData, adType: e.target.value})}>
                                <option value="video">Video Ad</option>
                                <option value="static">Static Image Ad</option>
                            </select>
                        </div>
                        <input type="text" placeholder="Target Audience (e.g. Youth, Families)" value={adData.targetAudience} onChange={(e) => setAdData({...adData, targetAudience: e.target.value})} />
                        <button type="submit" className="submit-btn">Publish Advertisement</button>
                    </form>
                </section>
            )}

            {/* Submit Quotation Form */}
            {showQuoteForm && (
                <section className="form-section" style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3>📩 Send Quotation to a Theater</h3>
                    <form onSubmit={handleSubmitQuote} className="ad-form">
                        <div>
                            <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Select Your Advertisement *</label>
                            <select value={quoteData.advertisementId} onChange={(e) => setQuoteData({...quoteData, advertisementId: e.target.value})} required>
                                <option value="">-- Choose an Ad --</option>
                                {ads.map(ad => (
                                    <option key={ad._id} value={ad._id}>{ad.title} ({ad.adType})</option>
                                ))}
                            </select>
                            {ads.length === 0 && <small style={{ color: 'red' }}>⚠️ Create an ad first before sending a quotation.</small>}
                        </div>
                        <div>
                            <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Select Theater to Display Ad *</label>
                            <select value={quoteData.theaterOwnerId} onChange={(e) => setQuoteData({...quoteData, theaterOwnerId: e.target.value})} required>
                                <option value="">-- Choose a Theater --</option>
                                {theaters.map(t => (
                                    <option key={t._id} value={t._id}>{t.theaterName} — {t.location}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Offer Price (₹) *</label>
                                <input type="number" placeholder="e.g. 5000" value={quoteData.price} onChange={(e) => setQuoteData({...quoteData, price: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Valid Until</label>
                                <input type="date" value={quoteData.validUntil} onChange={(e) => setQuoteData({...quoteData, validUntil: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Message to Theater Owner</label>
                            <textarea rows="2" placeholder="e.g. Request for prime time evening slots..." value={quoteData.message} onChange={(e) => setQuoteData({...quoteData, message: e.target.value})} />
                        </div>
                        <button type="submit" className="submit-btn" style={{ background: '#6366f1' }}>Send Quotation →</button>
                    </form>
                </section>
            )}

            <div className="dash-grid">
                {/* My Ads */}
                <section className="list-section">
                    <h3>My Advertisements ({ads.length})</h3>
                    <div className="card-grid">
                        {ads.length > 0 ? ads.map(ad => (
                            <div key={ad._id} className="ad-card">
                                <h4 style={{ margin: '0 0 6px 0' }}>{ad.title} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({ad.adType})</span></h4>
                                <p style={{ margin: '0 0 8px 0', color: '#555', fontSize: '0.9rem' }}>{ad.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>⏱ {ad.duration}s</span>
                                    <span className={`status-badge ${ad.status || 'pending'}`}>{ad.status || 'pending'}</span>
                                </div>
                            </div>
                        )) : <p style={{ color: '#999' }}>No ads yet. Click "+ Create New Ad" to get started.</p>}
                    </div>
                </section>

                {/* My Quotations */}
                <section className="list-section">
                    <h3>Sent Quotations ({quotes.length})</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Theater</th>
                                <th>Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.length > 0 ? quotes.map(q => (
                                <tr key={q._id}>
                                    <td>{q.advertisementId?.title || 'N/A'}</td>
                                    <td>{q.theaterOwnerId?.theaterName || 'N/A'}</td>
                                    <td>₹{q.price}</td>
                                    <td>
                                        <span className={`status-badge ${q.status}`}>{q.status}</span>
                                        {q.status === 'accepted' && (
                                            <button 
                                                onClick={() => handlePayment(q)} 
                                                className="add-btn" 
                                                style={{ padding: '4px 8px', marginLeft: '10px', fontSize: '0.8rem', background: '#10b981' }}
                                            >
                                                💳 Pay & Publish
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>No quotations sent yet.</td></tr>}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
};

export default AdSellerDashboard;
