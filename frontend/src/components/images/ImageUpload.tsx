import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  AutoFixHigh as AutoFixHighIcon,
} from '@mui/icons-material';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role= tabpanel
      hidden={value !== index}
      id={image-upload-tabpanel-}
      aria-labelledby={image-upload-tab-}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Image upload component props
interface ImageUploadProps {
  onImageUpload: (file: File) => Promise<string>;
  onImageGenerate?: (prompt: string) => Promise<string>;
  onImageDelete?: () => void;
  imageUrl?: string;
  entityType: string;
  entityName?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageGenerate,
  onImageDelete,
  imageUrl,
  entityType,
  entityName,
}) => {
  // State for drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // State for AI image generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  // Handle file drop
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          setError('Please upload an image file (JPEG, PNG, etc.)');
          return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB');
          return;
        }
        
        try {
          setIsUploading(true);
          setError(null);
          await onImageUpload(file);
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image. Please try again.');
        } finally {
          setIsUploading(false);
        }
      }
    },
    [onImageUpload]
  );
  
  // Handle file selection
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          setError('Please upload an image file (JPEG, PNG, etc.)');
          return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB');
          return;
        }
        
        try {
          setIsUploading(true);
          setError(null);
          await onImageUpload(file);
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image. Please try again.');
        } finally {
          setIsUploading(false);
        }
      }
    },
    [onImageUpload]
  );
  
  // Handle browse button click
  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Handle image delete
  const handleDelete = useCallback(() => {
    if (onImageDelete) {
      onImageDelete();
    }
  }, [onImageDelete]);
  
  // Handle AI generation dialog
  const handleGenerateDialogOpen = () => {
    setShowGenerateDialog(true);
    // Set default prompt based on entity type and name
    if (!generationPrompt && entityName) {
      let prompt = '';
      switch (entityType.toLowerCase()) {
        case 'world':
          prompt = A fantasy world map of ;
          break;
        case 'campaign':
          prompt = A fantasy campaign scene for ;
          break;
        case 'character':
          prompt = A fantasy character portrait of ;
          break;
        case 'location':
          prompt = A fantasy location scene of ;
          break;
        default:
          prompt = A fantasy image of ;
      }
      setGenerationPrompt(prompt);
    }
  };
  
  const handleGenerateDialogClose = () => {
    setShowGenerateDialog(false);
  };
  
  // Handle AI image generation
  const handleGenerateImage = async () => {
    if (!onImageGenerate || !generationPrompt.trim()) {
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      await onImageGenerate(generationPrompt);
      setShowGenerateDialog(false);
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <>
      {/* Image upload area */}
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label=image upload tabs
          centered
        >
          <Tab 
            icon={<CloudUploadIcon />} 
            label=Upload 
            id=image-upload-tab-0 
            aria-controls=image-upload-tabpanel-0 
          />
          {onImageGenerate && (
            <Tab 
              icon={<AutoFixHighIcon />} 
              label=Generate 
              id=image-upload-tab-1 
              aria-controls=image-upload-tabpanel-1 
            />
          )}
        </Tabs>
        
        {/* Upload Tab */}
        <TabPanel value={tabValue} index={0}>
          {imageUrl ? (
            <Box sx={{ position: 'relative' }}>
              <Box
                component=img
                src={imageUrl}
                alt={${entityType} image}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 300,
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: 1,
                  p: 0.5,
                }}
              >
                <Tooltip title=Delete image>
                  <IconButton
                    size=small
                    onClick={handleDelete}
                    sx={{ color: 'white' }}
                  >
                    <DeleteIcon fontSize=small />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Paper
              sx={{
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: isDragging ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              {isUploading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant=body1>Uploading image...</Typography>
                </Box>
              ) : (
                <>
                  <ImageIcon color=primary sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant=h6 gutterBottom>
                    {isDragging ? 'Drop image here' : 'Drag & drop image here'}
                  </Typography>
                  <Typography variant=body2 color=text.secondary paragraph>
                    or
                  </Typography>
                  <Button
                    variant=outlined
                    startIcon={<CloudUploadIcon />}
                    onClick={handleBrowseClick}
                  >
                    Browse Files
                  </Button>
                  <Typography variant=caption color=text.secondary sx={{ display: 'block', mt: 1 }}>
                    Supports: JPEG, PNG, WebP (max 5MB)
                  </Typography>
                </>
              )}
              <input
                type=file
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=image/*
                style={{ display: 'none' }}
              />
            </Paper>
          )}
        </TabPanel>
        
        {/* Generate Tab */}
        {onImageGenerate && (
          <TabPanel value={tabValue} index={1}>
            {imageUrl ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component=img
                  src={imageUrl}
                  alt={${entityType} image}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 1,
                    p: 0.5,
                  }}
                >
                  <Tooltip title=Delete image>
                    <IconButton
                      size=small
                      onClick={handleDelete}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon fontSize=small />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <Paper
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <AutoFixHighIcon color=primary sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant=h6 gutterBottom>
                  Generate an AI image
                </Typography>
                <Typography variant=body2 color=text.secondary paragraph>
                  Create a custom image using AI
                </Typography>
                <Button
                  variant=outlined
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleGenerateDialogOpen}
                >
                  Generate Image
                </Button>
              </Paper>
            )}
          </TabPanel>
        )}
        
        {/* Error message */}
        {error && (
          <Alert severity=error sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
      
      {/* AI Image Generation Dialog */}
      <Dialog
        open={showGenerateDialog}
        onClose={handleGenerateDialogClose}
        maxWidth=sm
        fullWidth
      >
        <DialogTitle>Generate AI Image</DialogTitle>
        <DialogContent>
          <Typography variant=body2 color=text.secondary paragraph>
            Describe the image you want to generate for this {entityType.toLowerCase()}.
          </Typography>
          <TextField
            autoFocus
            label=Image Description
            fullWidth
            multiline
            rows={4}
            value={generationPrompt}
            onChange={(e) => setGenerationPrompt(e.target.value)}
            placeholder={Describe how you want the  to look...}
            variant=outlined
            sx={{ mb: 2 }}
          />
          <Typography variant=caption color=text.secondary>
            Tip: Be specific about style, colors, mood, and details for better results.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleGenerateDialogClose}>Cancel</Button>
          <Button
            onClick={handleGenerateImage}
            variant=contained
            color=primary
            disabled={isGenerating || !generationPrompt.trim()}
            startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageUpload;
