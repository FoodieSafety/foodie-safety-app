import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const RecallPage = () => {
    //fake data for now - based on real backend data structure
    const mockRecallsData = [
        {
            id: "51fdd3046a8bd3e73a1280dd07d895f02be1ba0f5620e431401481a0dd9bd349",
            productName: "Wegmans Large Ultimate Strawberry Topped Cheesecake",
            brand: "Wegmans Food Markets, Inc.",
            classification: "Class I",
            reportDate: "2025-10-29",
            affectedAreas: "VA, MD, NC, D.C.",
            reason: "Contains undeclared pecans",
            codeInfo: "Item #51474 Sell By 9/24 - 10/01 Purchased between 9/19 and 9/26 UPC Codes: 0-77890-51474-0 OR 051474-XXXXX",
            upcs: ["077890514740"],
            quantity: "521 units (total of all products)",
            source: "OpenFDA"
        },
        {
            id: "461531bb777be516670138378ea1d366e749ee343df86b8295f3f42cd80c7af7",
            productName: "Free Range Grade AA Large Brown Eggs, Loose Pack in Boxes",
            brand: "Black Sheep Egg Company, LLC",
            classification: "Class I",
            reportDate: "2025-10-22",
            affectedAreas: "AR, MO, MS, TX, CA, IN",
            reason: "Potential Salmonella contamination",
            codeInfo: "Julian Date 190 Best By: 8/22/2025 through Julian Date 260 Best By: 10/31/2025",
            upcs: [],
            quantity: "20,625 dozen",
            source: "OpenFDA"
        },
        {
            id: "d1514cbaa83df3379b452fee19a3eb7c8efa6a38cd089f559f16304208a15535",
            productName: "Cut Fresh Fruit Mix (Contains: Cantaloupe, Honeydew, and Red Grapes)",
            brand: "Wholesale Produce Supply LLC",
            classification: "Class I",
            reportDate: "2025-10-22",
            affectedAreas: "IA, IL, ND, NE, WI",
            reason: "Potential Listeria monocytogenes contamination",
            codeInfo: "Lot Number: X0924913, X0925463, X0924882, X0924924, X0925462 Expiration 10/4/2025",
            upcs: ["0702530057323", "790629118216", "790629080070"],
            quantity: "307 total cases/pails recalled",
            source: "OpenFDA"
        },
        {
            id: "d34ef04aa2727900e66566a6f310fb42a584de8084c6b5e24d29fcb549b617d7",
            productName: "Organic BABY Bedtime Drops - Sleep + Immunity Blend",
            brand: "M.O.M Enterprises, LLC",
            classification: "Class II",
            reportDate: "2025-10-15",
            affectedAreas: "AL, AR, AZ, CA, CO, CT, DE, FL, GA, IA, IL, IN, KS, KY, LA, MI, MN, MO, MS, NC, ND, NH, NJ, NY, OH, OR, PA, SC, TN, TX, UT, VA, WI",
            reason: "Potential yeast contamination",
            codeInfo: "Lot code: 25100, 25148, 25155 UPC: 679234051814 EXP 04/2027, 05/2027, 06/2027",
            upcs: ["679234051814"],
            quantity: "46,752 units/bottles",
            source: "OpenFDA"
        },
        {
            id: "abc123def456",
            productName: "Organic Almond Butter",
            brand: "Healthy Choice Foods",
            classification: "Class I",
            reportDate: "2025-10-10",
            affectedAreas: "Nationwide",
            reason: "Possible Salmonella contamination",
            codeInfo: "Best By dates: 08/15/2025 through 11/30/2025",
            upcs: ["098765432111"],
            quantity: "15,000 jars",
            source: "OpenFDA"
        },
        {
            id: "xyz789ghi012",
            productName: "Ground Beef Patties, 80% Lean",
            brand: "Prime Meats Inc.",
            classification: "Class I",
            reportDate: "2025-10-08",
            affectedAreas: "TX, OK, LA, AR",
            reason: "Possible E. coli O157:H7 contamination",
            codeInfo: "Production dates: 09/15/2025 - 09/22/2025. EST. 1234M",
            upcs: ["789123456789"],
            quantity: "48,000 lbs",
            source: "OpenFDA"
        },
        {
            id: "mno345pqr678",
            productName: "Frozen Mixed Berry Blend",
            brand: "Berry Best Farms",
            classification: "Class II",
            reportDate: "2025-09-28",
            affectedAreas: "CA, OR, WA, NV, AZ",
            reason: "Potential Hepatitis A contamination",
            codeInfo: "Product Code: BB2025-09, Best By: 09/2026",
            upcs: ["456789123456", "456789123457"],
            quantity: "8,500 bags",
            source: "OpenFDA"
        },
        {
            id: "stu901vwx234",
            productName: "Organic Baby Spinach",
            brand: "Green Valley Organics",
            classification: "Class I",
            reportDate: "2025-09-25",
            affectedAreas: "Nationwide",
            reason: "Possible Listeria monocytogenes contamination",
            codeInfo: "Best if Used By dates from 09/20/2025 to 10/05/2025",
            upcs: ["321654987321"],
            quantity: "12,000 packages",
            source: "OpenFDA"
        },
        {
            id: "jkl567mno890",
            productName: "Chocolate Chip Cookie Dough Ice Cream",
            brand: "Sweet Dreams Creamery",
            classification: "Class II",
            reportDate: "2025-09-20",
            affectedAreas: "NY, NJ, PA, CT, MA",
            reason: "Undeclared tree nuts (walnuts)",
            codeInfo: "Lot Numbers: SD20250915, SD20250916, SD20250917",
            upcs: ["654987321654"],
            quantity: "3,200 pints",
            source: "OpenFDA"
        }
    ];

    const [recalls, setRecalls] = useState(mockRecallsData);
    const [filteredRecalls, setFilteredRecalls] = useState(mockRecallsData);
    const [selectedDateRange, setSelectedDateRange] = useState('all');
    const [lastUpdated, setLastUpdated] = useState('10/29/2025');

    // date filter function
    useEffect(() => {
        filterRecallsByDate(selectedDateRange);
    }, [selectedDateRange]);

    const filterRecallsByDate = (range) => {
        const today = new Date('2025-10-29'); // fake current date
        let filtered = [...recalls];

        if (range !== 'all') {
            filtered = recalls.filter(recall => {
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

        // sort by date in descending order (latest first)
        filtered.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
        setFilteredRecalls(filtered);
    };

    const handleDateRangeChange = (e) => {
        setSelectedDateRange(e.target.value);
    };

    return (
        <div>
            <Navbar />
            <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
                <h1>Nation Wide Food Recall Alerts</h1>
                <p>Get recall information across the USA</p>
            </div>

            {/* control bar - update time and date filter */}
            <div className="container mt-4">
                <div className="d-flex justify-content-end align-items-center mb-4">
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

                {/* recall data display area */}
                <div className="row g-4 pb-5">
                    {filteredRecalls.length > 0 ? (
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

                                        {/* Product name */}
                                        <h5 className="card-title text-center mb-2" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                            {recall.productName}
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
                                                    {/* <div className="mb-2">
                                                        <strong style={{ color: '#dc3545' }}>⚠️ Key Reasons:</strong>
                                                        <p className="mb-0 mt-1" style={{ color: '#212529' }}>{recall.reason}</p>
                                                    </div> */}
                                                    {/* <hr style={{ margin: '10px 0' }} /> */}
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