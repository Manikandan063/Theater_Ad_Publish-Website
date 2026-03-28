import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TheaterOwnerDashboard = () => {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getMediaUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Ensure we don't end up with double slashes or missing slashes
        const base = (axios.defaults.baseURL || 'http://localhost:5000').replace(/\/+$/, '');
        const path = url.replace(/^\/+/, '');
        return `${base}/${path}`;
    };

    const [selectedQuote, setSelectedQuote] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [scheduleData, setScheduleData] = useState({ screenNumber: 'Screen 1', showTime: 'All Shows' });

    // Pagination states
    const itemsPerPage = 5;
    const [requestPage, setRequestPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [quotesRes, paymentsRes] = await Promise.all([
                axios.get('/api/quotations/my/owner-quotes'),
                axios.get('/api/payments/my/history')
            ]);
            setQuotes(quotesRes.data.data || []);
            setPayments(paymentsRes.data.data || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuoteAction = async (id, status) => {
        try {
            await axios.patch(`/api/quotations/${id}/status`, { status });
            alert(`Quote ${status} successfully!`);
            fetchInitialData();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handlePublishAd = async () => {
        try {
            await axios.patch(`/api/quotations/${selectedQuote._id}/status`, {
                status: 'published',
                ...scheduleData
            });
            alert('🚀 Ad successfully scheduled and published!');
            setShowPublishModal(false);
            setSelectedQuote(null);
            fetchInitialData();
        } catch (err) {
            alert('Failed to publish ad');
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

    if (loading) return <div className="main-content"><p>Loading Screen Management...</p></div>;

    const totalRevenue = payments.reduce((acc, p) => acc + (p.theaterOwnerShare || 0), 0);
    const activeAds = quotes.filter(q => q.status === 'published').length;

    return (
        <div className="main-content">
            <header className="dash-header">
                <div>
                    <h1>{user.theaterName || "Cinema"} Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Theater Owner Portal & Revenue Center</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Live Profile</div>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">₹{totalRevenue.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">On-Air Ads</div>
                    <div className="stat-value">{activeAds}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending Requests</div>
                    <div className="stat-value">{quotes.filter(q => q.status === 'pending').length}</div>
                </div>
            </div>

            <div className="dashboard-layout" style={{ marginTop: '2.5rem' }}>
                <div style={{ gridColumn: 'span 12' }} className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Incoming Ad Requests & Scheduling</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Advertiser</th>
                                    <th>Ad Title</th>
                                    <th>Price</th>
                                    <th>Campaign Term</th>
                                    <th>Status</th>
                                    <th>Schedule ad</th>
                                    <th>Full Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginate(quotes.filter(q => ['pending', 'proposed', 'accepted', 'paid', 'published'].includes(q.status)), requestPage).length > 0 ? 
                                    paginate(quotes.filter(q => ['pending', 'proposed', 'accepted', 'paid', 'published'].includes(q.status)), requestPage).map(q => (
                                    <tr key={q._id}>
                                        <td style={{ fontWeight: 600 }}>{q.adSellerId?.agencyName || q.adSellerId?.name}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{q.advertisementId?.title}</td>
                                        <td className="price-tag">₹{q.price}</td>
                                        <td>
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                padding: '0.25rem 0.6rem', 
                                                borderRadius: '4px', 
                                                background: q.durationUnit === 'Monthly' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                                color: q.durationUnit === 'Monthly' ? '#93c5fd' : '#c4b5fd',
                                                border: `1px solid ${q.durationUnit === 'Monthly' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                                            }}>
                                                {q.durationUnit || 'Weekly'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${
                                                q.status === 'published' ? 'success' : q.status === 'paid' ? 'primary' : q.status === 'accepted' ? 'success' : 'pending'
                                            }`}>
                                                {q.status === 'published' ? 'Active On-Air' : q.status === 'paid' ? 'Payment Received' : q.status === 'accepted' ? 'Ready/Waiting' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {q.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button className="btn btn-success" onClick={() => handleQuoteAction(q._id, 'accepted')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white' }}>
                                                            Approve
                                                        </button>
                                                        <button className="btn btn-secondary" onClick={() => handleQuoteAction(q._id, 'rejected')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '4px', color: 'var(--danger)' }}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {q.status === 'paid' && (
                                                    <button onClick={() => { setSelectedQuote(q); setShowPublishModal(true); }} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600 }}>
                                                        Schedule & Publish
                                                    </button>
                                                )}
                                                {q.status === 'published' && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontStyle: 'italic' }}>Live on screen</span>
                                                )}
                                                {q.status === 'accepted' && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Waiting for payment</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn btn-primary" onClick={() => setSelectedQuote(q)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No placement requests.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination total={quotes.filter(q => ['pending', 'proposed', 'accepted', 'paid', 'published'].includes(q.status)).length} current={requestPage} setPage={setRequestPage} />
                </div>

                <div style={{ gridColumn: 'span 12', marginTop: '1.5rem' }} className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Revenue History</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ad Name</th>
                                    <th>Total Received</th>
                                    <th>Your Share</th>
                                    <th>Screen Info</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginate(payments, historyPage).length > 0 ? paginate(payments, historyPage).map(p => (
                                    <tr key={p._id}>
                                        <td style={{ fontWeight: 600 }}>{p.advertisementId?.title}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>₹{p.amount}</td>
                                        <td className="price-tag">₹{p.theaterOwnerShare.toFixed(2)}</td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {quotes.find(q => q.advertisementId?._id === p.advertisementId?._id)?.screenNumber || 'N/A'} - {quotes.find(q => q.advertisementId?._id === p.advertisementId?._id)?.showTime || 'Standard'}
                                        </td>
                                        <td>
                                            <span className="badge badge-success">Success</span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => setSelectedPayment(p)}
                                                style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No revenue records yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination total={payments.length} current={historyPage} setPage={setHistoryPage} />
                </div>
            </div>

            {/* View Details Modal */}
            {selectedQuote && !showPublishModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card" style={{ width: '450px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Ad Request Details</h3>
                        
                        {/* Media Preview Section */}
                        <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', background: '#000', border: '1px solid var(--border)', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(() => {
                                const ad = selectedQuote.advertisementId;
                                const rawUrl = ad?.mediaUrl;
                                if (!rawUrl) return <span style={{ color: 'var(--text-muted)' }}>No Media Preview Available</span>;

                                // Handle YouTube/Vimeo/Embeddable links
                                const ytId = getYouTubeId(rawUrl);
                                if (ytId) {
                                    return (
                                        <iframe 
                                            width="100%" 
                                            height="250" 
                                            src={`https://www.youtube.com/embed/${ytId}`} 
                                            title="YouTube video player" 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    );
                                }

                                const finalUrl = getMediaUrl(rawUrl);
                                const isVideo = ad.adType === 'video' || rawUrl.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv|3gp|wmv)$/i);

                                if (isVideo) {
                                    return (
                                        <video 
                                            src={finalUrl} 
                                            controls 
                                            controlsList="nodownload" 
                                            onContextMenu={(e) => e.preventDefault()}
                                            style={{ width: '100%', maxHeight: '300px' }} 
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallbackDiv = e.target.parentElement;
                                                fallbackDiv.innerHTML = `
                                                    <div style="text-align: center; padding: 1rem; color: var(--text-muted)">
                                                        <p>Video format not supported by browser.</p>
                                                        <a href="${finalUrl}" target="_blank" style="color: var(--primary); font-size: 0.8rem">Open in New Tab</a>
                                                    </div>
                                                `;
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <img 
                                        src={finalUrl} 
                                        onContextMenu={(e) => e.preventDefault()}
                                        alt="Ad Content" 
                                        style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const fallbackDiv = e.target.parentElement;
                                            fallbackDiv.innerHTML = `
                                                <div style="text-align: center; padding: 1rem; color: var(--text-muted)">
                                                    <p>Image preview failed.</p>
                                                    <a href="${finalUrl}" target="_blank" style="color: var(--primary); font-size: 0.8rem">Open Image</a>
                                                </div>
                                            `;
                                        }}
                                    />
                                );
                            })()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Brand Partner</span>
                                <span style={{ fontWeight: 600 }}>{selectedQuote.adSellerId?.agencyName || selectedQuote.adSellerId?.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ad Name</span>
                                <span style={{ fontWeight: 600 }}>{selectedQuote.advertisementId?.title}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Screens</span>
                                <span style={{ fontWeight: 500 }}>{selectedQuote.numberOfScreens || 1}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Campaign Term</span>
                                <span className="badge badge-primary">{selectedQuote.durationUnit || 'Weekly'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Proposed Price</span>
                                <span className="price-tag" style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{selectedQuote.price}</span>
                            </div>
                        </div>

                        {/* Restricted Download section */}
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            {['paid', 'published'].includes(selectedQuote.status) ? (
                                (() => {
                                    const ytId = getYouTubeId(selectedQuote.advertisementId.mediaUrl);
                                    if (ytId) {
                                        return (
                                            <a 
                                                href={selectedQuote.advertisementId.mediaUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-success" 
                                                style={{ padding: '0.6rem 1.5rem', textDecoration: 'none', color: 'white', fontWeight: 600 }}
                                            >
                                                ⬇️ Download Video (YouTube)
                                            </a>
                                        );
                                    }
                                    return (
                                        <a 
                                            href={getMediaUrl(selectedQuote.advertisementId.mediaUrl)} 
                                            download 
                                            className="btn btn-success" 
                                            style={{ padding: '0.6rem 1.5rem', textDecoration: 'none', color: 'white', fontWeight: 600 }}
                                        >
                                            ⬇️ Download Master File
                                        </a>
                                    );
                                })()
                            ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontStyle: 'italic', alignSelf: 'center', marginRight: 'auto' }}>
                                    🔒 Download available after payment
                                </span>
                            )}
                            <button onClick={() => setSelectedQuote(null)} style={{ padding: '0.6rem 1.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Publish Modal */}
            {showPublishModal && selectedQuote && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card" style={{ width: '400px', maxWidth: '90%', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Finalize Ad Schedule</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Theater Screen</label>
                                <select 
                                    className="input-select" 
                                    value={scheduleData.screenNumber}
                                    onChange={(e) => setScheduleData({ ...scheduleData, screenNumber: e.target.value })}
                                    style={{ width: '100%', background: '#334155', color: 'white', padding: '0.75rem', borderRadius: '8px' }}
                                >
                                    <option value="Screen 1">Screen 1 (Main Hall)</option>
                                    <option value="Screen 2">Screen 2</option>
                                    <option value="Screen 3">Screen 3 (Premium)</option>
                                    <option value="IMAX Screen">IMAX Screen</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Screening Time Slot</label>
                                <select 
                                    className="input-select" 
                                    value={scheduleData.showTime}
                                    onChange={(e) => setScheduleData({ ...scheduleData, showTime: e.target.value })}
                                    style={{ width: '100%', background: '#334155', color: 'white', padding: '0.75rem', borderRadius: '8px' }}
                                >
                                    <option value="Morning Show (10:00 AM)">Morning Show (10:00 AM)</option>
                                    <option value="Matinee Show (1:30 PM)">Matinee Show (1:30 PM)</option>
                                    <option value="First Show (6:30 PM)">First Show (6:30 PM)</option>
                                    <option value="Second Show (9:15 PM)">Second Show (9:15 PM)</option>
                                    <option value="All Shows">All Daily Shows</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button onClick={() => setShowPublishModal(false)} className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }}>Cancel</button>
                            <button onClick={handlePublishAd} className="btn btn-primary" style={{ background: 'var(--brand-primary)', color: 'white', padding: '0.6rem 1.5rem' }}>Publish Ad Now</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revenue Details Modal */}
            {selectedPayment && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card" style={{ width: '400px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Revenue Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ad Name</span>
                                <span style={{ fontWeight: 600 }}>{selectedPayment.advertisementId?.title}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Gross Collection</span>
                                <span style={{ fontWeight: 500 }}>₹{selectedPayment.amount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Your Net Share</span>
                                <span className="price-tag" style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{selectedPayment.theaterOwnerShare.toFixed(2)}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedPayment(null)} style={{ padding: '0.6rem 1.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TheaterOwnerDashboard;
