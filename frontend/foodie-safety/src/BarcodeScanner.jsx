import React, { useEffect, useRef, useState, useCallback } from "react";
import Quagga from "@ericblade/quagga2";
import { BrowserMultiFormatReader } from "@zxing/browser";
import PropTypes from 'prop-types';

const BarcodeScanner = ({ onScan }) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [scanMode, setScanMode] = useState("camera"); // "camera" or "image"
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // ============= Engine selection =============
  const [scanEngine, setScanEngine] = useState("quagga"); // "quagga" or "zxing"
  
  const quaggaVideoRef = useRef(null); // QuaggaJS uses a div container
  const zxingVideoRef = useRef(null); // ZXing uses a video element directly
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isInitializingRef = useRef(false);
  const zxingReaderRef = useRef(null); // ZXing reader instance

  // ============= QuaggaJS function=============
  const handleDetectedQuagga = useCallback((result) => {
    if (!result || !result.codeResult) return;
    
    const code = result.codeResult.code;
    
    // Validate barcode format (numeric and reasonable length)
    if (code && /^\d+$/.test(code) && code.length >= 8 && code.length <= 13) {
      console.log("[QuaggaJS] Barcode detected:", code);
      setScanning(false);
      setError("");
      
      // Stop scanning
      try {
        Quagga.offDetected(handleDetectedQuagga);
        Quagga.stop();
      } catch (err) {
        console.error("Error stopping QuaggaJS scanner:", err);
      }
      
      // Call callback function
      onScan(code);
    }
  }, [onScan]);

  const initQuaggaScanner = useCallback(async () => {
    if (!quaggaVideoRef.current) {
      console.error("QuaggaJS video container not ready");
      isInitializingRef.current = false;
      return;
    }

    try {
      await Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: quaggaVideoRef.current,
            constraints: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              facingMode: "environment",
              aspectRatio: { min: 1, max: 2 }
            },
            area: {
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
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
              "code_128_reader",
              "code_39_reader"
            ],
            debug: {
              drawBoundingBox: false,
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
            setError(`[QuaggaJS] Initialization failed: ${err.message || 'Please check camera permissions'}`);
            isInitializingRef.current = false;
            return;
          }
          console.log("[QuaggaJS] initialized successfully");
          Quagga.start();
          setScanning(true);
          setError("");
        }
      );

      Quagga.onDetected(handleDetectedQuagga);
    } catch (err) {
      console.error("QuaggaJS startup error:", err);
      setError(`[QuaggaJS] Startup failed: ${err.message}`);
      isInitializingRef.current = false;
    }
  }, [handleDetectedQuagga]);

  const stopQuaggaScanner = useCallback(() => {
    try {
      Quagga.offDetected(handleDetectedQuagga);
      Quagga.stop();
    } catch (err) {
      console.error("Error stopping QuaggaJS:", err);
    }
  }, [handleDetectedQuagga]);

  // ============= ZXing function=============
  const stopZXingScanner = useCallback(() => {
    try {
      if (zxingReaderRef.current) {
        zxingReaderRef.current.reset();
        zxingReaderRef.current = null;
      }
    } catch (err) {
      console.error("Error stopping ZXing:", err);
    }
  }, []);

  const initZXingScanner = useCallback(async () => {
    if (!zxingVideoRef.current) {
      console.error("ZXing video element not ready");
      isInitializingRef.current = false;
      return;
    }

    try {
      const codeReader = new BrowserMultiFormatReader();
      zxingReaderRef.current = codeReader;

      console.log("[ZXing] Starting video stream...");
      
      let hasScanned = false; // Prevent multiple scans
      
      await codeReader.decodeFromVideoDevice(
        undefined, // use default camera
        zxingVideoRef.current,
        (result, err) => {
          if (result && !hasScanned) {
            const code = result.getText();
            
            // Validate barcode format
            if (code && /^\d+$/.test(code) && code.length >= 8 && code.length <= 13) {
              console.log("[ZXing] Barcode detected:", code);
              hasScanned = true; // Mark as scanned
              setScanning(false);
              setError("");
              
              // Stop scanning asynchronously
              setTimeout(() => {
                stopZXingScanner();
              }, 100);
              
              onScan(code);
            }
          }
          
          if (err && err.name !== 'NotFoundException') {
            console.error("[ZXing] Decode error:", err);
          }
        }
      );

      setScanning(true);
      setError("");
      console.log("[ZXing] initialized successfully");
    } catch (err) {
      console.error("ZXing startup error:", err);
      setError(`[ZXing] Startup failed: ${err.message}`);
      isInitializingRef.current = false;
    }
  }, [onScan, stopZXingScanner]);

 
  useEffect(() => {
    // Only initialize scanner in camera mode
    if (scanMode !== "camera") return;
    
    // Prevent duplicate initialization
    if (isInitializingRef.current) return;
    
    let isInitialized = false;
    isInitializingRef.current = true;

    const initScanner = async () => {
      
      if (scanEngine === "quagga") {
        await initQuaggaScanner();
        isInitialized = true;
      } else if (scanEngine === "zxing") {
        await initZXingScanner();
        isInitialized = true;
      }
    };

    initScanner();

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        clearTimeout(scannerRef.current);
      }
      
      if (isInitialized) {
        if (scanEngine === "quagga") {
          stopQuaggaScanner();
        } else if (scanEngine === "zxing") {
          stopZXingScanner();
        }
      }
      
      isInitializingRef.current = false;
    };
  }, [scanMode, scanEngine, initQuaggaScanner, initZXingScanner, stopQuaggaScanner, stopZXingScanner]);

 
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setSelectedImage(file);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      processImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const processImage = (imageSrc) => {
    setProcessing(true);
    setError("");

    if (scanEngine === "quagga") {
      processImageWithQuagga(imageSrc);
    } else if (scanEngine === "zxing") {
      processImageWithZXing(imageSrc);
    }
  };

  const processImageWithQuagga = (imageSrc) => {
    Quagga.decodeSingle(
      {
        src: imageSrc,
        numOfWorkers: 0,
        inputStream: {
          size: 1280
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
          
          if (code && /^\d+$/.test(code) && code.length >= 8 && code.length <= 13) {
            console.log("[QuaggaJS] Barcode detected in image:", code);
            setError("");
            onScan(code);
          } else {
            setError("[QuaggaJS] Unable to recognize a valid barcode, please try another image");
          }
        } else {
          setError("[QuaggaJS] No barcode detected in image\nPlease ensure:\n1. Image is clear\n2. Good lighting\n3. Barcode is fully visible");
        }
      }
    );
  };

  // ZXing image recognition
  const processImageWithZXing = async (imageSrc) => {
    try {
      const codeReader = new BrowserMultiFormatReader();
      const img = new Image();
      
      img.onload = async () => {
        try {
          const result = await codeReader.decodeFromImageElement(img);
          const code = result.getText();
          
          setProcessing(false);
          
          if (code && /^\d+$/.test(code) && code.length >= 8 && code.length <= 13) {
            console.log("[ZXing] Barcode detected in image:", code);
            setError("");
            onScan(code);
          } else {
            setError("[ZXing] Unable to recognize a valid barcode, please try another image");
          }
        } catch (err) {
          setProcessing(false);
          console.error("[ZXing] Image decode error:", err);
          setError("[ZXing] No barcode detected in image\nPlease ensure:\n1. Image is clear\n2. Good lighting\n3. Barcode is fully visible");
        }
      };
      
      img.src = imageSrc;
    } catch (err) {
      setProcessing(false);
      console.error("[ZXing] Error processing image:", err);
      setError(`[ZXing] Error processing image: ${err.message}`);
    }
  };


  const handleModeChange = useCallback((mode) => {
    // Stop camera if switching away from camera mode
    if (scanMode === "camera" && mode !== "camera") {
      if (scanEngine === "quagga") {
        stopQuaggaScanner();
      } else if (scanEngine === "zxing") {
        stopZXingScanner();
      }
      isInitializingRef.current = false;
    }
    
    setScanMode(mode);
    setError("");
    setSelectedImage(null);
    setImagePreview(null);
    setScanning(mode === "camera");
  }, [scanMode, scanEngine, stopQuaggaScanner, stopZXingScanner]);

  const handleEngineChange = useCallback((engine) => {
    
    if (scanMode === "camera") {
      if (scanEngine === "quagga") {
        stopQuaggaScanner();
      } else if (scanEngine === "zxing") {
        stopZXingScanner();
      }
      isInitializingRef.current = false;
    }
    
    setScanEngine(engine);
    setError("");
    setScanning(scanMode === "camera");
  }, [scanMode, scanEngine, stopQuaggaScanner, stopZXingScanner]);

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <div className="card-body text-center">
          {/* ============= Engine selector ============= */}
          <div className="alert alert-info mb-3" role="alert">
            <strong>🔬 A/B Testing Mode</strong> - Compare barcode scanning engines
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Select Scanning Engine:</label>
            <div className="btn-group d-block" role="group" aria-label="Scan engine">
              <button
                type="button"
                className={`btn ${scanEngine === "quagga" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => handleEngineChange("quagga")}
              >
                QuaggaJS2
              </button>
              <button
                type="button"
                className={`btn ${scanEngine === "zxing" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => handleEngineChange("zxing")}
              >
                ZXing
              </button>
            </div>
            <small className="d-block mt-2 text-muted">
              Current engine: <strong>{scanEngine === "quagga" ? "QuaggaJS2" : "ZXing"}</strong>
            </small>
          </div>

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
                  <br/>
                  <small>Engine: {scanEngine === "quagga" ? "QuaggaJS2" : "ZXing"}</small>
                </div>
              )}
              
              {!scanning && (
                <div className="alert alert-success" role="alert">
                  <strong>✅ Barcode scanned successfully!</strong>
                  <br/>
                  <small>Using engine: {scanEngine === "quagga" ? "QuaggaJS2" : "ZXing"}</small>
                </div>
              )}

              {/* Video preview container */}
              <div className="scanner-container my-3 border border-secondary rounded position-relative"
                style={{
                  maxWidth: '100%',
                  minHeight: '300px',
                  backgroundColor: '#000',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {/* QuaggaJS container (div) */}
                {scanEngine === "quagga" && (
                  <div 
                    ref={quaggaVideoRef}
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
                
                {/* ZXing container (video element) */}
                {scanEngine === "zxing" && (
                  <video
                    ref={zxingVideoRef}
                    style={{
                      width: '100%',
                      maxWidth: '640px',
                      height: 'auto'
                    }}
                  />
                )}
              </div>

              <div className="mt-3 text-muted small">
                <p className="mb-1">💡 Tips:</p>
                <ul className="list-unstyled">
                  <li>✓ Ensure adequate lighting</li>
                  <li>✓ Keep barcode clearly visible</li>
                  <li>✓ Adjust distance for optimal recognition</li>
                  <li>✓ Try switching engines to compare results</li>
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
                <small>Current engine: {scanEngine === "quagga" ? "QuaggaJS2" : "ZXing"}</small>
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
                      <p className="mt-2 text-muted">
                        Recognizing barcode... (Using {scanEngine === "quagga" ? "QuaggaJS2" : "ZXing"})
                      </p>
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
                  <li>Try different engines to compare results</li>
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

        /* QuaggaJS creates its own video elements */
        .scanner-container > div > video {
          width: 100% !important;
          height: auto !important;
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
