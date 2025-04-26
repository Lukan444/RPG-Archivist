import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  LLMConfig,
  LLMModel,
  LLMProviderType,
  LLMCapability
} from '../../../services/api/llm.service';

interface ModelManagementProps {
  config: LLMConfig;
  onUpdate: (config: Partial<LLMConfig>) => Promise<void>;
  loading: boolean;
}

const ModelManagement: React.FC<ModelManagementProps> = ({
  config,
  onUpdate,
  loading
}) => {
  const [models, setModels] = useState<LLMModel[]>(config.models);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [formValues, setFormValues] = useState<Partial<LLMModel>>({
    id: '',
    name: '',
    provider: LLMProviderType.OPENAI,
    contextWindow: 4096,
    maxTokens: 1000,
    isAvailable: true,
    capabilities: []
  });

  const handleOpenDialog = (model?: LLMModel) => {
    if (model) {
      setEditingModel(model);
      setFormValues({ ...model });
    } else {
      setEditingModel(null);
      setFormValues({
        id: '',
        name: '',
        provider: LLMProviderType.OPENAI,
        contextWindow: 4096,
        maxTokens: 1000,
        isAvailable: true,
        capabilities: []
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingModel(null);
  };

  // Handle Select component changes
  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    if (name) {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  // Handle TextField component changes
  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name) {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormValues({
      ...formValues,
      [name]: checked
    });
  };

  const handleCapabilityChange = (capability: LLMCapability) => {
    const capabilities = formValues.capabilities || [];
    const newCapabilities = capabilities.includes(capability)
      ? capabilities.filter(c => c !== capability)
      : [...capabilities, capability];

    setFormValues({
      ...formValues,
      capabilities: newCapabilities
    });
  };

  const handleSaveModel = async () => {
    if (!formValues.id || !formValues.name || !formValues.provider) {
      return; // Validation failed
    }

    let updatedModels: LLMModel[];

    if (editingModel) {
      // Update existing model
      updatedModels = models.map(model =>
        model.id === editingModel.id ? { ...formValues as LLMModel } : model
      );
    } else {
      // Add new model
      updatedModels = [...models, formValues as LLMModel];
    }

    setModels(updatedModels);
    await onUpdate({ models: updatedModels });
    handleCloseDialog();
  };

  const handleDeleteModel = async (modelId: string) => {
    const updatedModels = models.filter(model => model.id !== modelId);
    setModels(updatedModels);
    await onUpdate({ models: updatedModels });
  };

  const getCapabilityLabel = (capability: LLMCapability) => {
    switch (capability) {
      case LLMCapability.CHAT:
        return 'Chat';
      case LLMCapability.COMPLETION:
        return 'Completion';
      case LLMCapability.EMBEDDING:
        return 'Embedding';
      case LLMCapability.FUNCTION_CALLING:
        return 'Function Calling';
      case LLMCapability.IMAGE_GENERATION:
        return 'Image Generation';
      case LLMCapability.VISION:
        return 'Vision';
      default:
        return capability;
    }
  };

  const getProviderLabel = (provider: LLMProviderType) => {
    switch (provider) {
      case LLMProviderType.OPENAI:
        return 'OpenAI';
      case LLMProviderType.OLLAMA:
        return 'Ollama';
      case LLMProviderType.CUSTOM:
        return 'Custom';
      default:
        return provider;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Available Models
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Add Model
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Context Window</TableCell>
              <TableCell>Max Tokens</TableCell>
              <TableCell>Capabilities</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell>{model.name}</TableCell>
                <TableCell>{model.id}</TableCell>
                <TableCell>{getProviderLabel(model.provider)}</TableCell>
                <TableCell>{model.contextWindow.toLocaleString()}</TableCell>
                <TableCell>{model.maxTokens.toLocaleString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {model.capabilities.map((capability) => (
                      <Chip
                        key={capability}
                        label={getCapabilityLabel(capability)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  {model.isAvailable ? (
                    <Chip
                      icon={<CheckIcon />}
                      label="Available"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<CloseIcon />}
                      label="Unavailable"
                      color="error"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(model)}
                      disabled={loading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteModel(model.id)}
                      disabled={loading || model.id === config.defaultModel}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Model Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingModel ? 'Edit Model' : 'Add New Model'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model Name"
                name="name"
                value={formValues.name || ''}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model ID"
                name="id"
                value={formValues.id || ''}
                onChange={handleTextFieldChange}
                required
                disabled={!!editingModel}
                helperText={editingModel ? "Model ID cannot be changed" : "Unique identifier for the model"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select
                  name="provider"
                  value={formValues.provider || LLMProviderType.OPENAI}
                  onChange={handleSelectChange}
                  label="Provider"
                >
                  <MenuItem value={LLMProviderType.OPENAI}>OpenAI</MenuItem>
                  <MenuItem value={LLMProviderType.OLLAMA}>Ollama</MenuItem>
                  <MenuItem value={LLMProviderType.CUSTOM}>Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.isAvailable}
                    onChange={handleCheckboxChange}
                    name="isAvailable"
                  />
                }
                label="Available"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Context Window"
                name="contextWindow"
                type="number"
                value={formValues.contextWindow || 4096}
                onChange={handleTextFieldChange}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Tokens"
                name="maxTokens"
                type="number"
                value={formValues.maxTokens || 1000}
                onChange={handleTextFieldChange}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Capabilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.values(LLMCapability).map((capability) => (
                  <Chip
                    key={capability}
                    label={getCapabilityLabel(capability)}
                    onClick={() => handleCapabilityChange(capability)}
                    color={formValues.capabilities?.includes(capability) ? 'primary' : 'default'}
                    variant={formValues.capabilities?.includes(capability) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveModel}
            variant="contained"
            color="primary"
            disabled={!formValues.id || !formValues.name}
          >
            {editingModel ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelManagement;
