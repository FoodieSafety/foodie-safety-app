import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const SettingsPage = ({ isLoggedIn, onLogout }) => {
    const navigate = useNavigate();

    if (!isLoggedIn) {
        navigate('/login');
        return null;
    }

    return (
        <div>
            <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />

            {/* Hero Section */}
            <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
                <h1>Settings</h1>
                <p>Manage your preferences and security settings.</p>
            </div>

            {/* Subscription Section */}
            <div className="container text-center my-5">
                <h3>Manage Subscriptions</h3>
                <p>Stay updated with food safety alerts and notifications.</p>
                <button className="btn btn-primary" onClick={() => navigate('/subscriptions')}>View & Manage Subscriptions</button>
            </div>

            {/* Change Password Section */}
            <div className="container text-center my-5">
                <h3>Change Password</h3>
                <button className="btn btn-info" onClick={() => navigate('/change-password')}>Change Password</button>
            </div>

            {/* Account Management Section */}
            <div className="container text-center my-5">
                <h3>Deactivate Account</h3>
                <button className="btn btn-danger" onClick={() => navigate('/deactivate-account')}>Deactivate Account</button>
            </div>

            {/* Logout Button */}
            <div className="container text-center my-5">
                <button className="btn btn-light" onClick={onLogout}>Log Out</button>
            </div>
        </div>
    );
};

export default SettingsPage;