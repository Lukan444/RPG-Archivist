import React from 'react';

interface ImageGalleryProps {
  images?: string[];
  onSelect?: (imageUrl: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [], onSelect }) => {
  return (
    <div className="image-gallery">
      {images.length === 0 ? (
        <p>No images available</p>
      ) : (
        <div className="image-grid">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="image-item"
              onClick={() => onSelect && onSelect(imageUrl)}
            >
              <img src={imageUrl} alt={`Gallery image ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
