import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import config from './config';
import { useAuth } from './context/AuthContext';

const RecallPage = () => {
    const { access_token, authenticatedFetch } = useAuth();
    
    const [recalls, setRecalls] = useState([]);
    const [filteredRecalls, setFilteredRecalls] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState('all');
    const [selectedClassifications, setSelectedClassifications] = useState(['Class I', 'Class II', 'Class III']);
    const [lastUpdated, setLastUpdated] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch recalls from backend API
    useEffect(() => {
        const fetchRecalls = async () => {
            try {
                setLoading(true);
                // Use authenticatedFetch if user is logged in, otherwise use regular fetch
                const response = access_token 
                    ? await authenticatedFetch(`${config.API_BASE_URL}/recalls`)
                    : await fetch(`${config.API_BASE_URL}/recalls`);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                const rawRecalls = data.recalls || [];
                
                // Transform backend field names to frontend format
                const recallData = rawRecalls.map(recall => ({
                    id: recall.RecallID || recall.id || "",
                    productName: recall["Product Description"] || recall.productName || "",
                    brand: recall["Recalling Firm"] || recall.brand || "",
                    classification: recall.Classification || recall.classification || "",
                    reportDate: recall["Report Date"] || recall.reportDate || "",
                    affectedAreas: recall.Distribution || recall.affectedAreas || "",
                    reason: recall["Reason for Recall"] || recall.reason || "",
                    codeInfo: recall["Code Info"] || recall.codeInfo || "",
                    upcs: recall.UPCs || recall.upcs || [],
                    quantity: recall["Product Quantity"] || recall.quantity || "",
                    source: recall.Source || recall.source || "",
                }));
                
                setRecalls(recallData);
                setFilteredRecalls(recallData);
                
                // Set last updated timestamp
                if (data.latest_timestamp) {
                    const date = new Date(data.latest_timestamp);
                    setLastUpdated(date.toLocaleDateString('en-US'));
                } else {
                    setLastUpdated(new Date().toLocaleDateString('en-US'));
                }
            } catch (err) {
                console.error('Error fetching recalls:', err);
                setError('Failed to load recall data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecalls();
    }, [access_token, authenticatedFetch]);

    // Combined filter function for date and classification
    useEffect(() => {
        filterRecalls(selectedDateRange, selectedClassifications);
    }, [selectedDateRange, selectedClassifications, recalls]);

    const filterRecalls = (range, classifications) => {
        const today = new Date(); // current date
        let filtered = [...recalls];

        // filter by date range
        if (range !== 'all') {
            filtered = filtered.filter(recall => {
                const recallDate = new Date(recall.reportDate);
                const diffTime = today - recallDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch(range) {
                    case '7days':
                        return diffDays <= 7;
                    case '2weeks':
                        return diffDays <= 14;
                    case '30days':
                        return diffDays <= 30;
                    case '3months':
                        return diffDays <= 90;
                    case '6months':
                        return diffDays <= 180;
                    default:
                        return true;
                }
            });
        }

        // filter by classification
        if (classifications.length > 0) {
            filtered = filtered.filter(recall => classifications.includes(recall.classification));
        }

        // sort by date in descending order (latest first)
        filtered.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
        setFilteredRecalls(filtered);
    };

    const handleDateRangeChange = (e) => {
        setSelectedDateRange(e.target.value);
    };

    const toggleClassification = (classification) => {
        setSelectedClassifications(prev => {
            if (prev.includes(classification)) {
                // prevent deselecting all - keep at least one selected
                if (prev.length === 1) return prev;
                return prev.filter(c => c !== classification);
            } else {
                return [...prev, classification];
            }
        });
    };

    return (
        <div>
            <Navbar />
            <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
                <h1>Nation Wide Food Recall Alerts</h1>
                <p>Get recall information across the USA</p>
            </div>

            {/* control bar - classification filter, update time and date filter */}
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    {/* Classification filter checkboxes - left side */}
                    <div className="d-flex align-items-center">
                        <span className="me-3" style={{ fontSize: '1rem', fontWeight: '500' }}>Filter by:</span>
                        <div className="d-flex gap-3" role="group" aria-label="Classification filter">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="classI"
                                    checked={selectedClassifications.includes('Class I')}
                                    onChange={() => toggleClassification('Class I')}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label className="form-check-label" htmlFor="classI" style={{ cursor: 'pointer' }}>
                                    Class I
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="classII"
                                    checked={selectedClassifications.includes('Class II')}
                                    onChange={() => toggleClassification('Class II')}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label className="form-check-label" htmlFor="classII" style={{ cursor: 'pointer' }}>
                                    Class II
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="classIII"
                                    checked={selectedClassifications.includes('Class III')}
                                    onChange={() => toggleClassification('Class III')}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label className="form-check-label" htmlFor="classIII" style={{ cursor: 'pointer' }}>
                                    Class III
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right side - update time and date filter */}
                    <div className="d-flex align-items-center">
                        <div className="me-4">
                            <span style={{ fontSize: '1.1rem', color: '#6c757d' }}>
                                Last updated on <strong>{lastUpdated}</strong>
                            </span>
                        </div>
                        <div className="d-flex align-items-center">
                            <label htmlFor="dateFilter" className="me-2" style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                Display data from
                            </label>
                            <select 
                                id="dateFilter"
                                className="form-select" 
                                value={selectedDateRange}
                                onChange={handleDateRangeChange}
                                style={{ 
                                    width: '200px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '500'
                                }}
                            >
                                <option value="all">All Time</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="2weeks">Last 2 Weeks</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="3months">Last 3 Months</option>
                                <option value="6months">Last 6 Months</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error indicator */}
                {error && !loading && (
                    <div className="alert alert-danger mb-3" role="alert">
                        <small>⚠️ {error}</small>
                    </div>
                )}

                {/* recall data display area */}
                <div className="row g-4 pb-5">
                    {loading ? (
                        <div className="col-12">
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading recall data...</p>
                            </div>
                        </div>
                    ) : filteredRecalls.length > 0 ? (
                        filteredRecalls.map((recall) => (
                            <div key={recall.id} className="col-lg-4 col-md-6">
                                <div 
                                    className="card h-100 shadow-sm" 
                                    style={{ 
                                        backgroundColor: '#d1ecf1', 
                                        borderRadius: '15px',
                                        border: '2px solid #bee5eb'
                                    }}
                                >
                                    <div className="card-body d-flex flex-column">
                                        {/* Classification Badge at top */}
                                        <div className="text-center mb-3">
                                            <span 
                                                className="badge px-3 py-2" 
                                                style={{ 
                                                    backgroundColor: recall.classification === 'Class I' ? '#dc3545' : 
                                                                    recall.classification === 'Class II' ? '#fd7e14' : '#ffc107',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    color: 'white'
                                                }}
                                            >
                                                {recall.classification === 'Class I' ? '🚨 Class I - Dangerous' : 
                                                 recall.classification === 'Class II' ? '⚠️ Class II - Moderate Risk' : 
                                                 '⚡ Class III - Minor'}
                                            </span>
                                        </div>

                                        {/* Product name - truncated with tooltip */}
                                        <h5 
                                            className="card-title text-center mb-2" 
                                            style={{ fontWeight: 'bold', fontSize: '1.2rem' }}
                                            title={recall.productName}
                                        >
                                            {recall.productName && recall.productName.length > 60 
                                                ? `${recall.productName.substring(0, 60)}...` 
                                                : recall.productName}
                                        </h5>
                                        
                                        {/* brand name with info icon */}
                                        <div className="text-center mb-2 d-flex justify-content-center align-items-center">
                                            <p className="mb-0 me-2" style={{ fontStyle: 'italic', color: '#495057', fontSize: '0.95rem' }}>
                                                {recall.brand}
                                            </p>
                                            {/* Info Icon with hover tooltip */}
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <span 
                                                    style={{ 
                                                        fontSize: '1.3rem', 
                                                        cursor: 'pointer',
                                                        color: '#17a2b8',
                                                        fontWeight: 'bold'
                                                    }}
                                                    className="info-icon"
                                                >
                                                    ⓘ
                                                </span>
                                                {/* Hover tooltip */}
                                                <div 
                                                    className="hover-tooltip"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '30px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        backgroundColor: 'white',
                                                        border: '2px solid #dc3545',
                                                        borderRadius: '10px',
                                                        padding: '15px',
                                                        width: '320px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                        zIndex: 1000,
                                                        display: 'none',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <div className="mb-2">
                                                        <strong style={{ color: '#17a2b8' }}>📋 Full Product Info:</strong>
                                                        <p className="mb-0 mt-1" style={{ color: '#212529', fontSize: '0.8rem' }}>
                                                            {recall.productName}
                                                        </p>
                                                    </div>
                                                    <hr style={{ margin: '10px 0' }} />
                                                    <div>
                                                        <strong style={{ color: '#495057' }}>📦 Batch/Lot Info:</strong>
                                                        <p className="mb-0 mt-1" style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                                                            {recall.codeInfo}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr style={{ margin: '0.5rem 0', borderColor: '#17a2b8' }} />

                                        {/* detailed information */}
                                        <div className="mt-2" style={{ fontSize: '0.9rem' }}>

                                            <p className="mb-2" >
                                                <strong>Key reasons:</strong> {recall.reason}
                                            </p>
                                            
                                            
                                            <p className="mb-2">
                                                <strong>Report Date:</strong> {recall.reportDate}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Affected Areas:</strong> {recall.affectedAreas}
                                            </p>
                                            
                                            {/* Classification Badge
                                            <div className="mb-0 d-flex align-items-center">
                                                <strong className="me-2">Status</strong>
                                                <span 
                                                    className="badge rounded-pill px-3 py-1" 
                                                    style={{ 
                                                        backgroundColor: '#dc3545',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Unsafe
                                                </span>
                                            </div> */}

                                            {/* <p className="mb-0 mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                <strong>Key reasons:</strong> {recall.reason}
                                            </p> */}

                                            {/* UPC Codes */}
                                            {recall.upcs && recall.upcs.length > 0 ? (
                                                <p className="mb-2">
                                                    <strong>Product Code:</strong><br />
                                                    {recall.upcs.map((upc, index) => (
                                                        <span key={index} className="badge bg-secondary me-1 mt-1">
                                                            {upc}
                                                        </span>
                                                    ))}
                                                </p>
                                            ) : (
                                                <p className="mb-2">
                                                    <strong>Product Code:</strong> See batch info
                                                </p>
                                            )}

                                            {/* Source */}
                                            <p className="mb-0 mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                                <em>Source: {recall.source}</em>
                                            </p>
                                        </div>
                                    </div>

                                    
                                    
                                    <style>
                                        {`
                                            .info-icon:hover + .hover-tooltip,
                                            .hover-tooltip:hover {
                                                display: block !important;
                                            }
                                        `}
                                    </style>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <div className="alert alert-info text-center" role="alert">
                                <h4>No recalls found for the selected date range</h4>
                                <p>Try selecting a different time period</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecallPage;