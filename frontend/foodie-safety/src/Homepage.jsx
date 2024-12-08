import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const HomePage = ({ user }) => {
    {/* To track the login state */ }
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div className="container-fluid p-0">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    {/* Navbar Brand */}
                    <a className="navbar-brand" href="#">
                        Foodie Safety
                    </a>

                    {/* Hamburger Menu */}
                    <button
                        className="navbar-toggler ms-auto"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Collapsible Content */}
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#">
                                    Home
                                </a>
                            </li>
                            {isLoggedIn ? (
                                <>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#">
                                            Food Recalls
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#">
                                            Account
                                        </a>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="#"
                                        onClick={() => setIsLoggedIn(true)}
                                    >
                                        Login
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

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
                        <button
                            className="btn btn-light mt-3 px-4"
                            onClick={() => setIsLoggedIn(true)}
                        >
                            Subscribe
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Section */}
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
                                    In 2023, there was an <strong>8% increase</strong> in food and
                                    beverage recalls with recalls from the United States Department of Agriculture (USDA) relating to meat, poultry, and eggs.
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
                            <button className="btn btn-dark w-auto px-4 mb-3">
                                Generate Recipes Using My Products
                            </button>
                        </div>
                        <div className="col-md-4 d-flex flex-column align-items-center">
                            <button className="btn btn-dark w-auto px-4 mb-3">
                                Settings
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
                                    In 2023, there was an <strong>8% increase</strong> in food and
                                    beverage recalls with recalls from the United States Department of Agriculture (USDA) relating to meat, poultry, and eggs.
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
        </div>
    );
};

export default HomePage;
