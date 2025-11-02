import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import config from './config';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const DeactivatePage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { access_token, logout, authenticatedFetch } = useAuth();
  const navigate = useNavigate();

  const handleDeactivate = async () => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError('');

    try {
      const response = await authenticatedFetch(`${config.API_BASE_URL}/users`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        setSuccess(true);
        setError('');
        
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete account.');
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError(err.message || 'Something went wrong.');
      setSuccess(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container text-center my-5">
        <h2>Deactivate Account</h2>
        <p className="text-muted">Deleting your account is permanent and cannot be undone.</p>
        
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> Your account has been successfully deactivated. Redirecting...
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Failed to deactivate account! Please try again.</strong> {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        <button
          className="btn btn-danger"
          onClick={handleDeactivate}
          disabled={isDeleting || success}
        >
          {isDeleting ? 'Deleting...' : 'Deactivate My Account'}
        </button>
      </div>
    </div>
  );
};

export default DeactivatePage;