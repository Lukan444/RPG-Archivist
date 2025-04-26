import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface ImageManagementDialogProps {
  open: boolean;
  onClose: () => void;
  entityType: string;
  entityId: string;
}

const ImageManagementDialog: React.FC<ImageManagementDialogProps> = ({
  open,
  onClose,
  entityType,
  entityId
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Images</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Image management for {entityType} (ID: {entityId})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This component is under development.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageManagementDialog;
