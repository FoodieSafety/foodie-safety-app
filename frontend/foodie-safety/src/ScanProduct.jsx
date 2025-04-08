import React, { useState, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ScanProduct = () => {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const { access_token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
  }, [barcode]);

  const handleSubmit = async () => {
    if (!barcode) {
      setError("No barcode scanned.");
      return;
    }

    const storedProducts = JSON.parse(localStorage.getItem("scannedProducts")) || [];
    const alreadyScanned = storedProducts.some(product => product.code === barcode);

    if (alreadyScanned) {
      setError("This Product was already scanned.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("str_barcodes", barcode);

      const response = await fetch("http://localhost:8000/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Something went wrong");
      }

      const data = await response.json();

      const product = data[0][0];
      const productData = {
        name: product.name,
        brand: product.brand,
        code: barcode,
        recall: product.recall,
      };

      const storedProducts = JSON.parse(localStorage.getItem("scannedProducts")) || [];
      storedProducts.push(productData);
      localStorage.setItem("scannedProducts", JSON.stringify(storedProducts));

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

        {barcode && (
          <>
            <button className="btn btn-primary mt-2" onClick={handleSubmit}>
              Submit
            </button>
          </>
        )}

        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default ScanProduct;