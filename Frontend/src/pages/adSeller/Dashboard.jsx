import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const AdSellerDashboard = () => {
    const { user } = useAuth();
    const [ads, setAds] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [showAdForm, setShowAdForm] = useState(false);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [adData, setAdData] = useState({ 
        title: '', 
        description: '', 
        mediaUrl: '', 
        duration: '', 
        adType: 'video', 
        targetAudience: '', 
        uploadType: 'url',
        targetType: 'theater', 
        theaterOwnerId: '', 
        thirdPartyId: '', 
        price: '', 
        numberOfScreens: 1, 
        durationUnit: 'Weekly'
    });
    const [adFile, setAdFile] = useState(null);
    const [isEditingAd, setIsEditingAd] = useState(false);
    const [editingAdId, setEditingAdId] = useState(null);
    const [isEditingQuote, setIsEditingQuote] = useState(false);
    const [editingQuoteId, setEditingQuoteId] = useState(null);
    const [quoteData, setQuoteData] = useState({ 
        advertisementId: '', 
        targetType: 'theater', 
        theaterOwnerId: '', 
        thirdPartyId: '', 
        price: '', 
        message: '', 
        validUntil: '', 
        numberOfScreens: 1, 
        durationUnit: 'Weekly',
        mediaUrl: '',
        uploadType: 'url'
    });

    useEffect(() => {
        if (quoteData.advertisementId && ads.length > 0) {
            const selectedAdObj = ads.find(a => a._id === (quoteData.advertisementId._id || quoteData.advertisementId));
            if (selectedAdObj) {
                setQuoteData(prev => ({
                    ...prev,
                    mediaUrl: selectedAdObj.mediaUrl || '',
                    uploadType: selectedAdObj.mediaUrl && selectedAdObj.mediaUrl.startsWith('http') ? 'url' : 'file'
                }));
            }
        }
    }, [quoteData.advertisementId, ads]);
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
            // Check if media was changed in the quote form
            const selectedAd = ads.find(a => a._id === (quoteData.advertisementId?._id || quoteData.advertisementId));
            if (selectedAd && (quoteData.mediaUrl !== selectedAd.mediaUrl || adFile)) {
                // Update Advertisement Media
                const adFormData = new FormData();
                if (quoteData.uploadType === 'file' && adFile) {
                    adFormData.append('videoFile', adFile);
                } else {
                    adFormData.append('mediaUrl', quoteData.mediaUrl);
                }
                
                await axios.put(`/api/advertisements/${selectedAd._id}`, adFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            const payload = { ...quoteData };
            // Clean up internal UI state fields from the payload
            delete payload.mediaUrl;
            delete payload.uploadType;
            
            if (!payload.theaterOwnerId) delete payload.theaterOwnerId;
            if (!payload.thirdPartyId) delete payload.thirdPartyId;

            if (isEditingQuote) {
                await axios.put(`/api/quotations/${editingQuoteId}`, payload);
                alert('Quotation updated successfully!');
            } else {
                await axios.post('/api/quotations', payload);
                alert('Placement request sent successfully!');
            }
            setShowQuoteForm(false);
            setIsEditingQuote(false);
            setEditingQuoteId(null);
            setAdFile(null); // Clear file after submission
            setQuoteData({ advertisementId: '', targetType: 'theater', theaterOwnerId: '', thirdPartyId: '', price: '', message: '', validUntil: '', numberOfScreens: 1, durationUnit: 'Weekly', mediaUrl: '', uploadType: 'url' });
            fetchInitialData();
        } catch (error) {
            console.error('Error saving quotation:', error);
            alert('Failed to save request: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditQuote = (q) => {
        setIsEditingQuote(true);
        setEditingQuoteId(q._id);
        setQuoteData({
            advertisementId: q.advertisementId?._id || '',
            targetType: q.thirdPartyId ? 'broker' : 'theater',
            theaterOwnerId: q.theaterOwnerId?._id || '',
            thirdPartyId: q.thirdPartyId?._id || '',
            price: q.price,
            message: q.message || '',
            validUntil: q.validUntil ? q.validUntil.split('T')[0] : '',
            numberOfScreens: q.numberOfScreens || 1,
            durationUnit: q.durationUnit || 'Weekly'
        });
        setShowQuoteForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', adData.title);
            formData.append('description', adData.description);
            formData.append('duration', adData.duration);
            formData.append('adType', adData.adType);
            formData.append('targetAudience', adData.targetAudience);
            
            if (adData.uploadType === 'file' && adFile) {
                formData.append('videoFile', adFile);
            } else {
                formData.append('mediaUrl', adData.mediaUrl);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            let createdAd;
            if (isEditingAd) {
                const res = await axios.put(`/api/advertisements/${editingAdId}`, formData, config);
                createdAd = res.data.data;
                alert('Advertisement updated successfully!');
            } else {
                const res = await axios.post('/api/advertisements', formData, config);
                createdAd = res.data.data;
                alert('Advertisement created successfully!');
            }

            // Handle Immediate Quotation Creation if requested
            if (!isEditingAd && (adData.theaterOwnerId || adData.thirdPartyId)) {
                try {
                    const quotePayload = {
                        advertisementId: createdAd._id,
                        price: adData.price || 0,
                        numberOfScreens: adData.numberOfScreens || 1,
                        durationUnit: adData.durationUnit || 'Weekly',
                        message: `Automated request from ad creation flow.`
                    };

                    if (adData.targetType === 'theater' && adData.theaterOwnerId) {
                        quotePayload.theaterOwnerId = adData.theaterOwnerId;
                    } else if (adData.targetType === 'broker' && adData.thirdPartyId) {
                        quotePayload.thirdPartyId = adData.thirdPartyId;
                    }

                    await axios.post('/api/quotations', quotePayload);
                    alert('Placement request sent automatically!');
                } catch (qErr) {
                    console.error('Error creating auto-quote:', qErr);
                    alert('Campaign created, but auto-placement failed. Please use Request Placement manually.');
                }
            }

            setShowAdForm(false);
            setIsEditingAd(false);
            setEditingAdId(null);
            setAdData({ 
                title: '', description: '', mediaUrl: '', duration: '', adType: 'video', targetAudience: '', uploadType: 'url',
                targetType: 'theater', theaterOwnerId: '', thirdPartyId: '', price: '', numberOfScreens: 1, durationUnit: 'Weekly'
            });
            setAdFile(null);
            fetchInitialData();
        } catch (error) {
            console.error('Error saving advertisement:', error);
            alert('Failed to save advertisement: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditAd = (ad) => {
        setAdData({
            title: ad.title,
            description: ad.description,
            mediaUrl: ad.mediaUrl,
            duration: ad.duration,
            adType: ad.adType || 'video',
            targetAudience: ad.targetAudience,
            uploadType: ad.mediaUrl && ad.mediaUrl.startsWith('http') ? 'url' : 'file',
            targetType: 'theater', theaterOwnerId: '', thirdPartyId: '', price: '', numberOfScreens: 1, durationUnit: 'Weekly'
        });
        setEditingAdId(ad._id);
        setIsEditingAd(true);
        setShowAdForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteAd = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ad?')) return;
        try {
            await axios.delete(`/api/advertisements/${id}`);
            fetchInitialData();
        } catch (err) {
            alert('Failed to delete ad');
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
                    <h3>{isEditingAd ? 'Edit Advertisement' : 'Create New Ad'}</h3>
                    <form onSubmit={handleCreateAd} className="form-grid" style={{ marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label>Ad Title</label>
                            <input type="text" placeholder="Summer Blockbuster Ad" value={adData.title} onChange={(e) => setAdData({...adData, title: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Media Source</span>
                                {isEditingAd && <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)' }}>Editing Existing Campaign</span>}
                            </label>
                            
                            {isEditingAd && (
                                <div style={{ 
                                    padding: '0.75rem', 
                                    background: 'rgba(0,0,0,0.2)', 
                                    borderRadius: '8px', 
                                    marginBottom: '1rem',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.85rem'
                                }}>
                                    <strong>Current Media:</strong> {adData.mediaUrl}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                                <button 
                                    type="button" 
                                    className={`btn ${adData.uploadType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setAdData({...adData, uploadType: 'url'})}
                                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem' }}
                                >
                                    🌐 Change URL
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn ${adData.uploadType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setAdData({...adData, uploadType: 'file'})}
                                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem' }}
                                >
                                    📁 Upload New File
                                </button>
                            </div>

                            {adData.uploadType === 'url' ? (
                                <>
                                    <input 
                                        type="text" 
                                        placeholder="Paste new YouTube or MP4 link here..." 
                                        value={adData.mediaUrl.startsWith('/') || adData.mediaUrl.startsWith('blob:') ? '' : adData.mediaUrl} 
                                        onChange={(e) => setAdData({...adData, mediaUrl: e.target.value})} 
                                        required={adData.uploadType === 'url'} 
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        <span>Use a web link for the advertisement content.</span>
                                    </p>
                                </>
                            ) : (
                                <div style={{ 
                                    padding: '1.5rem', 
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
                                                const fakeUrl = URL.createObjectURL(file);
                                                setAdData({...adData, mediaUrl: fakeUrl}); 
                                                setAdFile(file);
                                            }
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="local-ad-file" className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.8rem 1.5rem' }}>
                                        {adFile ? 'Change Selected File' : 'Pick New File from Desktop'}
                                    </label>
                                    {adFile && (
                                        <div style={{ marginTop: '1rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                                            ✓ Ready: {adFile.name}
                                        </div>
                                    )}
                                    {!adFile && isEditingAd && adData.mediaUrl.startsWith('/') && (
                                        <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            Keep current file or pick a new one above.
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

                        {!isEditingAd && (
                            <div className="form-group" style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', marginTop: '1rem' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Optional: Request Immediate Placement</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Publish via?</label>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                                <input type="radio" checked={adData.targetType === 'theater'} onChange={() => setAdData({...adData, targetType: 'theater', thirdPartyId: ''})} /> Direct Theater
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                                <input type="radio" checked={adData.targetType === 'broker'} onChange={() => setAdData({...adData, targetType: 'broker', theaterOwnerId: ''})} /> Broker Agency
                                            </label>
                                        </div>
                                    </div>

                                    {adData.targetType === 'theater' ? (
                                        <div className="form-group">
                                            <label>Choose Theater</label>
                                            <select value={adData.theaterOwnerId} onChange={(e) => setAdData({...adData, theaterOwnerId: e.target.value})}>
                                                <option value="">-- No placement now --</option>
                                                {theaters.map(t => (
                                                    <option key={t._id} value={t._id}>{t.theaterName} ({t.location})</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>Choose Broker</label>
                                            <select value={adData.thirdPartyId} onChange={(e) => setAdData({...adData, thirdPartyId: e.target.value})}>
                                                <option value="">-- No placement now --</option>
                                                {brokers.map(b => (
                                                    <option key={b._id} value={b._id}>{b.companyName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    { (adData.theaterOwnerId || adData.thirdPartyId) && (
                                        <>
                                            <div className="form-group">
                                                <label>Offer Price (₹)</label>
                                                <input type="number" placeholder="Offer price" value={adData.price} onChange={(e) => setAdData({...adData, price: e.target.value})} />
                                            </div>
                                            <div className="form-group">
                                                <label>Screens</label>
                                                <input type="number" value={adData.numberOfScreens} onChange={(e) => setAdData({...adData, numberOfScreens: e.target.value})} />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                <label>Duration Plan</label>
                                                <select value={adData.durationUnit} onChange={(e) => setAdData({...adData, durationUnit: e.target.value})}>
                                                    <option value="Weekly">Weekly Plan</option>
                                                    <option value="Monthly">Monthly Plan</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditingAd ? 'Update Ad Details' : 'Create & Publish Ad'}</button>
                            {isEditingAd && <button type="button" className="btn btn-secondary" onClick={() => { setShowAdForm(false); setIsEditingAd(false); setAdData({ title: '', description: '', mediaUrl: '', duration: '', adType: 'video', targetAudience: '', uploadType: 'url', targetType: 'theater', theaterOwnerId: '', thirdPartyId: '', price: '', numberOfScreens: 1, durationUnit: 'Weekly' }); }}>Cancel</button>}
                        </div>
                    </form>
                </div>
            )}

            {showQuoteForm && (
                <div className="glass-card slide-in" style={{ marginBottom: '2rem' }}>
                    <h3>{isEditingQuote ? 'Update Quotation' : 'Request Placement'}</h3>
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

                        {quoteData.advertisementId && (
                            <div className="form-group" style={{ gridColumn: 'span 2', background: 'rgba(255,225,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--brand-primary)' }}>Campaign Media Source</span>
                                    {quoteData.mediaUrl && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current: {quoteData.mediaUrl.length > 30 ? '...' + quoteData.mediaUrl.slice(-25) : quoteData.mediaUrl}</span>}
                                </label>

                                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
                                    <button 
                                        type="button" 
                                        className={`btn ${quoteData.uploadType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setQuoteData({...quoteData, uploadType: 'url'})}
                                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                                    >
                                        Change URL
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn ${quoteData.uploadType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setQuoteData({...quoteData, uploadType: 'file'})}
                                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                                    >
                                        Upload New File
                                    </button>
                                </div>

                                {quoteData.uploadType === 'url' ? (
                                    <input 
                                        type="text" 
                                        placeholder="Paste new YouTube or MP4 link..." 
                                        value={quoteData.mediaUrl.startsWith('/') || quoteData.mediaUrl.startsWith('blob:') ? '' : quoteData.mediaUrl} 
                                        onChange={(e) => setQuoteData({...quoteData, mediaUrl: e.target.value})} 
                                        style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', border: '1px dashed var(--border)', padding: '1rem', borderRadius: '6px' }}>
                                        <input 
                                            type="file" 
                                            id="quote-ad-file"
                                            accept="video/*,image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const fakeUrl = URL.createObjectURL(file);
                                                    setQuoteData({...quoteData, mediaUrl: fakeUrl}); 
                                                    setAdFile(file);
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="quote-ad-file" className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                                            {adFile ? '✓ ' + adFile.name : 'Choose Master File'}
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

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
                        <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditingQuote ? 'Update Quotation Data' : 'Send Placement Request'}</button>
                            {isEditingQuote && <button type="button" className="btn btn-secondary" onClick={() => { setShowQuoteForm(false); setIsEditingQuote(false); setQuoteData({ advertisementId: '', targetType: 'theater', theaterOwnerId: '', thirdPartyId: '', price: '', message: '', validUntil: '', numberOfScreens: 1, durationUnit: 'Weekly' }); }}>Cancel</button>}
                        </div>
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
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                <button 
                                                    onClick={() => setSelectedQuote(q)}
                                                    style={{ padding: '0.4rem 0.6rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    View
                                                </button>
                                                {(q.status === 'pending' || q.status === 'proposed') && (
                                                    <button onClick={() => handleEditQuote(q)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                                                        ✏️ Edit
                                                    </button>
                                                )}
                                                {q.status === 'proposed' && (
                                                    <button onClick={() => setSelectedQuote(q)} className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', background: 'var(--warning)', color: 'white' }}>
                                                        Review
                                                    </button>
                                                )}
                                                {q.status === 'accepted' && (
                                                    <button onClick={() => handlePayment(q)} className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>
                                                        Pay Now
                                                    </button>
                                                )}
                                                {q.status === 'rejected' && (
                                                    <button onClick={() => handleRedirectToBroker(q)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>
                                                        Redirect
                                                    </button>
                                                )}
                                                {(q.status === 'paid' || q.status === 'approved') && <span style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 600 }}>✓ Done</span>}
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
            
            <Footer />
        </div>
    );
};

export default AdSellerDashboard;
