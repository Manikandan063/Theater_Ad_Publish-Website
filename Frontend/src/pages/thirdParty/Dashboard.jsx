import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ThirdPartyDashboard = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [owners, setOwners] = useState([]);

    // Pagination states
    const itemsPerPage = 5;
    const [pendingPage, setPendingPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);

    const [editData, setEditData] = useState({
        theaterOwnerId: '',
        theaterOwnerShare: 0,
        adSellerShare: 0,
        thirdPartyShare: 0,
        theaterPercent: 0,
        brokerPercent: 0
    });

    useEffect(() => {
        fetchInitialData();
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            const res = await axios.get('/api/theater-owners');
            setOwners(res.data.data || []);
        } catch(err) {
            console.error('Failed to fetch owners', err);
        }
    };

    const fetchInitialData = async () => {
        try {
            const [payRes, quoteRes] = await Promise.all([
                axios.get('/api/payments/my/history'),
                axios.get('/api/quotations/my/third-party-quotes')
            ]);
            setPayments(payRes.data.data || []);
            setQuotes(quoteRes.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const updateQuoteStatus = async (id, newStatus, customUpdateData = null) => {
        try {
            if (newStatus === 'proposed' && customUpdateData && !customUpdateData.theaterOwnerId) {
                return alert('Please select an Assignee Owner (Theater Owner) before sending to Publisher.');
            }

            const updatePayload = customUpdateData ? { status: newStatus, ...customUpdateData } : { status: newStatus };
            
            // Cleanup empty strings for IDs to avoid MongoDB cast errors
            if (updatePayload.theaterOwnerId === "") delete updatePayload.theaterOwnerId;

            await axios.patch(`/api/quotations/${id}/status`, updatePayload);
            fetchInitialData();
            if (selectedQuote?._id === id) {
                setSelectedQuote(null);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            const errMsg = err.response?.data?.message || 'Failed to update quote status.';
            alert(errMsg);
        }
    };

    const updateStatus = async (id, newStatus, customUpdateData = null) => {
        try {
            const updatePayload = customUpdateData ? { status: newStatus, ...customUpdateData } : { status: newStatus };
            await axios.put(`/api/payments/${id}`, updatePayload);
            fetchInitialData();
            if (selectedQuotation?._id === id) {
                setSelectedQuotation(null);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update transaction status.');
        }
    };

    const handleSelectQuotation = (q) => {
        setSelectedQuotation(q);
    };

    const handleSelectQuote = (q) => {
        setSelectedQuote(q);
        const baseAmt = q.basePrice || q.price;
        const tShare = q.theaterOwnerShare || 0;
        const bShare = q.thirdPartyShare || 0;
        const tPercent = baseAmt ? (tShare / baseAmt) * 100 : 0;
        const bPercent = baseAmt ? (bShare / baseAmt) * 100 : 0;
        setEditData({
            theaterOwnerId: q.theaterOwnerId?._id || '',
            theaterOwnerShare: tShare,
            adSellerShare: 0,
            thirdPartyShare: bShare,
            theaterPercent: tPercent,
            brokerPercent: bPercent
        });
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

    if (loading) return <div className="main-content"><p>Loading Account Portal...</p></div>;

    const totalVolume = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return (
        <div className="main-content">
            <header className="dash-header">
                <div>
                    <h1>Broker & Partner Portal</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View and manage platform transactions.</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Transaction Volume</div>
                    <div className="stat-value">₹{totalVolume.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">System Brokerage</div>
                    <div className="stat-value">0%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Earnings (Net)</div>
                    <div className="stat-value">₹0.00</div>
                </div>
            </div>

            <div className="glass-card slide-in" style={{ marginTop: '2.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>New Incoming Requests</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ad Campaign</th>
                                <th>Brand Partner</th>
                                <th>Target Theater</th>
                                <th>Budget</th>
                                <th>Screens</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginate(quotes.filter(q => q.status === 'pending'), pendingPage).length > 0 ? paginate(quotes.filter(q => q.status === 'pending'), pendingPage).map(q => (
                                <tr key={q._id}>
                                    <td style={{ fontWeight: 600 }}>{q.advertisementId?.title}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{q.adSellerId?.agencyName || q.adSellerId?.name}</td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{q.theaterOwnerId?.theaterName || 'Any/Broker Choice'}</td>
                                    <td className="price-tag">₹{q.price}</td>
                                    <td>{q.numberOfScreens || 1}</td>
                                    <td>
                                        <span className="badge badge-pending">Pending</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => handleSelectQuote(q)}
                                                style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                View & Edit
                                            </button>
                                            <button 
                                                onClick={() => updateQuoteStatus(q._id, 'rejected')}
                                                style={{ padding: '0.4rem 0.8rem', background: 'var(--error)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No new ad requests pending.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination total={quotes.filter(q => q.status === 'pending').length} current={pendingPage} setPage={setPendingPage} />
            </div>

            <div className="glass-card slide-in" style={{ marginTop: '2.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Completed Transactions</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ad Campaign</th>
                                <th>Screen Provider</th>
                                <th>Brand Partner</th>
                                <th>Volume</th>
                                <th>System Date</th>
                                <th>Quotation</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length > 0 ? payments.map(p => (
                                <tr key={p._id}>
                                    <td style={{ fontWeight: 600 }}>{p.advertisementId?.title}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{p.theaterOwnerId?.theaterName}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{p.adSellerId?.agencyName}</td>
                                    <td className="price-tag">₹{p.amount}</td>
                                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleSelectQuotation(p)}
                                            style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            View
                                        </button>
                                    </td>
                                    <td>
                                        <span style={{ 
                                            padding: '0.2rem 0.6rem', 
                                            borderRadius: '1rem', 
                                            fontSize: '0.85rem',
                                            background: p.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : p.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: p.status === 'paid' ? 'var(--success)' : p.status === 'failed' ? 'var(--error)' : 'var(--warning)'
                                        }}>
                                            {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        {(p.status === 'pending' || !p.status) ? (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>Awaiting Publisher Payment</span>
                                        ) : (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transaction volume recorded.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)', color: 'var(--warning)', fontSize: '0.85rem' }}>
                    <strong>Note:</strong> Starting this month, X-TOWN operates on a Direct-to-Owner model (100% split). Broker commissions are currently set to 0.00% by Administrator policy.
                </div>
            </div>

            {selectedQuotation && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ width: '400px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                            Transaction Summary
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ad Name</span>
                                <span style={{ fontWeight: 600 }}>{selectedQuotation.advertisementId?.title || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                                <span style={{ fontWeight: 500 }}>{selectedQuotation.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Screen Provider (Owner)</span>
                                <span style={{ fontWeight: 500 }}>{selectedQuotation.theaterOwnerId?.theaterName || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Theater Owner Share</span>
                                <span style={{ fontWeight: 500 }}>₹{selectedQuotation.theaterOwnerShare}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ad Seller Share</span>
                                <span style={{ fontWeight: 500 }}>₹{selectedQuotation.adSellerShare}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Broker Share</span>
                                <span style={{ fontWeight: 500 }}>₹{selectedQuotation.thirdPartyShare}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Price Paid</span>
                                <span className="price-tag" style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{selectedQuotation.amount}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                                onClick={() => setSelectedQuotation(null)}
                                style={{ padding: '0.6rem 1.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedQuote && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ width: '400px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                            Review Ad Placement
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ad Name</span>
                                <span style={{ fontWeight: 600 }}>{selectedQuote.advertisementId?.title || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>No of Screens</span>
                                <span style={{ fontWeight: 500 }}>{selectedQuote.numberOfScreens || 1}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Assignee Owner</span>
                                {selectedQuote.theaterOwnerId ? (
                                    <span style={{ fontWeight: 600 }}>{selectedQuote.theaterOwnerId.theaterName}</span>
                                ) : (
                                    <select 
                                        value={editData.theaterOwnerId}
                                        onChange={(e) => setEditData({...editData, theaterOwnerId: e.target.value})}
                                        style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                                    >
                                        <option value="">Select Owner</option>
                                        {owners.map(o => (
                                            <option key={o._id} value={o._id}>{o.theaterName}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Theater Commission (%)</span>
                                <input 
                                    type="number" 
                                    value={editData.theaterPercent}
                                    onChange={(e) => {
                                        const p = Number(e.target.value);
                                        const baseAmt = selectedQuote.basePrice || selectedQuote.price;
                                        const share = (baseAmt * p) / 100;
                                        setEditData({
                                            ...editData, 
                                            theaterPercent: p,
                                            theaterOwnerShare: share
                                        })
                                    }}
                                    style={{ width: '80px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Broker Service Fee (%)</span>
                                <input 
                                    type="number" 
                                    value={editData.brokerPercent}
                                    onChange={(e) => {
                                        const p = Number(e.target.value);
                                        const baseAmt = selectedQuote.basePrice || selectedQuote.price;
                                        const share = (baseAmt * p) / 100;
                                        setEditData({
                                            ...editData, 
                                            brokerPercent: p,
                                            thirdPartyShare: share
                                        })
                                    }}
                                    style={{ width: '80px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Base Ad Price</span>
                                <span style={{ fontWeight: 600 }}>₹{selectedQuote.basePrice || selectedQuote.price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Final Price</span>
                                <span className="price-tag" style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{(selectedQuote.basePrice || selectedQuote.price) + editData.theaterOwnerShare + editData.thirdPartyShare}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--success)', textAlign: 'right' }}>
                                Commission added on base price
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                                onClick={() => {
                                    const baseAmt = selectedQuote.basePrice || selectedQuote.price;
                                    const newPrice = baseAmt + editData.theaterOwnerShare + editData.thirdPartyShare;
                                    // Include basePrice in payload to ensure it's saved if missing
                                    updateQuoteStatus(selectedQuote._id, 'proposed', { 
                                        ...editData, 
                                        price: newPrice,
                                        basePrice: baseAmt 
                                    });
                                }}
                                style={{ padding: '0.6rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                            >
                                Send to Publisher
                            </button>
                            <button 
                                onClick={() => setSelectedQuote(null)}
                                style={{ padding: '0.6rem 1.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThirdPartyDashboard;
