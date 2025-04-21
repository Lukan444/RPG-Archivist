import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  StickyNote2 as NoteIcon
} from '@mui/icons-material';
import { GraphNode } from '../../../services/api/graph.service';

interface AnnotationEditorProps {
  node: GraphNode;
  open: boolean;
  onClose: () => void;
  onSave: (nodeId: string, annotation: string) => void;
  onDelete: (nodeId: string) => void;
}

/**
 * Component for editing node annotations
 */
const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  node,
  open,
  onClose,
  onSave,
  onDelete
}) => {
  const [annotation, setAnnotation] = useState<string>('');

  // Initialize annotation when node changes
  useEffect(() => {
    if (node) {
      setAnnotation(node.annotation || '');
    }
  }, [node]);

  // Handle save
  const handleSave = () => {
    onSave(node.id, annotation);
    onClose();
  };

  // Handle delete
  const handleDelete = () => {
    onDelete(node.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <NoteIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            {node?.annotation ? 'Edit Annotation' : 'Add Annotation'}
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {node?.label} ({node?.type})
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Annotation"
          fullWidth
          multiline
          rows={4}
          value={annotation}
          onChange={(e) => setAnnotation(e.target.value)}
          placeholder="Add notes, reminders, or additional context about this node..."
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        {node?.annotation && (
          <Button 
            onClick={handleDelete} 
            color="error" 
            startIcon={<DeleteIcon />}
            sx={{ mr: 'auto' }}
          >
            Delete
          </Button>
        )}
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={annotation === node?.annotation}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Component for displaying annotation indicator and controls
 */
export const AnnotationIndicator: React.FC<{
  node: GraphNode;
  onEdit: () => void;
}> = ({ node, onEdit }) => {
  if (!node.annotation) return null;

  return (
    <Tooltip title={node.annotation}>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <NoteIcon fontSize="small" color="primary" />
      </IconButton>
    </Tooltip>
  );
};

/**
 * Component for adding annotation button
 */
export const AddAnnotationButton: React.FC<{
  onAdd: () => void;
}> = ({ onAdd }) => {
  return (
    <Tooltip title="Add Annotation">
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default AnnotationEditor;
