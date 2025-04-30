import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const DeactivatePage = () => {
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { access_token, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeactivate = async () => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/users', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.status === 204) {
        logout();
        navigate('/');
        alert('Your account has been successfully deactivated.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete account.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
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
        <button
          className="btn btn-danger"
          onClick={handleDeactivate}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Deactivate My Account'}
        </button>
        {error && <p className="text-danger mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default DeactivatePage;