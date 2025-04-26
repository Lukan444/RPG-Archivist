import React, { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';

interface ImageUploaderProps {
  entityType: string;
  entityName?: string;
  imageUrl?: string;
  // Updated to support both string and File parameters
  onImageUpload?: ((imageUrl: string) => void) | ((file: File) => Promise<string>);
  onImageGenerate?: (prompt: string) => Promise<string>;
  onImageDelete?: () => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  entityType,
  entityName,
  imageUrl: initialImageUrl,
  onImageUpload,
  onImageGenerate,
  onImageDelete,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`);
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // This is a placeholder for actual API call
      // In a real implementation, you would upload the file to your server
      console.log(`Uploading image for ${entityType} with name: ${entityName || 'unnamed'}`);

      // Call the onImageUpload handler with the appropriate parameter
      if (onImageUpload) {
        // Check if the function expects a File or a string
        if (selectedFile) {
          // If the function expects a File, pass the File object
          try {
            // Try to call with File parameter first (Promise<string> return type)
            const uploadFunction = onImageUpload as (file: File) => Promise<string>;
            const resultUrl = await uploadFunction(selectedFile);
            // If successful, update the preview URL
            if (resultUrl) {
              setPreviewUrl(resultUrl);
            }
          } catch (error) {
            // If that fails, try with string parameter
            const imageUrl = croppedImageUrl || previewUrl;
            if (imageUrl) {
              const stringUploadFunction = onImageUpload as (imageUrl: string) => void;
              stringUploadFunction(imageUrl);
            }
          }
        } else {
          // If no file is selected but we have a URL, use that
          const imageUrl = croppedImageUrl || previewUrl;
          if (imageUrl) {
            const stringUploadFunction = onImageUpload as (imageUrl: string) => void;
            stringUploadFunction(imageUrl);
          }
        }
      }

      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setCroppedImageUrl(null);
      setShowCropper(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    setCroppedImageUrl(croppedUrl);
    setShowCropper(false);
  };

  return (
    <div className="image-uploader" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
      {initialImageUrl && (
        <div className="current-image-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src={initialImageUrl}
            alt="Current image"
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
          />
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={onImageDelete}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              disabled={isUploading}
            >
              Delete Image
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          disabled={isUploading}
          ref={fileInputRef}
          style={{ marginBottom: '10px' }}
        />
        <p style={{ fontSize: '0.8rem', color: '#666' }}>
          Max size: {maxSizeMB}MB. Allowed types: {allowedTypes.map(type => type.replace('image/', '')).join(', ')}
        </p>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {previewUrl && !showCropper && !croppedImageUrl && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h4>Preview</h4>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', marginBottom: '10px' }}
          />
          <div>
            <button
              onClick={() => setShowCropper(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              disabled={isUploading}
            >
              Crop Image
            </button>
          </div>
        </div>
      )}

      {showCropper && previewUrl && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Crop Image</h4>
          <ImageCropper
            imageUrl={previewUrl}
            onCropComplete={handleCropComplete}
          />
        </div>
      )}

      {croppedImageUrl && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h4>Cropped Image</h4>
          <img
            src={croppedImageUrl}
            alt="Cropped preview"
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button
          onClick={handleUpload}
          disabled={isUploading || (!previewUrl && !croppedImageUrl)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isUploading || (!previewUrl && !croppedImageUrl) ? 'not-allowed' : 'pointer',
            opacity: isUploading || (!previewUrl && !croppedImageUrl) ? 0.7 : 1
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>

        {onImageGenerate && (
          <button
            onClick={() => {
              const prompt = window.prompt('Enter a description for the image you want to generate:');
              if (prompt && onImageGenerate) {
                setIsUploading(true);
                onImageGenerate(prompt)
                  .then(() => {
                    setIsUploading(false);
                  })
                  .catch((err) => {
                    console.error('Error generating image:', err);
                    setError('Failed to generate image. Please try again.');
                    setIsUploading(false);
                  });
              }
            }}
            disabled={isUploading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.7 : 1
            }}
          >
            Generate Image
          </button>
        )}

        <button
          onClick={() => {
            setSelectedFile(null);
            setPreviewUrl(initialImageUrl || null);
            setCroppedImageUrl(null);
            setShowCropper(false);
            setError(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          disabled={isUploading || (!previewUrl && !croppedImageUrl)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: isUploading || (!previewUrl && !croppedImageUrl) ? 'not-allowed' : 'pointer',
            opacity: isUploading || (!previewUrl && !croppedImageUrl) ? 0.7 : 1
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
