import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const History = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scannedHistory, setScannedHistory] = useState([]);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      setAuthError('You must be logged in to view your scan history');
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setAuthError('');
    const userKey = `scannedProducts_${user?.email || 'guest'}`;
    const savedScannedHistory = JSON.parse(localStorage.getItem(userKey)) || [];

    const validHistory = savedScannedHistory.filter(product =>
      product.code && product.name && product.scannedAt
    );

    setScannedHistory(validHistory);
  }, [loading, user, navigate]);

  if (loading) return null;

  return (
    <div>
      <Navbar />
      <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
        <h1>Scan History</h1>
        <p className="lead">View a list of previously scanned products.</p>
      </div>

      <div className="container my-5">
        <h3 className="text-center">Your Scanned Products</h3>

        {/* Authentication Error Alert */}
        {authError && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Access Denied!</strong> {authError} Redirecting to login page...
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setAuthError('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {scannedHistory.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered table-striped mt-4">
              <thead className="table-dark">
                <tr>
                  <th>Barcode</th>
                  <th>Product Name</th>
                  <th>Date Scanned</th>
                </tr>
              </thead>
              <tbody>
                {scannedHistory.map((product, index) => (
                  <tr key={index}>
                    <td>{product.code}</td>
                    <td>{product.name}</td>
                    <td>{new Date(product.scannedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center mt-4">No scanned products yet.</p>
        )}
      </div>
    </div>
  );
};

export default History;