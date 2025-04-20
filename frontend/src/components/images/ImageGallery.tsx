import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

// Image interface
export interface ImageItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
  createdAt?: string;
}

// Image gallery props
interface ImageGalleryProps {
  images: ImageItem[];
  onDelete?: (imageId: string) => void;
  onEdit?: (imageId: string) => void;
  loading?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onDelete,
  onEdit,
  loading = false,
}) => {
  // State for lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Handle lightbox open
  const handleOpenLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };
  
  // Handle lightbox close
  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };
  
  // Handle navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Handle image delete
  const handleDelete = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(imageId);
    }
  };
  
  // Handle image edit
  const handleEdit = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(imageId);
    }
  };
  
  // Handle image download
  const handleDownload = (e: React.MouseEvent, image: ImageItem) => {
    e.stopPropagation();
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.title || image-;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render loading skeletons
  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={6} sm={4} md={3} key={item}>
            <Paper sx={{ p: 1, height: '100%' }}>
              <Skeleton variant= rectangular height={140} sx={{ borderRadius: 1 }} />
              <Skeleton variant=text sx={{ mt: 1 }} />
              <Skeleton variant=text width=60% />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }
  
  // Render empty state
  if (images.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant=body1 color=text.secondary>
          No images available
        </Typography>
      </Box>
    );
  }
  
  return (
    <>
      {/* Image grid */}
      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Grid item xs={6} sm={4} md={3} key={image.id}>
            <Paper
              sx={{
                p: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                position: 'relative',
              }}
              onClick={() => handleOpenLightbox(index)}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '75%', // 4:3 aspect ratio
                  width: '100%',
                  overflow: 'hidden',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Box
                  component=img
                  src={image.url}
                  alt={image.title || 'Image'}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                
                {/* Image actions */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    display: 'flex',
                    p: 0.5,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    borderBottomLeftRadius: 4,
                  }}
                >
                  {onEdit && (
                    <Tooltip title=Edit>
                      <IconButton
                        size=small
                        onClick={(e) => handleEdit(e, image.id)}
                        sx={{ color: 'white', p: 0.5 }}
                      >
                        <EditIcon fontSize=small />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title=Download>
                    <IconButton
                      size=small
                      onClick={(e) => handleDownload(e, image)}
                      sx={{ color: 'white', p: 0.5 }}
                    >
                      <DownloadIcon fontSize=small />
                    </IconButton>
                  </Tooltip>
                  {onDelete && (
                    <Tooltip title=Delete>
                      <IconButton
                        size=small
                        onClick={(e) => handleDelete(e, image.id)}
                        sx={{ color: 'white', p: 0.5 }}
                      >
                        <DeleteIcon fontSize=small />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
              
              {/* Image title */}
              {image.title && (
                <Typography
                  variant=body2
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {image.title}
                </Typography>
              )}
              
              {/* Image date */}
              {image.createdAt && (
                <Typography variant=caption color=text.secondary>
                  {new Date(image.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Lightbox dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        maxWidth=lg
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Close button */}
          <IconButton
            onClick={handleCloseLightbox}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                  zIndex: 1,
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                  zIndex: 1,
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </>
          )}
          
          {/* Current image */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
              bgcolor: 'black',
            }}
          >
            <Box
              component=img
              src={images[currentImageIndex]?.url}
              alt={images[currentImageIndex]?.title || 'Image'}
              sx={{
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 200px)',
                objectFit: 'contain',
              }}
            />
          </Box>
        </DialogContent>
        
        {/* Image info and actions */}
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Box>
            {images[currentImageIndex]?.title && (
              <Typography variant=subtitle1>
                {images[currentImageIndex].title}
              </Typography>
            )}
            {images[currentImageIndex]?.description && (
              <Typography variant=body2 color=text.secondary>
                {images[currentImageIndex].description}
              </Typography>
            )}
          </Box>
          <Box>
            {onEdit && (
              <Button
                startIcon={<EditIcon />}
                onClick={(e) => {
                  handleEdit(e, images[currentImageIndex].id);
                  handleCloseLightbox();
                }}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
            )}
            <Button
              startIcon={<DownloadIcon />}
              onClick={(e) => handleDownload(e, images[currentImageIndex])}
              sx={{ mr: 1 }}
            >
              Download
            </Button>
            {onDelete && (
              <Button
                startIcon={<DeleteIcon />}
                color=error
                onClick={(e) => {
                  handleDelete(e, images[currentImageIndex].id);
                  handleCloseLightbox();
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageGallery;
