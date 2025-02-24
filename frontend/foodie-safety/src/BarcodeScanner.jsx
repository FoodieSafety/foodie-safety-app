import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "bootstrap/dist/css/bootstrap.min.css";

const BarcodeScanner = ({ onScanSuccess }) => {
    const [error, setError] = useState("");

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            async (decodedText) => {
                console.log("Scanned barcode:", decodedText);

                try {
                    const formData = new FormData();
                    formData.append("barcode", decodedText);

                    const response = await fetch("http://127.0.0.1:8000/products", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();
                    if (response.ok) {
                        onScanSuccess(data);
                    } else {
                        setError("Product not found");
                    }
                } catch (error) {
                    setError(error.message || "Failed to fetch product information");
                }
            },
            (errorMessage) => {
                setError(errorMessage);
            }
        );

        return () => {
            scanner.clear();
        };
    }, [onScanSuccess]);

    return (
        <div className="container mt-4">
            <div className="card shadow-lg p-4">
                <div className="card-body text-center">
                    <h2 className="card-title mb-3">Scan or Upload a Barcode</h2>
                    <div id="reader" className="my-3 border border-secondary rounded"></div>
                    {error && <p className="text-danger mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;