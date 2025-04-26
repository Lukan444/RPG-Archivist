import React, { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: number;
  onCropComplete?: (croppedImageUrl: string) => void;
  maxWidth?: number;
  maxHeight?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  aspectRatio = 1,
  onCropComplete,
  maxWidth = 800,
  maxHeight = 600
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Reset crop when image changes
    setImageLoaded(false);
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
  }, [imageUrl]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;

      // Calculate initial crop area based on aspect ratio
      let cropWidth, cropHeight;

      if (naturalWidth / naturalHeight > aspectRatio) {
        // Image is wider than the target aspect ratio
        cropHeight = naturalHeight;
        cropWidth = cropHeight * aspectRatio;
      } else {
        // Image is taller than the target aspect ratio
        cropWidth = naturalWidth;
        cropHeight = cropWidth / aspectRatio;
      }

      // Center the crop area
      const x = (naturalWidth - cropWidth) / 2;
      const y = (naturalHeight - cropHeight) / 2;

      setCrop({ x, y, width: cropWidth, height: cropHeight });
      setImageLoaded(true);
    }
  };

  const handleCrop = () => {
    if (!imageRef.current || !canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match the crop size
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Draw the cropped portion of the image onto the canvas
    ctx.drawImage(
      imageRef.current,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    // Convert canvas to data URL
    const croppedImageUrl = canvas.toDataURL('image/jpeg');

    // Call the callback with the cropped image URL
    if (onCropComplete) {
      onCropComplete(croppedImageUrl);
    }
  };

  // This is a simplified implementation without actual dragging/resizing functionality
  // In a real implementation, you would add mouse/touch event handlers for interactive cropping

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Source for cropping"
          onLoad={handleImageLoad}
          style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
        />

        {imageLoaded && (
          <div
            style={{
              position: 'absolute',
              left: `${crop.x}px`,
              top: `${crop.y}px`,
              width: `${crop.width}px`,
              height: `${crop.height}px`,
              border: '2px dashed white',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      <div style={{ marginTop: '15px' }}>
        <button
          onClick={handleCrop}
          disabled={!imageLoaded}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !imageLoaded ? 'not-allowed' : 'pointer',
            opacity: !imageLoaded ? 0.7 : 1
          }}
        >
          Crop Image
        </button>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropper;
