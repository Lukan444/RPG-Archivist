import React from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, IconButton } from '@mui/material';

export interface ImageItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

interface ImageGalleryProps {
  images?: ImageItem[] | string[];
  onSelect?: (imageUrl: string) => void;
  onDelete?: (imageId: string) => void;
  onEdit?: (imageId: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [], onSelect, onDelete, onEdit }) => {
  // Check if images are strings or ImageItem objects
  const isStringArray = images.length > 0 && typeof images[0] === 'string';

  return (
    <Box sx={{ mt: 2 }}>
      {images.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No images available
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {isStringArray
            ? (images as string[]).map((imageUrl, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={imageUrl}
                      alt={`Gallery image ${index + 1}`}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onSelect && onSelect(imageUrl)}
                    />
                  </Card>
                </Grid>
              ))
            : (images as ImageItem[]).map((image) => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.url}
                      alt={image.title || 'Gallery image'}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onSelect && onSelect(image.url)}
                    />
                    {(image.title || image.description) && (
                      <CardContent sx={{ py: 1 }}>
                        {image.title && (
                          <Typography variant="subtitle2" noWrap>
                            {image.title}
                          </Typography>
                        )}
                        {image.description && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {image.description}
                          </Typography>
                        )}
                      </CardContent>
                    )}
                  </Card>
                </Grid>
              ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageGallery;
