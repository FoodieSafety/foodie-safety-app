import React, { useState } from 'react';
import BarcodeScanner from './BarcodeScanner';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ScanProduct = ({ isLoggedIn, onLogout }) => {
    const [scannedProduct, setScannedProduct] = useState(null);

    return (
        <div>
            {/* Navbar */}
            <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} onShowLoginForm={() => window.location.href = '/login'} />
            {/* Hero Section */}
            <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
                <div className="circle-icon d-flex justify-content-center align-items-center my-3 bg-light text-dark rounded-circle"
                     style={{ width: '75px', height: '75px' }}>
                    <strong>Foodie Safety</strong>
                </div>
                <h1>Scan a Product Barcode</h1>
                <p className="lead">Quickly check your product's safety and recall status by scanning its barcode.</p>
            </div>

            <div className="container text-center my-5">
                <BarcodeScanner onScanSuccess={setScannedProduct} />
                {scannedProduct && (
                    <div className="mt-4 p-3 border rounded">
                        <h4>Product Information</h4>
                        <p><strong>Brand:</strong> {scannedProduct.brand}</p>
                        <p><strong>Barcode:</strong> {scannedProduct.code}</p>
                        <p><strong>Name:</strong> {scannedProduct.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanProduct;