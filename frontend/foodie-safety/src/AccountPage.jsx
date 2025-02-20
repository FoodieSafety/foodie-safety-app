import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AccountPage = ({ isLoggedIn, onLogout }) => {
    const navigate = useNavigate();
    const [editProfile, setEditProfile] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        zipCode: '',
    });

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            setFormData({
                name: `${currentUser.FirstName} ${currentUser.LastName}`,
                email: currentUser.email,
                zipCode: currentUser.zipCode,
            });
        }

        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleProfileSave = () => {
        const updatedUser = {
            FirstName: formData.name.split(' ')[0],
            LastName: formData.name.split(' ')[1],
            email: formData.email,
            zipCode: formData.zipCode,
        };

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setEditProfile(false);
    };

    if (!isLoggedIn) return null;

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
                <h1>Account Settings</h1>
                <p>Your account settings and preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="container text-center my-5">
                <h3>Your Profile</h3>
                {!editProfile ? (
                    <div>
                        <p><strong>Name:</strong> {formData.name}</p>
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Zip Code:</strong> {formData.zipCode}</p>
                        <button className="btn btn-warning mt-3" onClick={() => setEditProfile(true)}>Edit Profile</button>
                    </div>
                ) : (
                    <div>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="zipCode" className="form-label">Zip Code</label>
                            <input
                                type="text"
                                className="form-control"
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                            />
                        </div>
                        <button className="btn btn-success mt-3" onClick={handleProfileSave}>Save Changes</button>
                    </div>
                )}
            </div>

            {/* Subscription Section */}
            <div className="container text-center my-5">
                <h3>Manage Subscriptions</h3>
                <p>Stay updated with food safety alerts and notifications based on your preferences.</p>
                <button className="btn btn-primary" onClick={() => navigate('/subscriptions')}>View & Manage Subscriptions</button>
            </div>

            {/* Change Password Section */}
            <div className="container text-center my-5">
                <h3>Change Password</h3>
                <button className="btn btn-info" onClick={() => navigate('/change-password')}>Change Password</button>
            </div>

            {/* Account Management Section */}
            <div className="container text-center my-5">
                <h3>Account Settings</h3>
                <button className="btn btn-danger" onClick={() => navigate('/deactivate-account')}>Deactivate Account</button>
            </div>

            {/* Logout Button */}
            <div className="container text-center my-5">
                <button className="btn btn-light" onClick={onLogout}>Log Out</button>
            </div>
        </div>
    );
};

export default AccountPage;