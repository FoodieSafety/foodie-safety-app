import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import BarcodeScanner from './BarcodeScanner';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const HomePage = ({ user, isLoggedIn, onLogout }) => {
    const navigate = useNavigate();
    const [scannedProduct, setScannedProduct] = useState(null);

    return (
        <div>
            {/* Navbar */}
            <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} onShowLoginForm={() => window.location.href = '/login'} />

            {/* Hero Section */}
            <div className="hero-section text-center py-5" style={{ backgroundColor: isLoggedIn ? '#FFD700' : '#BDE3FF' }}>
                <div className="circle-icon d-flex justify-content-center align-items-center my-3 bg-light text-dark rounded-circle"
                    style={{ width: '75px', height: '75px' }}>
                    <strong>Foodie Safety</strong>
                </div>
                {isLoggedIn ? (
                    <>
                        <h1>Welcome Back, {user}!</h1>
                        <p>Your latest food safety updates at a glance.</p>
                        <button className="btn btn-light mt-3 px-4" onClick={() => navigate('/subscriptions')}>
                            Manage Subscriptions
                        </button>
                    </>
                ) : (
                    <>
                        <h1>Want to stay up-to-date on food recall and food <br /> safety information?</h1>
                        <p>Click below to subscribe now and Sign up for alerts and get the latest food safety news.</p>
                        <button className="btn btn-light mt-3 px-4" onClick={() => navigate('/newsletter')}>
                            Subscribe
                        </button>
                    </>
                )}
            </div>

            {/* Features Section */}
            {isLoggedIn ? (
                <div className="container text-center my-5">
                    <h3>Your Dashboard</h3>
                    <div className="row mt-4">
                        <div className="col-md-4">
                            <button className="btn btn-dark w-100" onClick={() => navigate('/my-products')}>View My Products</button>
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-dark w-100" onClick={() => navigate('/settings')}>Settings</button>
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-dark w-100" onClick={() => navigate('/recipes')}>Generate Recipes</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container text-center my-5">
                    <h3>Why Join Foodie Safety?</h3>
                    <p>Receive personalized alerts, track your food purchases, and stay ahead of food recalls.</p>
                </div>
            )}

            {/* Recall Statistics Section */}
            <div className="row text-center mt-4 bg-white py-5">
                {isLoggedIn ? (
                    <>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>📢 Recent Recall Alerts</h4>
                                <p>Check the latest recalls affecting your saved products.</p>
                                <button className="btn btn-warning" onClick={() => navigate('/recalls')}>View Recalls</button>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>🔍 Your Scan History</h4>
                                <p>See past scans and flagged items.</p>
                                <button className="btn btn-warning" onClick={() => navigate('/history')}>View History</button>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>💡 Personalized Tips</h4>
                                <p>Stay safe with food storage & handling recommendations.</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>🚨 8% Increase in Recalls (2023)</h4>
                                <p>
                                    In 2023, there was an <strong>8% increase</strong> in food and
                                    beverage recalls with recalls from the United States Department
                                    of Agriculture (USDA) relating to meat, poultry, and eggs.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>⚠️ FDA Recalls Hit 10-Year High</h4>
                                <p>
                                    According to the FDA, food recalls in 2022 reached a{' '}
                                    <strong>10-year high</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>🍽️ Foodborne Illness Impact</h4>
                                <p>
                                    CDC estimates <strong>48 million people</strong> get sick,{' '}
                                    <strong>128,000</strong> are hospitalized, and{' '}
                                    <strong>3,000</strong> die from foodborne diseases each year in
                                    the United States.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Show Barcode Scanner for Logged-in Users Only */}
            {isLoggedIn && (
                <div className="container text-center my-5">
                    <h3>Scan a Product Barcode</h3>
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
            )}
        </div>
    );
};

export default HomePage;