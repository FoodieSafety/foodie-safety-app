import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, loading, login, access_token } = useAuth();

  const [editProfile, setEditProfile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    zipCode: '',
    password: '',
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else {
        setFormData({
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          zipCode: user.zip_code,
          password: user.password,
        });
      }
    }
  }, [loading, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSave = async () => {
    const updatedUser = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      zip_code: formData.zipCode,
      password: formData.password,
    };
  
    try {
      const response = await fetch('http://54.183.230.236:8000/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(updatedUser),
      });
  
      if (response.ok) {
        login(updatedUser, access_token);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setEditProfile(false);
        alert('Profile updated successfully');
      } else {
        const errorData = await response.json();
        alert('Update failed: ' + errorData.detail);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile');
    }
  };  

  if (loading) return null;

  return (
    <div>
      <Navbar />

      <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
        <h1>Your Account Profile</h1>
        <p>Manage your personal details here.</p>
      </div>

      <div className="container text-center my-5">
        {!editProfile ? (
          <div>
            <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Zip Code:</strong> {formData.zipCode}</p>
            <p><strong>Password:</strong> •••••••••</p>
            <button className="btn btn-warning mt-3" onClick={() => setEditProfile(true)}>Edit Profile</button>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input type="text" className="form-control" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input type="text" className="form-control" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="zipCode" className="form-label">Zip Code</label>
              <input type="text" className="form-control" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} />
            </div>
            <button className="btn btn-success mt-3" onClick={handleProfileSave}>Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;