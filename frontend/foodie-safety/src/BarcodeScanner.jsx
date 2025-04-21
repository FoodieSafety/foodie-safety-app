import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import PropTypes from 'prop-types';

const BarcodeScanner = ({ onScan }) => {
  const [error, setError] = useState("");
  const [barcodeScanned, setBarcodeScanned] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        if (typeof decodedText === 'string' && decodedText.trim()) {
          setBarcodeScanned(true);
          setError("");
          onScan(decodedText);
        } else {
          setError("Invalid barcode scanned. Please try again.");
        }
      },
      (errorMessage) => {
        setError(`Scanner error: ${errorMessage}`);
      }
    );

    return () => scanner.clear();
  }, [onScan]);

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="card-body text-center">
          {!barcodeScanned && <p>Please scan your barcode to continue</p>}
          <div id="reader" className="my-3 border border-secondary rounded"></div>
          {error && <p className="text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
};

BarcodeScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
};

export default BarcodeScanner;