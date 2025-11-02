/**
 * Image Preprocessing Utility
 * Enhance barcode recognition using Canvas API
 */

export const preprocessImage = async (imageSrc, options = {}) => {
  const {
    grayscale = true,
    contrast = 1.5,
    brightness = 10,
    sharpen = true,
    binarize = false,
    threshold = 127,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        if (grayscale) applyGrayscale(data);
        if (contrast !== 1.0) applyContrast(data, contrast);
        if (brightness !== 0) applyBrightness(data, brightness);
        if (sharpen) applySharpen(imageData, canvas.width, canvas.height);
        if (binarize) applyBinarize(data, threshold);
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageSrc;
  });
};

const applyGrayscale = (data) => {
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
  }
};

const applyContrast = (data, factor) => {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(((data[i] - 128) * factor) + 128);
    data[i + 1] = clamp(((data[i + 1] - 128) * factor) + 128);
    data[i + 2] = clamp(((data[i + 2] - 128) * factor) + 128);
  }
};

const applyBrightness = (data, brightness) => {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + brightness);
    data[i + 1] = clamp(data[i + 1] + brightness);
    data[i + 2] = clamp(data[i + 2] + brightness);
  }
};

const applySharpen = (imageData, width, height) => {
  const data = imageData.data;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const tempData = new Uint8ClampedArray(data);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            sum += tempData[pixelIndex] * kernel[kernelIndex];
          }
        }
        data[(y * width + x) * 4 + c] = clamp(sum);
      }
    }
  }
};

const applyBinarize = (data, threshold) => {
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const binaryValue = gray > threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = binaryValue;
  }
};

const clamp = (value) => Math.min(255, Math.max(0, value));

export const PreprocessPresets = {
  BASIC: { grayscale: true, contrast: 1.5, brightness: 10, sharpen: false, binarize: false },
  STANDARD: { grayscale: true, contrast: 1.8, brightness: 15, sharpen: true, binarize: false },
  STRONG: { grayscale: true, contrast: 2.0, brightness: 20, sharpen: true, binarize: true, threshold: 127 },
  NONE: { grayscale: false, contrast: 1.0, brightness: 0, sharpen: false, binarize: false },
};

export const quickPreprocess = async (imageSrc) => {
  return preprocessImage(imageSrc, PreprocessPresets.STANDARD);
};

export const preprocessMultipleVersions = async (imageSrc) => {
  const versions = [
    { name: 'original', preset: PreprocessPresets.NONE },
    { name: 'standard', preset: PreprocessPresets.STANDARD },
    { name: 'strong', preset: PreprocessPresets.STRONG },
  ];

  const results = await Promise.all(
    versions.map(async (version) => {
      try {
        const processed = await preprocessImage(imageSrc, version.preset);
        return { name: version.name, image: processed };
      } catch (error) {
        return null;
      }
    })
  );

  return results.filter(r => r !== null);
};

export const smartPreprocess = async (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let brightness = 0;
        let variance = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          brightness += gray;
        }
        brightness /= (data.length / 4);
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          variance += Math.pow(gray - brightness, 2);
        }
        variance /= (data.length / 4);
        const contrast = Math.sqrt(variance);
        
        let preset, quality;
        if (contrast > 60 && brightness > 100 && brightness < 180) {
          preset = PreprocessPresets.BASIC;
          quality = 'HIGH';
        } else if (contrast < 30 || brightness < 80 || brightness > 200) {
          preset = PreprocessPresets.STRONG;
          quality = 'LOW';
        } else {
          preset = PreprocessPresets.STANDARD;
          quality = 'MEDIUM';
        }
        
        console.log(`[Image Quality] ${quality} detected (Brightness: ${brightness.toFixed(1)}, Contrast: ${contrast.toFixed(1)})`);
        
        const processed = await preprocessImage(imageSrc, preset);
        resolve({ image: processed, quality, preset });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
};

export const getNextQualityLevel = (currentPreset) => {
  if (currentPreset === PreprocessPresets.BASIC) return { preset: PreprocessPresets.STANDARD, level: 'STANDARD' };
  if (currentPreset === PreprocessPresets.STANDARD) return { preset: PreprocessPresets.STRONG, level: 'STRONG' };
  return null;
};

