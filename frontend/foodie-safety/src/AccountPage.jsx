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
            <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />

            {/* Hero Section */}
            <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
                <h1>Your Account Profile</h1>
                <p>Manage your personal details here.</p>
            </div>

            {/* Profile Section */}
            <div className="container text-center my-5">
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
                            <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="zipCode" className="form-label">Zip Code</label>
                            <input type="text" className="form-control" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} />
                        </div>
                        <button className="btn btn-success mt-3" onClick={handleProfileSave}>Save Changes</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountPage;