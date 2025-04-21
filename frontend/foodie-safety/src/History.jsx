import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const History = () => {
  const { user, loading } = useAuth();
  const [scannedHistory, setScannedHistory] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      alert('You must be logged in to view your scan history');
      return;
    }

    const savedScannedHistory = JSON.parse(localStorage.getItem('scannedProducts')) || [];

    const validHistory = savedScannedHistory.filter(product =>
      product.code && product.name && product.scannedAt
    );

    setScannedHistory(validHistory);
  }, [loading, user]);

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