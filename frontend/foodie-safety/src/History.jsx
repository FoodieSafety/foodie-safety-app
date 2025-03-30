import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const History = ({ isLoggedIn, onLogout }) => {
    const [scannedHistory, setScannedHistory] = useState([]);

    useEffect(() => {
        const savedScannedHistory = JSON.parse(localStorage.getItem('scannedProducts')) || [];
        setScannedHistory(savedScannedHistory);
    }, []);

    return (
        <div>
            <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
            <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
                <h1>Scan History</h1>
                <p className="lead">View a list of previously scanned products.</p>
            </div>

            <div className="container my-5">
                <h3 className="text-center">Your Scanned Products</h3>
                {scannedHistory.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped mt-4">
                            <thead className="table-dark">
                                <tr>
                                    <th>Barcode</th>
                                    <th>Date Scanned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scannedHistory.map((barcode, index) => (
                                    <tr key={index}>
                                        <td>{barcode}</td>
                                        <td>{new Date().toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center mt-4">No scanned products yet.</p>
                )}
            </div>
        </div>
    );
};

export default History;