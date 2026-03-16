/**
 * Compress and resize image before upload
 * @param file - Original image file
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1920)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @param maxSizeMB - Maximum file size in MB (default: 100)
 * @returns Compressed File or original file if compression fails
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8,
  maxSizeMB: number = 100
): Promise<File> {
  // If file is already small enough, return as is
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format - use original type if supported, otherwise JPEG
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const outputType = supportedTypes.includes(file.type) ? file.type : 'image/jpeg';

        // PNG doesn't support quality parameter, so use 1.0 for PNG
        const outputQuality = outputType === 'image/png' ? 1.0 : quality;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // If compressed file is still too large, reduce quality further (only for JPEG/WebP)
            if (blob.size > maxSizeBytes && quality > 0.5 && outputType !== 'image/png') {
              canvas.toBlob(
                (smallerBlob) => {
                  if (!smallerBlob) {
                    resolve(new File([blob], file.name, { type: outputType }));
                    return;
                  }
                  resolve(new File([smallerBlob], file.name, { type: outputType }));
                },
                outputType,
                quality * 0.7 // Further reduce quality
              );
            } else {
              resolve(new File([blob], file.name, { type: outputType }));
            }
          },
          outputType,
          outputQuality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 100)
 * @returns Error message or null if valid
 */
export function validateImageFile(file: File, maxSizeMB: number = 100): string | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'File phải là hình ảnh';
  }
  
  // Check file size
  if (file.size > maxSizeBytes) {
    return `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`;
  }
  
  return null;
}
