import React, { useState, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import config from './config';

const ScanProduct = () => {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const { user, access_token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
  }, [barcode]);

  const handleSubmit = async () => {
    if (!barcode) {
      setError("No barcode scanned.");
      return;
    }

    try {
      const normalizedBarcode =
        barcode.length === 12 && !barcode.startsWith('0') ? '0' + barcode : barcode;
      const formData = new FormData();
      formData.append("str_barcodes", normalizedBarcode);

      const response = await fetch(`${config.API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errDetail = data?.detail || `Error ${data?.status_code}: Product not found for barcode ${data?.code || normalizedBarcode}.`;
        throw new Error(errDetail);
      }

      const product = data?.[0]?.[0];
      const resultInfo = data?.[1]?.[0];

      if (!product || resultInfo?.status_code === 404) {
        throw new Error(`Product not found for barcode ${resultInfo?.code || normalizedBarcode}.`);
      }

      const newScannedProduct = {
        name: product.name,
        brand: product.brand,
        code: normalizedBarcode,
        recall: product.recall,
        scannedAt: new Date().toISOString(),
      };

      const userKey = `scannedProducts_${user?.email || 'guest'}`;
      const storedProducts = JSON.parse(localStorage.getItem(userKey)) || [];
      const updatedProducts = storedProducts.filter(p => p.code !== normalizedBarcode);

      updatedProducts.push(newScannedProduct);
      localStorage.setItem(userKey, JSON.stringify(updatedProducts));

      navigate('/my-products');
    } catch (err) {
      setError(err.message || "Failed to upload product");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
        <h1>Scan a Product Barcode</h1>
        <p className="lead">Quickly check your product's safety and recall status by scanning its barcode.</p>
      </div>

      <div className="container text-center my-5">
        <BarcodeScanner onScan={setBarcode} />

        <div className="mt-3">
          <p>Or enter the barcode manually:</p>
          <input
            type="text"
            className="form-control w-50 mx-auto"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode manually"
          />
        </div>

        {barcode && (
          <button className="btn btn-primary mt-2" onClick={handleSubmit}>
            Submit
          </button>
        )}

        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default ScanProduct;