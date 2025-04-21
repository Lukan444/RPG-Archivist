import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import ImageGallery from './ImageGallery';
import AIImageGenerator from './AIImageGenerator';

interface EntityImageManagerProps {
  entityId: string;
  entityType: 'character' | 'location' | 'item' | 'world' | 'campaign' | 'session';
  currentImageUrl?: string;
  onImageSelected?: (imageUrl: string) => void;
}

const EntityImageManager: React.FC<EntityImageManagerProps> = ({
  entityId,
  entityType,
  currentImageUrl,
  onImageSelected
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'ai'>('upload');
  const [entityImages, setEntityImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load entity images when component mounts or entityId changes
    if (entityId) {
      loadEntityImages();
    }
  }, [entityId, entityType]);

  const loadEntityImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // This is a placeholder for actual API call
      // In a real implementation, you would fetch images from your API
      console.log(`Loading images for ${entityType} with ID: ${entityId}`);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockImages = [
        'https://placeholder.com/image1',
        'https://placeholder.com/image2',
        'https://placeholder.com/image3',
      ];

      setEntityImages(mockImages);
    } catch (err) {
      setError('Failed to load images. Please try again.');
      console.error('Error loading images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    // Add the uploaded image to the entity's images
    setEntityImages(prev => [imageUrl, ...prev]);

    // Call the callback with the new image URL
    if (onImageSelected) {
      onImageSelected(imageUrl);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (onImageSelected) {
      onImageSelected(imageUrl);
    }
  };

  return (
    <div className="entity-image-manager">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Image
        </button>
        <button
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Image Gallery
        </button>
        <button
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI Generator
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'upload' && (
          <ImageUploader
            entityId={entityId}
            entityType={entityType}
            onUploadComplete={handleImageUpload}
          />
        )}

        {activeTab === 'gallery' && (
          <>
            {isLoading ? (
              <div className="loading">Loading images...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <ImageGallery
                images={entityImages}
                onSelect={handleImageSelect}
              />
            )}
          </>
        )}

        {activeTab === 'ai' && (
          <AIImageGenerator
            onImageGenerated={handleImageUpload}
          />
        )}
      </div>

      {currentImageUrl && (
        <div className="current-image">
          <h4>Current Image</h4>
          <img
            src={currentImageUrl}
            alt={`Current ${entityType} image`}
            className="preview-image"
          />
        </div>
      )}
    </div>
  );
};

export default EntityImageManager;
