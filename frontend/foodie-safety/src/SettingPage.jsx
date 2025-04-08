import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from './context/AuthContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    return (
        <div>
            <Navbar />

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

            {/* Account Management Section */}
            <div className="container text-center my-5">
                <h3>Deactivate Account</h3>
                <button className="btn btn-danger" onClick={() => navigate('/deactivate-account')}>Deactivate Account</button>
            </div>

            {/* Logout Button */}
            <div className="container text-center my-5">
                <button className="btn btn-light" onClick={logout}>Log Out</button>
            </div>
        </div>
    );
};

export default SettingsPage;