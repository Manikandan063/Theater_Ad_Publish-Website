import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdSellerDashboard = () => {
    const { user } = useAuth();
    const [ads, setAds] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [showAdForm, setShowAdForm] = useState(false);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [adData, setAdData] = useState({ title: '', description: '', mediaUrl: '', duration: '', adType: 'video', targetAudience: '', uploadType: 'url' });
    const [quoteData, setQuoteData] = useState({ advertisementId: '', targetType: 'theater', theaterOwnerId: '', thirdPartyId: '', price: '', message: '', validUntil: '', numberOfScreens: 1, durationUnit: 'Weekly' });
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAd, setSelectedAd] = useState(null);

    // Pagination states
    const itemsPerPage = 5;
    const [adPage, setAdPage] = useState(1);
    const [quotePage, setQuotePage] = useState(1);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [adsRes, quotesRes, theatersRes, brokersRes, paymentsRes] = await Promise.all([
                axios.get('/api/advertisements/my-ads'),
                axios.get('/api/quotations/my/seller-quotes'),
                axios.get('/api/theater-owners'),
                axios.get('/api/third-parties'),
                axios.get('/api/payments/my/history')
            ]);
            setAds(adsRes.data.data || []);
            setQuotes(quotesRes.data.data || []);
            setTheaters(theatersRes.data.data || []);
            setBrokers(brokersRes.data.data || []);
            setPayments(paymentsRes.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmitQuote = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...quoteData, basePrice: quoteData.price };
            if (payload.targetType === 'theater') {
                delete payload.thirdPartyId;
                if (!payload.theaterOwnerId) return alert('Please select a theater');
            } else {
                if (!payload.thirdPartyId) return alert('Please select a broker agency');
            }
            if (!payload.validUntil) delete payload.validUntil;

            await axios.post('/api/quotations', payload);
            setShowQuoteForm(false);
            setQuoteData({ advertisementId: '', targetType: 'theater', theaterOwnerId: '', thirdPartyId: '', price: '', message: '', validUntil: '', numberOfScreens: 1 });
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit quotation');
        }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/advertisements', adData);
            setShowAdForm(false);
            setAdData({ title: '', description: '', mediaUrl: '', duration: '', adType: 'video', targetAudience: '' });
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create ad');
        }
    };

    const handleRedirectToBroker = async (quote) => {
        try {
            if (!brokers.length) return alert('No active brokers found to take this request.');
            const brokerId = brokers[0]._id;
            await axios.post('/api/quotations', {
                advertisementId: quote.advertisementId._id,
                theaterOwnerId: quote.theaterOwnerId?._id,
                thirdPartyId: brokerId,
                price: quote.price,
                numberOfScreens: quote.numberOfScreens || 1,
                message: `Delegated from rejected Theater request. [Original Quote ID: ${quote._id}]`
            });

            // Delete the original stale quote since it's now redirected
            await axios.delete(`/api/quotations/${quote._id}`);

            alert('🚀 Successfully delegated to Broker partner and cleaned up original request!');
            fetchInitialData();
        } catch (err) {
            alert('Delegation failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handlePayment = async (quote) => {
        try {
            const displayName = quote.theaterOwnerId?.theaterName || quote.thirdPartyId?.companyName || 'Partner';
            if (!window.confirm(`Confirm payment of ₹${quote.price} to ${displayName}?`)) return;
            await axios.post('/api/payments/process', {
                advertisementId: quote.advertisementId._id || quote.advertisementId,
                theaterOwnerId: quote.theaterOwnerId?._id || null,
                thirdPartyId: quote.thirdPartyId?._id || quote.thirdPartyId || null,
                adSellerId: quote.adSellerId?._id || quote.adSellerId || user.id,
                amount: quote.price,
                paymentType: 'total',
                theaterOwnerShare: quote.theaterOwnerShare,
                adSellerShare: quote.adSellerShare,
                thirdPartyShare: quote.thirdPartyShare,
                remarks: `Direct Ad Payment for Quote #${quote._id}`
            });
            await axios.patch(`/api/quotations/${quote._id}/status`, {
                status: 'paid',
                message: 'Ad successfully published via online payment'
            });
            alert('✅ Payment successful! Your ad is now active.');
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Payment processing failed');
        }
    };

    const handleAcceptRates = async (quote) => {
        try {
            await axios.patch(`/api/quotations/${quote._id}/status`, {
                status: 'accepted',
                message: 'Publisher accepted the proposed commission rates'
            });
            alert('✅ Commission rates accepted! You can now proceed to payment.');
            fetchInitialData();
            setSelectedQuote(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept rates');
        }
    };

    const paginate = (items, page) => {
        const start = (page - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    };

    const Pagination = ({ total, current, setPage }) => {
        const totalPages = Math.ceil(total / itemsPerPage);
        if (totalPages <= 1) return null;
        return (
            <div className="pagination" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={current === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => (
                    <button key={i} className={`pagination-btn ${current === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                        {i + 1}
                    </button>
                ))}
                <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={current === totalPages}>Next</button>
            </div>
        );
    };

    if (loading) return <div className="main-content"><p>Loading Premium Dashboard...</p></div>;

    const stats = {
        totalAds: ads.length,
        activeQuotes: quotes.filter(q => q.status === 'accepted').length,
        pendingQuotes: quotes.filter(q => q.status === 'pending').length,
        totalInvestment: quotes.filter(q => q.status === 'paid').reduce((sum, q) => sum + (q.price || 0), 0)
    };

    return (
        <div className="main-content">
            <header className="dash-header">
                <div>
                    <h1>Ad Publisher Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your campaigns and screen placements.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => { setShowQuoteForm(!showQuoteForm); setShowAdForm(false); }}>
                        {showQuoteForm ? 'Close' : 'New Quote Request'}
                    </button>
                    <button className="btn btn-primary" onClick={() => { setShowAdForm(!showAdForm); setShowQuoteForm(false); }}>
                        {showAdForm ? 'Close' : '+ Create New Ad'}
                    </button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Advertisements</div>
                    <div className="stat-value">{stats.totalAds}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Accepted Quotes</div>
                    <div className="stat-value">{stats.activeQuotes}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending Requests</div>
                    <div className="stat-value">{stats.pendingQuotes}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Spent</div>
                    <div className="stat-value">₹{stats.totalInvestment}</div>
                </div>
            </div>

            {showAdForm && (
                <div className="glass-card slide-in" style={{ marginBottom: '2rem' }}>
                    <h3>Create New Ad</h3>
                    <form onSubmit={handleCreateAd} className="form-grid" style={{ marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label>Ad Title</label>
                            <input type="text" placeholder="Summer Blockbuster Ad" value={adData.title} onChange={(e) => setAdData({...adData, title: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Media Source Selection</label>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                                <button 
                                    type="button" 
                                    className={`btn ${adData.uploadType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setAdData({...adData, uploadType: 'url'})}
                                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem' }}
                                >
                                    🌐 Use Media URL
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn ${adData.uploadType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setAdData({...adData, uploadType: 'file'})}
                                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem' }}
                                >
                                    📁 Choose from Desktop
                                </button>
                            </div>

                            {adData.uploadType === 'url' ? (
                                <>
                                    <input 
                                        type="text" 
                                        placeholder="https://example.com/ad-video.mp4 or YouTube Link" 
                                        value={adData.mediaUrl} 
                                        onChange={(e) => setAdData({...adData, mediaUrl: e.target.value})} 
                                        required={adData.uploadType === 'url'} 
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        <span><strong>Tip:</strong> Use a direct MP4/PNG link for 1-click downloads. YouTube links will redirect to the source player.</span>
                                    </p>
                                </>
                            ) : (
                                <div style={{ 
                                    padding: '2rem', 
                                    border: '2px dashed var(--glass-border)', 
                                    borderRadius: 'var(--radius-md)', 
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <input 
                                        type="file" 
                                        id="local-ad-file"
                                        accept="video/*,image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                // Temporarily use local blob URL for the ad record
                                                const fakeUrl = URL.createObjectURL(file);
                                                setAdData({...adData, mediaUrl: fakeUrl}); 
                                                alert(`File selected: ${file.name} (Ready for Ad creation!)`);
                                            }
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="local-ad-file" className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.8rem 2rem' }}>
                                        Browse My Computer
                                    </label>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                                        Select MP4, PNG, or JPG files directly from your desktop folder.
                                    </p>
                                    {adData.mediaUrl.startsWith('blob:') && (
                                        <div style={{ marginTop: '1rem', color: 'var(--success)', fontSize: '0.8rem' }}>
                                            ✅ File Ready: Local path generated
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Duration (Seconds)</label>
                            <input type="number" value={adData.duration} onChange={(e) => setAdData({...adData, duration: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Ad Format</label>
                            <select value={adData.adType} onChange={(e) => setAdData({...adData, adType: e.target.value})}>
                                <option value="video">Cinema Video Ad</option>
                                <option value="static">Static Poster Ad</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Ad Description</label>
                            <textarea rows="2" value={adData.description} onChange={(e) => setAdData({...adData, description: e.target.value})} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Publish Ad</button>
                    </form>
                </div>
            )}

            {showQuoteForm && (
                <div className="glass-card slide-in" style={{ marginBottom: '2rem' }}>
                    <h3>Request Placement</h3>
                    <form onSubmit={handleSubmitQuote} className="form-grid" style={{ marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label>Select Active Ad</label>
                            <select value={quoteData.advertisementId} onChange={(e) => setQuoteData({...quoteData, advertisementId: e.target.value})} required>
                                <option value="">-- Choose Ad --</option>
                                {ads.map(ad => (
                                    <option key={ad._id} value={ad._id}>{ad.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Direct Theater or Broker?</label>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                    <input type="radio" checked={quoteData.targetType === 'theater'} onChange={() => setQuoteData({...quoteData, targetType: 'theater', thirdPartyId: ''})} /> Direct Screen
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                    <input type="radio" checked={quoteData.targetType === 'broker'} onChange={() => setQuoteData({...quoteData, targetType: 'broker', theaterOwnerId: ''})} /> Broker Partner
                                </label>
                            </div>
                        </div>

                        {quoteData.targetType === 'theater' ? (
                            <div className="form-group">
                                <label>Target Screen/Theater</label>
                                <select value={quoteData.theaterOwnerId} onChange={(e) => setQuoteData({...quoteData, theaterOwnerId: e.target.value})} required>
                                    <option value="">-- Choose Theater --</option>
                                    {theaters.map(t => (
                                        <option key={t._id} value={t._id}>{t.theaterName} ({t.location})</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Choose Broker Agency</label>
                                    <select value={quoteData.thirdPartyId} onChange={(e) => setQuoteData({...quoteData, thirdPartyId: e.target.value})} required>
                                        <option value="">-- Choose Broker --</option>
                                        {brokers.map(b => (
                                            <option key={b._id} value={b._id}>{b.companyName} ({b.name})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Target Theater (Optional for Broker)</label>
                                    <select value={quoteData.theaterOwnerId} onChange={(e) => setQuoteData({...quoteData, theaterOwnerId: e.target.value})}>
                                        <option value="">-- Let Broker Decide --</option>
                                        {theaters.map(t => (
                                            <option key={t._id} value={t._id}>{t.theaterName}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label>Proposed Price (₹)</label>
                            <input type="number" placeholder="5000" value={quoteData.price} onChange={(e) => setQuoteData({...quoteData, price: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>No. of Screens</label>
                            <input type="number" value={quoteData.numberOfScreens} onChange={(e) => setQuoteData({...quoteData, numberOfScreens: e.target.value})} />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Campaign Term Policy</label>
                            <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                                    <input 
                                        type="radio" 
                                        name="durationUnit" 
                                        checked={quoteData.durationUnit === 'Weekly'} 
                                        onChange={() => setQuoteData({...quoteData, durationUnit: 'Weekly'})} 
                                    />
                                    <span>Weekly Plan</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                                    <input 
                                        type="radio" 
                                        name="durationUnit" 
                                        checked={quoteData.durationUnit === 'Monthly'} 
                                        onChange={() => setQuoteData({...quoteData, durationUnit: 'Monthly'})} 
                                    />
                                    <span>Monthly Plan</span>
                                </label>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Send Placement Request</button>
                    </form>
                </div>
            )}

            <div className="dash-grid">
                <div style={{ gridColumn: 'span 12' }} className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Placement Quotations</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ad Title</th>
                                    <th>Theater / Partner</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginate(quotes, quotePage).length > 0 ? paginate(quotes, quotePage).map(q => (
                                    <tr key={q._id}>
                                        <td style={{ fontWeight: 600 }}>{q.advertisementId?.title || 'N/A'}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {q.theaterOwnerId?.theaterName || q.thirdPartyId?.companyName || 'Intermediary'}
                                            {q.thirdPartyId && <span className="badge badge-warning" style={{ fontSize: '0.6rem', marginLeft: '0.5rem' }}>Broker</span>}
                                        </td>
                                        <td className="price-tag">₹{q.price}</td>
                                        <td>
                                            <span className={`badge badge-${
                                                q.status === 'paid' || q.status === 'accepted' || q.status === 'approved' 
                                                ? 'success' 
                                                : q.status === 'proposed'
                                                ? 'warning'
                                                : q.status === 'rejected' 
                                                ? 'danger' 
                                                : 'pending'
                                            }`}>
                                                {q.status === 'proposed' ? 'Awaiting Acceptance' : q.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <button 
                                                    onClick={() => setSelectedQuote(q)}
                                                    style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    View
                                                </button>
                                                {q.status === 'proposed' && (
                                                    <button onClick={() => setSelectedQuote(q)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'var(--warning)', color: 'white' }}>
                                                        Review Rates
                                                    </button>
                                                )}
                                                {q.status === 'accepted' && (
                                                    <button onClick={() => handlePayment(q)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                        Pay Now
                                                    </button>
                                                )}
                                                {q.status === 'rejected' && (
                                                    <button onClick={() => handleRedirectToBroker(q)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                        Redirect to Broker
                                                    </button>
                                                )}
                                                {(q.status === 'paid' || q.status === 'approved') && <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>✓ Completed</span>}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No placement requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination total={quotes.length} current={quotePage} setPage={setQuotePage} />
                </div>

                <div style={{ gridColumn: 'span 12' }} className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Your Active Campaigns</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ad Title</th>
                                    <th>Format</th>
                                    <th>Duration</th>
                                    <th>Created</th>
                                    <th>Full Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginate(ads, adPage).length > 0 ? paginate(ads, adPage).map(ad => (
                                    <tr key={ad._id}>
                                        <td style={{ fontWeight: 600 }}>{ad.title}</td>
                                        <td>{ad.adType}</td>
                                        <td>{ad.duration}s</td>
                                        <td>{new Date(ad.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                onClick={() => setSelectedAd(ad)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem' }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No ads found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination total={ads.length} current={adPage} setPage={setAdPage} />
                </div>
            </div>

            {selectedQuote && (() => {
                const relatedPayment = payments.find(p => 
                    (p.advertisementId?._id || p.advertisementId) === (selectedQuote.advertisementId?._id || selectedQuote.advertisementId) 
                    && p.amount === selectedQuote.price
                );
                
                return (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                        <div className="glass-card" style={{ width: '400px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Ad Request Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                                    <span className={`badge badge-${
                                        selectedQuote.status === 'paid' || selectedQuote.status === 'accepted' || selectedQuote.status === 'approved' 
                                        ? 'success' 
                                        : selectedQuote.status === 'proposed'
                                        ? 'warning'
                                        : selectedQuote.status === 'rejected' 
                                        ? 'danger' 
                                        : 'pending'
                                    }`}>{selectedQuote.status === 'proposed' ? 'Rates Proposed' : selectedQuote.status}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Partner / Theater</span>
                                    <span style={{ fontWeight: 600 }}>{selectedQuote.theaterOwnerId?.theaterName || selectedQuote.thirdPartyId?.companyName || 'Intermediary'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Ad Name</span>
                                    <span style={{ fontWeight: 600 }}>{selectedQuote.advertisementId?.title}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Screens</span>
                                    <span style={{ fontWeight: 500 }}>{selectedQuote.numberOfScreens || 1}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total Paid / Proposed</span>
                                    <span className="price-tag" style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{selectedQuote.price}</span>
                                </div>
                                
                                {(relatedPayment || (selectedQuote.status === 'accepted' && selectedQuote.thirdPartyId) || (selectedQuote.status === 'proposed')) && (
                                    <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--text-secondary)' }}>Pricing Breakdown</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Base Ad Rate</span>
                                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>₹{selectedQuote.basePrice || selectedQuote.price}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Broker Commission</span>
                                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>₹{selectedQuote.price - (selectedQuote.basePrice || selectedQuote.price)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Rate</span>
                                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>₹{selectedQuote.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                {selectedQuote.status === 'proposed' && (
                                    <button 
                                        onClick={() => handleAcceptRates(selectedQuote)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.6rem 1.5rem', background: 'var(--success)', color: 'white' }}
                                    >
                                        Accept Commission Rates
                                    </button>
                                )}
                                {selectedQuote.status === 'accepted' && (
                                    <button 
                                        onClick={() => { handlePayment(selectedQuote); setSelectedQuote(null); }}
                                        className="btn btn-primary"
                                        style={{ padding: '0.6rem 1.5rem' }}
                                    >
                                        Accept & Pay Now
                                    </button>
                                )}
                                <button onClick={() => setSelectedQuote(null)} style={{ padding: '0.6rem 1.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {selectedAd && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card" style={{ width: '400px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Campaign Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ad Name</span>
                                <span style={{ fontWeight: 600 }}>{selectedAd.title}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Format</span>
                                <span className="badge badge-success">{selectedAd.adType}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Run Time</span>
                                <span style={{ fontWeight: 600 }}>{selectedAd.duration} Seconds</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Description</span>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                    {selectedAd.description || 'No description provided.'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Created On</span>
                                <span style={{ fontWeight: 500 }}>{new Date(selectedAd.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedAd(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem' }}>Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdSellerDashboard;
