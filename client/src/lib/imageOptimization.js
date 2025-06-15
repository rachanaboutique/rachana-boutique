// Client-side image optimization utility that mimics the backend Sharp processing
// This provides the same optimization logic as the backend but runs in the browser

/**
 * Supported input formats (same as backend)
 */
const SUPPORTED_INPUT_FORMATS = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
  'image/webp', 'image/avif', 'image/tiff', 'image/bmp',
  'image/svg+xml', 'image/heic', 'image/heif'
];

/**
 * Maximum file size (same as backend)
 */
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * Get optimal format configuration based on input mimetype
 * Mirrors the backend logic exactly
 */
const getOptimalFormat = (inputMimetype) => {
  // For animations (GIF), preserve as WebP to maintain animation
  if (inputMimetype === 'image/gif') {
    return { format: 'webp', quality: 90, animated: true };
  }
  
  // For vector graphics, convert to PNG to maintain quality
  if (inputMimetype === 'image/svg+xml') {
    return { format: 'png', quality: 90 };
  }

  // For photos, use WebP for best browser compatibility (AVIF not widely supported in canvas)
  return { format: 'webp', quality: 90 };
};

/**
 * Resize and optimize image using Canvas API
 * This mimics the Sharp processing logic from the backend
 */
const processImageWithCanvas = async (file) => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type || !SUPPORTED_INPUT_FORMATS.includes(file.type.toLowerCase())) {
      reject(new Error(`Unsupported file format: ${file.type || 'unknown'}`));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File too large: ${file.size} bytes. Maximum allowed: ${MAX_FILE_SIZE} bytes`));
      return;
    }

    const formatConfig = getOptimalFormat(file.type);
    
    // Create image element
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate dimensions (same logic as Sharp resize)
        const maxDimension = 1024;
        let { width, height } = img;
        
        // Maintain aspect ratio and don't upscale smaller images
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized format
        const outputFormat = formatConfig.format === 'webp' ? 'image/webp' : 
                           formatConfig.format === 'png' ? 'image/png' : 'image/jpeg';
        
        const quality = formatConfig.quality / 100; // Canvas expects 0-1 range

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          outputFormat,
          quality
        );
      } catch (error) {
        reject(new Error(`Canvas processing failed: ${error.message}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Process image with fallback logic (same as backend)
 */
export const optimizeImageForUpload = async (file) => {
  try {
    // First try with optimal format
    const optimizedBlob = await processImageWithCanvas(file);
    return optimizedBlob;
  } catch (error) {
    console.warn(`Failed to process with optimal format, falling back to JPEG:`, error.message);
    
    // Fallback to JPEG (same as backend fallback logic)
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Simple resize to 1024px max dimension
          const maxDimension = 1024;
          let { width, height } = img;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Fallback processing failed'));
              }
            },
            'image/jpeg',
            0.9 // 90% quality
          );
        } catch (fallbackError) {
          reject(new Error(`Fallback processing failed: ${fallbackError.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for fallback processing'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
};

/**
 * Validate if file is a supported image format
 */
export const isValidImageFile = (file) => {
  return file && file.type && SUPPORTED_INPUT_FORMATS.includes(file.type.toLowerCase());
};

/**
 * Check if file size is within limits
 */
export const isValidFileSize = (file) => {
  return file && file.size <= MAX_FILE_SIZE;
};
