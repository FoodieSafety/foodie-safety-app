import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from './context/AuthContext';
import { getRandomTip } from './utils/foodFacts';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const randomTip = React.useMemo(() => getRandomTip(), []);
    
    return (
        <div>
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <div className="hero-section py-5" style={{ backgroundColor: isLoggedIn ? '#FFD700' : '#BDE3FF' }}>
                <div className="container text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10">
                            {isLoggedIn ? (
                                <>
                                    <h1 className="display-5 fw-bold">Welcome Back, {user?.first_name}!</h1>
                                    <p className="lead">Your latest food safety updates at a glance.</p>
                                    <button className="btn btn-dark btn-md mt-4 px-5" onClick={() => navigate('/subscriptions')}>
                                        Manage My Safety Alerts
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h1 className="display-5 fw-bold">Want to stay in the loop on food recalls and safety news?</h1>
                                    <p className="lead">Subscribe now to get alerts and updates straight to your inbox.</p>
                                    <button className="btn btn-light btn-lg mt-4 px-5" onClick={() => navigate('/newsletter')}>
                                        Join the Alert List
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* Features Section */}
            {isLoggedIn ? (
                <div className="container text-center my-5">
                    <h3>Your Dashboard</h3>
                    <div className="row mt-4">
                        <div className="col-md-4">
                            <button className="btn btn-dark w-100" onClick={() => navigate('/my-products')}>View My Pantry</button>
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-dark w-100" onClick={() => navigate('/scan')}>Scan a Product</button>
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-dark w-100" onClick={() => navigate('/recipes')}>Find Safe Recipes</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container text-center my-5">
                    <h3>Why Join Foodie Safety?</h3>
                    <p>Stay informed with tailored food safety alerts and protect your pantry.</p>
                </div>
            )}

            {/* Recall Statistics Section */}
            <div className="row text-center mt-4 bg-white py-5">
                {isLoggedIn ? (
                    <>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>📢 Latest Food Recall Alerts</h4>
                                <p>Stay informed about the latest food recalls happening nationwide.</p>
                                <button className="btn btn-warning" onClick={() => navigate('/recalls')}>View Recalls</button>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>🔍 Past Scans</h4>
                                <p>See food items you have scanned in the past.</p>
                                <button className="btn btn-warning" onClick={() => navigate('/history')}>View History</button>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border border-dark p-3">
                                <h4>💡 Safety Tips Just for You</h4>
                                <p>{randomTip}</p>
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
        </div>
    );
};

export default HomePage;