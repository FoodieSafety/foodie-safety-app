import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from './context/AuthContext';
import config from './config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, loading, login, access_token, authenticatedFetch } = useAuth();

  const [editProfile, setEditProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
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
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          zipCode: user.zip_code || '',
          password: user.password || '',
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
      const response = await authenticatedFetch(`${config.API_BASE_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        login(access_token);
        setEditProfile(false);
        setUpdateSuccess('Profile updated successfully');
        setUpdateError('');
        
        // 3 seconds later, auto hide success message
        setTimeout(() => {
          setUpdateSuccess('');
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData.detail);
        setUpdateError(errorData.detail || 'Update failed. Please check your information and try again.');
        setUpdateSuccess('');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('An error occurred while updating the profile. Please retry.');
      setUpdateSuccess('');
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
        {/* Update Success Alert */}
        {updateSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> {updateSuccess}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setUpdateSuccess('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Update Error Alert */}
        {updateError && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Update Failed!</strong> {updateError}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setUpdateError('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {!editProfile ? (
          <div>
            <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Zip Code:</strong> {formData.zipCode}</p>
            <p><strong>Password:</strong> •••••••••</p>
            <button className="btn btn-warning mt-3" onClick={() => setEditProfile(true)}>Edit Profile</button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProfileSave();
            }}
          >
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input type="text" className="form-control" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} autoComplete="given-name" />
            </div>
            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input type="text" className="form-control" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} autoComplete="family-name" />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" />
            </div>
            <div className="mb-3">
              <label htmlFor="zipCode" className="form-label">Zip Code</label>
              <input type="text" className="form-control" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} autoComplete="postal-code" />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-success mt-3">Save Changes</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountPage;