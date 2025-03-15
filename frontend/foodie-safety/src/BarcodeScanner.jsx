import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "bootstrap/dist/css/bootstrap.min.css";

const BarcodeScanner = ({ onScanSuccess }) => {
    const [error, setError] = useState("");
    const [barcodeScanned, setBarcodeScanned] = useState(false);
    const [decodedText, setDecodedText] = useState("");
    const [submitClicked, setSubmitClicked] = useState(false);
    const [productInfo, setProductInfo] = useState(null);
    const [isRecalled, setIsRecalled] = useState(false);
    const [manualBarcode, setManualBarcode] = useState("");
    const [usingManualInput, setUsingManualInput] = useState(false);

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
                setProductInfo(null);
                setIsRecalled(false);
                setUsingManualInput(false);
            },
            (errorMessage) => {
                setError(errorMessage);
                setUsingManualInput(true);
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
                setProductInfo(data[0][0]);
                setIsRecalled(data.isRecalled);
                onScanSuccess(data);
                console.log(data);
            } else {
                setError("Product not found");
            }
        } catch (error) {
            setError(error.message || "Failed to fetch product information");
        }
    };

    const handleManualInputChange = (event) => {
        setManualBarcode(event.target.value);
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-lg p-4">
                <div className="card-body text-center">
                    {/* Display Scanner */}
                    <div className="mb-4">
                        <div id="reader" className="my-3 border border-secondary rounded"></div>
                    </div>

                    {/* Manual Barcode Input */}
                    {usingManualInput && (
                        <>
                            <div className="my-3">
                                <label htmlFor="manual-barcode">
                                    Your image didn't register properly, either upload again or enter the barcode number manually:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={manualBarcode}
                                    onChange={handleManualInputChange}
                                    placeholder="Enter barcode number"
                                />
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={() => handleSubmit(manualBarcode)}
                                    disabled={!manualBarcode}
                                >
                                    Submit
                                </button>
                            </div>
                        </>
                    )}

                    {/* Submit Button for Scanned Barcode */}
                    {!usingManualInput && barcodeScanned && (
                        <button className="btn btn-primary mt-2" onClick={() => handleSubmit(decodedText)}>
                            Submit
                        </button>
                    )}

                    {/* Error Handling */}
                    {submitClicked && error && <p className="text-danger mt-2">{String(error)}</p>}

                    {/* Display Product Info and Recall Status */}
                    {productInfo && (
                        <div className="mt-4">
                            <h4>Product Information</h4>
                            <p><strong>Name:</strong> {productInfo.name}</p>
                            <p><strong>Brand:</strong> {productInfo.brand}</p>
                            <p><strong>Nutritional Value:</strong> {productInfo.nutritionalValue}</p>
                            {isRecalled ? (
                                <p className="text-danger"><strong>⚠️ This product has been recalled!</strong></p>
                            ) : (
                                <p className="text-success"><strong>This product is safe to use.</strong></p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;