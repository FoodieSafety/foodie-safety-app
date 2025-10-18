import React, { useEffect, useRef, useState, useCallback } from "react";
import Quagga from "@ericblade/quagga2";
import PropTypes from 'prop-types';

const BarcodeScanner = ({ onScan }) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [scanMode, setScanMode] = useState("camera"); // "camera" or "image"
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isInitializingRef = useRef(false);

  // Use useCallback to memoize handleDetected function
  const handleDetected = useCallback((result) => {
    if (!result || !result.codeResult) return;
    
    const code = result.codeResult.code;
    
    // Validate barcode format (numeric and reasonable length)
    if (code && /^\d+$/.test(code) && code.length >= 8 && code.length <= 13) {
      console.log("Barcode detected:", code);
      setScanning(false);
      setError("");
      
      // Stop scanning
      try {
        Quagga.offDetected(handleDetected);
        Quagga.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      
      // Call callback function
      onScan(code);
    }
  }, [onScan]);

  useEffect(() => {
    // Only initialize scanner in camera mode
    if (scanMode !== "camera") return;
    
    // Prevent duplicate initialization
    if (isInitializingRef.current) return;
    
    let isInitialized = false;
    isInitializingRef.current = true;

    // Initialize QuaggaJS2 scanner
    const initScanner = async () => {
      // Make sure videoRef is available
      if (!videoRef.current) {
        console.error("Video container not ready");
        isInitializingRef.current = false;
        return;
      }

      try {
        await Quagga.init(
          {
            inputStream: {
              type: "LiveStream",
              target: videoRef.current,
              constraints: {
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
                facingMode: "environment", // Use rear camera
                aspectRatio: { min: 1, max: 2 }
              },
              area: { // Scan area
                top: "20%",
                right: "10%",
                left: "10%",
                bottom: "20%"
              }
            },
            locator: {
              patchSize: "medium",
              halfSample: true
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: {
              readers: [
                "ean_reader",      // EAN-13 (most common for food products)
                "ean_8_reader",    // EAN-8
                "upc_reader",      // UPC-A
                "upc_e_reader",    // UPC-E
                "code_128_reader", // Code 128
                "code_39_reader"   // Code 39
              ],
              debug: {
                drawBoundingBox: false,  // Disable to reduce console noise
                showFrequency: false,
                drawScanline: false,
                showPattern: false
              }
            },
            locate: true,
            frequency: 10
          },
          (err) => {
            if (err) {
              console.error("QuaggaJS initialization failed:", err);
              setError(`Scanner initialization failed: ${err.message || 'Please check camera permissions'}`);
              isInitializingRef.current = false;
              return;
            }
            console.log("QuaggaJS initialized successfully");
            isInitialized = true;
            Quagga.start();
            setScanning(true);
            setError("");
          }
        );

        // Listen for barcode detection events
        Quagga.onDetected(handleDetected);
      } catch (err) {
        console.error("Scanner startup error:", err);
        setError(`Unable to start scanner: ${err.message}`);
        isInitializingRef.current = false;
      }
    };

    initScanner();

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        clearTimeout(scannerRef.current);
      }
      
      // Only stop if initialized
      if (isInitialized) {
        try {
          Quagga.offDetected(handleDetected);
          Quagga.stop();
        } catch (err) {
          // Silently handle cleanup errors
        }
      }
      
      isInitializingRef.current = false;
    };
  }, [scanMode, handleDetected]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setSelectedImage(file);
    setError("");

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      // Automatically start recognition
      processImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Process barcode recognition from image
  const processImage = (imageSrc) => {
    setProcessing(true);
    setError("");

    Quagga.decodeSingle(
      {
        src: imageSrc,
        numOfWorkers: 0, // Image processing doesn't need multithreading
        inputStream: {
          size: 1280 // Processing size
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader",
            "code_128_reader",
            "code_39_reader"
          ]
        },
        locate: true,
        locator: {
          patchSize: "medium",
          halfSample: true
        }
      },
      (result) => {
        setProcessing(false);
        
        if (result && result.codeResult) {
          const code = result.codeResult.code;
          
          // Validate barcode format
          if (code && /^\d+$/.test(code) && code.length >= 8 && code.length <= 13) {
            console.log("Barcode detected in image:", code);
            setError("");
            onScan(code);
          } else {
            setError("Unable to recognize a valid barcode, please try another image");
          }
        } else {
          setError("No barcode detected in image. Please ensure:\n1. Image is clear\n2. Good lighting\n3. Barcode is fully visible");
        }
      }
    );
  };

  // Switch scanning mode
  const handleModeChange = useCallback((mode) => {
    // Stop camera if switching away from camera mode
    if (scanMode === "camera" && mode !== "camera") {
      try {
        Quagga.offDetected(handleDetected);
        Quagga.stop();
        isInitializingRef.current = false;
      } catch (err) {
        // Silently handle errors
      }
    }
    
    setScanMode(mode);
    setError("");
    setSelectedImage(null);
    setImagePreview(null);
    setScanning(mode === "camera");
  }, [scanMode, handleDetected]);

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="card-body text-center">
          {/* Mode selection buttons */}
          <div className="btn-group mb-4" role="group" aria-label="Scan mode">
            <button
              type="button"
              className={`btn ${scanMode === "camera" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleModeChange("camera")}
            >
              📹 Camera Scan
            </button>
            <button
              type="button"
              className={`btn ${scanMode === "image" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleModeChange("image")}
            >
              🖼️ Image Upload
            </button>
          </div>

          {/* Camera scanning mode */}
          {scanMode === "camera" && (
            <>
              {scanning && (
                <div className="alert alert-info" role="alert">
                  <strong>Point the barcode at the camera</strong>
                </div>
              )}
              
              {!scanning && (
                <div className="alert alert-success" role="alert">
                  <strong>✅ Barcode scanned successfully!</strong>
                </div>
              )}

              {/* Video preview container */}
              <div 
                ref={videoRef} 
                className="scanner-container my-3 border border-secondary rounded position-relative"
                style={{
                  maxWidth: '100%',
                  minHeight: '300px',
                  backgroundColor: '#000',
                  overflow: 'hidden'
                }}
              >
                {/* QuaggaJS will render video stream here */}
              </div>

              <div className="mt-3 text-muted small">
                <p className="mb-1">Tips:</p>
                <ul className="list-unstyled">
                  <li>Ensure adequate lighting</li>
                  <li>Keep barcode clearly visible</li>
                  <li>Adjust distance for optimal recognition</li>
                </ul>
              </div>
            </>
          )}

          {/* Image upload mode */}
          {scanMode === "image" && (
            <>
              <div className="alert alert-info" role="alert">
                <strong>🖼️ Upload an image containing a barcode</strong>
                <p className="mb-0 small mt-2">Supports JPG, PNG, WEBP and other common image formats</p>
              </div>

              {/* File upload area */}
              <div className="my-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="d-none"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="btn btn-lg btn-primary"
                  style={{ cursor: 'pointer' }}
                >
                  📁 Choose Image
                </label>
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="my-3">
                  <img
                    src={imagePreview}
                    alt="Uploaded image"
                    className="img-fluid border rounded"
                    style={{ maxHeight: '400px' }}
                  />
                  {processing && (
                    <div className="mt-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Processing...</span>
                      </div>
                      <p className="mt-2 text-muted">Recognizing barcode...</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 text-muted small">
                <p className="mb-1">💡 Tips:</p>
                <ul className="list-unstyled">
                  <li>Choose a clear barcode image</li>
                  <li>Ensure barcode is complete and unobstructed</li>
                  <li>Avoid glare and blur</li>
                </ul>
              </div>
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              <strong>Error:</strong> 
              <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
            </div>
          )}
        </div>
      </div>

      {/* Custom styles */}
      <style jsx="true">{`
        .scanner-container canvas,
        .scanner-container video {
          width: 100% !important;
          height: auto !important;
          max-width: 640px;
          margin: 0 auto;
          display: block;
        }
        
        .scanner-container canvas.drawingBuffer {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        @media (max-width: 768px) {
          .scanner-container {
            min-height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

BarcodeScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
};

export default BarcodeScanner;
