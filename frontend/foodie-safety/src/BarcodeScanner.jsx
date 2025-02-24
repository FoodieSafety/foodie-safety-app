import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "bootstrap/dist/css/bootstrap.min.css";

const BarcodeScanner = ({ onScanSuccess }) => {
    const [error, setError] = useState("");
    const [barcodeScanned, setBarcodeScanned] = useState(false);
    const [decodedText, setDecodedText] = useState("");
    const [submitClicked, setSubmitClicked] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            async (decodedText) => {
                console.log("Scanned barcode:", decodedText);
                setBarcodeScanned(true);
                setDecodedText(decodedText);
                setError("");
            },
            (errorMessage) => {
                setError(errorMessage);
            }
        );

        return () => {
            scanner.clear();
        };
    }, [onScanSuccess]);

    const handleSubmit = async () => {
        setSubmitClicked(true);
        try {
            const formData = new FormData();
            formData.append("str_barcodes", decodedText);

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
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-lg p-4">
                <div className="card-body text-center">
                    <h2 className="card-title mb-3">Scan or Upload a Barcode</h2>
                    <div id="reader" className="my-3 border border-secondary rounded"></div>
                    {barcodeScanned && (
                        <button className="btn btn-primary mt-2" onClick={handleSubmit}>
                            Submit
                        </button>
                    )}
                    {submitClicked && error && <p className="text-danger mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;