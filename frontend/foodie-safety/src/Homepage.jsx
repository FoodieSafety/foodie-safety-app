import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import LoginForm from './LoginForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const HomePage = ({ user }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (formData) => {
        console.log('User logged in with:', formData);
        setIsLoggedIn(true);
        setShowLoginForm(false);
      };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const showLoginFormHandler = () => {
        setShowLoginForm(true);
    };

    return (
        <div className="container-fluid p-0">
            {/* Navbar */}
            <Navbar
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                onShowLoginForm={showLoginFormHandler}
            />

            {/* Hero Section */}
            <div
                className="hero-section text-center py-5"
                style={{ backgroundColor: '#BDE3FF' }}
            >
                <div
                    className="circle-icon d-flex justify-content-center align-items-center my-3 mt-n3 bg-light text-dark rounded-circle"
                    style={{ width: '75px', height: '75px' }}
                >
                    <strong>Foodie Safety</strong>
                </div>
                {isLoggedIn ? (
                    <h1>Welcome, {user}</h1>
                ) : (
                    <div>
                        <h1>
                            Want to stay up-to-date on food recall and food <br />
                            safety information? Click below to subscribe now!
                        </h1>
                        <button className="btn btn-light mt-3 px-4">
                            Subscribe
                        </button>
                    </div>
                )}
            </div>

            {/* Login/Sign-Up Form */}
            {showLoginForm && !isLoggedIn && <LoginForm onLogin={(formData) => handleLogin(formData)} />}

            {/* Main Content Section */}
            {!showLoginForm && (
                <div className="row text-center mt-4 bg-white py-5">
                    {isLoggedIn ? (
                        <>
                            {/* Content for logged-in users */}
                            <div className="col-md-4 d-flex flex-column align-items-center">
                                <button className="btn btn-dark w-auto px-4 mb-3">
                                    Products
                                </button>
                                <div className="border border-dark p-3 text-center mb-3">
                                    <p>
                                        In 2023, there was an <strong>8% increase</strong> in food
                                        and beverage recalls with recalls from the United States Department of Agriculture (USDA) relating to meat, poultry, and eggs.
                                    </p>
                                </div>
                                <p className="text-muted">Text goes here</p>
                            </div>
                            <div className="col-md-4 d-flex flex-column align-items-center">
                                <button className="btn btn-dark w-auto px-4 mb-3">
                                    Settings
                                </button>
                                <div className="border border-dark p-3 text-center mb-3">
                                    <p>
                                        According to the FDA, food recalls in 2022 reached a{' '}
                                        <strong>10-year high</strong>.
                                    </p>
                                </div>
                                <p className="text-muted">Text goes here</p>
                            </div>
                            <div className="col-md-4 d-flex flex-column align-items-center">
                                <button className="btn btn-dark w-auto px-4 mb-3">
                                    Generate Recipes Using My Products
                                </button>
                                <div className="border border-dark p-3 text-center mb-3">
                                    <p>
                                        CDC estimates <strong>48 million people</strong> get sick,{' '}
                                        <strong>128,000</strong> are hospitalized, and{' '}
                                        <strong>3,000</strong> die from foodborne diseases each year in
                                        the United States.
                                    </p>
                                </div>
                                <p className="text-muted">Text goes here</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Content for non-logged-in users */}
                            <div className="col-md-4 d-flex flex-column align-items-center">
                                <div className="border border-dark p-3 text-center mb-3">
                                    <p>
                                        In 2023, there was an <strong>8% increase</strong> in food
                                        and beverage recalls with recalls from the United States Department of Agriculture (USDA) relating to meat, poultry, and eggs.
                                    </p>
                                </div>
                                <p className="text-muted">Text goes here</p>
                            </div>
                            <div className="col-md-4 d-flex flex-column align-items-center">
                                <div className="border border-dark p-3 text-center mb-3">
                                    <p>
                                        According to the FDA, food recalls in 2022 reached a{' '}
                                        <strong>10-year high</strong>.
                                    </p>
                                </div>
                                <p className="text-muted">Text goes here</p>
                            </div>
                            <div className="col-md-4 d-flex flex-column align-items-center">
                                <div className="border border-dark p-3 text-center mb-3">
                                    <p>
                                        CDC estimates <strong>48 million people</strong> get sick,{' '}
                                        <strong>128,000</strong> are hospitalized, and{' '}
                                        <strong>3,000</strong> die from foodborne diseases each year in
                                        the United States.
                                    </p>
                                </div>
                                <p className="text-muted">Text goes here</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default HomePage;