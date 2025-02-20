import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "bootstrap/dist/css/bootstrap.min.css";

const BarcodeScanner = ({ onScan }) => {
    const scannerRef = useRef(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
                scanner.clear();
            },
            (errorMessage) => {
                setError(errorMessage);
            }
        );

        return () => {
            scanner.clear();
        };
    }, [onScan]);

    return (
        <div className="container mt-4">
            <div className="card shadow-lg p-4">
                <div className="card-body text-center">
                    <h2 className="card-title mb-3">Scan a Barcode</h2>
                    <div id="reader" className="my-3 border border-secondary rounded"></div>
                    {error && <p className="text-danger">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;