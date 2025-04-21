import React, { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';

interface ImageUploaderProps {
  entityId: string;
  entityType: string;
  onUploadComplete?: (imageUrl: string) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  entityId,
  entityType,
  onUploadComplete,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      console.log(`Uploading image for ${entityType} with ID: ${entityId}`);

      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entityId', entityId);
      formData.append('entityType', entityType);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Placeholder result - in real implementation this would be the URL from the API
      const uploadedImageUrl = croppedImageUrl || previewUrl;

      if (uploadedImageUrl && onUploadComplete) {
        onUploadComplete(uploadedImageUrl);
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
    <div className="image-uploader">
      <div className="upload-container">
        <input
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          disabled={isUploading}
          ref={fileInputRef}
          className="file-input"
        />
        <p className="file-info">
          Max size: {maxSizeMB}MB. Allowed types: {allowedTypes.map(type => type.replace('image/', '')).join(', ')}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {previewUrl && !showCropper && !croppedImageUrl && (
        <div className="preview-container">
          <h4>Preview</h4>
          <img src={previewUrl} alt="Preview" className="preview-image" />
          <button
            onClick={() => setShowCropper(true)}
            className="crop-button"
            disabled={isUploading}
          >
            Crop Image
          </button>
        </div>
      )}

      {showCropper && previewUrl && (
        <div className="cropper-container">
          <h4>Crop Image</h4>
          <ImageCropper
            imageUrl={previewUrl}
            onCropComplete={handleCropComplete}
          />
        </div>
      )}

      {croppedImageUrl && (
        <div className="preview-container">
          <h4>Cropped Image</h4>
          <img src={croppedImageUrl} alt="Cropped preview" className="preview-image" />
        </div>
      )}

      <div className="button-container">
        <button
          onClick={handleUpload}
          disabled={isUploading || (!previewUrl && !croppedImageUrl)}
          className="upload-button"
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>

        <button
          onClick={() => {
            setSelectedFile(null);
            setPreviewUrl(null);
            setCroppedImageUrl(null);
            setShowCropper(false);
            setError(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          disabled={isUploading || (!previewUrl && !croppedImageUrl)}
          className="cancel-button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
