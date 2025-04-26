import React, { useState, useEffect } from 'react';
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
  SelectChangeEvent,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import {
  LLMService,
  PromptTemplate,
  LLMCapability,
  LLMModel
} from '../../../services/api/llm.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`prompt-template-tabpanel-${index}`}
      aria-labelledby={`prompt-template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const PromptTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<PromptTemplate | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [formValues, setFormValues] = useState<Partial<PromptTemplate>>({
    name: '',
    description: '',
    template: '',
    variables: [],
    systemPrompt: '',
    requiredCapabilities: [],
    defaultModel: '',
    defaultOptions: {},
    metadata: {}
  });
  const [variablesInput, setVariablesInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [templatesData, modelsData] = await Promise.all([
        LLMService.getPromptTemplates(),
        LLMService.getModels()
      ]);

      setTemplates(templatesData);
      setModels(modelsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (template?: PromptTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormValues({ ...template });
      setVariablesInput(template.variables.join(', '));
    } else {
      setEditingTemplate(null);
      setFormValues({
        name: '',
        description: '',
        template: '',
        variables: [],
        systemPrompt: '',
        requiredCapabilities: [],
        defaultModel: '',
        defaultOptions: {},
        metadata: {}
      });
      setVariablesInput('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleViewTemplate = (template: PromptTemplate) => {
    setViewingTemplate(template);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewingTemplate(null);
  };

  // Handle TextField changes
  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name) {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  // Handle Select changes
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    if (name) {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  const handleVariablesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVariablesInput(event.target.value);

    // Parse variables
    const variables = event.target.value
      .split(',')
      .map(v => v.trim())
      .filter(v => v);

    setFormValues({
      ...formValues,
      variables
    });
  };

  const handleCapabilityChange = (capability: LLMCapability) => {
    const capabilities = formValues.requiredCapabilities || [];
    const newCapabilities = capabilities.includes(capability)
      ? capabilities.filter(c => c !== capability)
      : [...capabilities, capability];

    setFormValues({
      ...formValues,
      requiredCapabilities: newCapabilities
    });
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);

      if (!formValues.name || !formValues.template) {
        setSnackbar({
          open: true,
          message: 'Name and template are required',
          severity: 'error'
        });
        return;
      }

      if (editingTemplate) {
        // Update existing template
        const updatedTemplate = await LLMService.updatePromptTemplate(
          editingTemplate.id,
          formValues
        );

        setTemplates(templates.map(t =>
          t.id === updatedTemplate.id ? updatedTemplate : t
        ));

        setSnackbar({
          open: true,
          message: 'Template updated successfully',
          severity: 'success'
        });
      } else {
        // Create new template
        const newTemplate = await LLMService.createPromptTemplate(formValues as Omit<PromptTemplate, 'id'>);
        setTemplates([...templates, newTemplate]);

        setSnackbar({
          open: true,
          message: 'Template created successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving template:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save template',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      await LLMService.deletePromptTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));

      setSnackbar({
        open: true,
        message: 'Template deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete template',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTemplate = (template: PromptTemplate) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined
    };

    // Generate a temporary ID for the duplicated template
    const tempId = `temp-${Date.now()}`;
    handleOpenDialog({
      ...duplicatedTemplate,
      id: tempId
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

  if (loading && templates.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && templates.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Prompt Templates
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Create Template
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Variables</TableCell>
              <TableCell>Required Capabilities</TableCell>
              <TableCell>Default Model</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No templates found. Create your first prompt template.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {template.variables.map((variable) => (
                        <Chip
                          key={variable}
                          label={variable}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {template.requiredCapabilities.map((capability) => (
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
                    {template.defaultModel || 'None'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewTemplate(template)}
                        title="View Template"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(template)}
                        disabled={loading}
                        title="Edit Template"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDuplicateTemplate(template)}
                        disabled={loading}
                        title="Duplicate Template"
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={loading}
                        color="error"
                        title="Delete Template"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Template Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="template tabs">
              <Tab label="Basic Info" />
              <Tab label="Template" />
              <Tab label="Advanced" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formValues.name || ''}
                  onChange={handleTextFieldChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formValues.description || ''}
                  onChange={handleTextFieldChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Variables (comma-separated)"
                  name="variablesInput"
                  value={variablesInput}
                  onChange={handleVariablesChange}
                  helperText="Variables that can be used in the template (e.g., name, date, context)"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Required Capabilities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.values(LLMCapability).map((capability) => (
                    <Chip
                      key={capability}
                      label={getCapabilityLabel(capability)}
                      onClick={() => handleCapabilityChange(capability)}
                      color={formValues.requiredCapabilities?.includes(capability) ? 'primary' : 'default'}
                      variant={formValues.requiredCapabilities?.includes(capability) ? 'filled' : 'outlined'}
                      clickable
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="System Prompt (Optional)"
                  name="systemPrompt"
                  value={formValues.systemPrompt || ''}
                  onChange={handleTextFieldChange}
                  multiline
                  rows={3}
                  helperText="System instructions to set the context for the LLM"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template"
                  name="template"
                  value={formValues.template || ''}
                  onChange={handleTextFieldChange}
                  multiline
                  rows={10}
                  required
                  helperText="Use {{variable}} syntax for variables (e.g., Hello {{name}})"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Model (Optional)</InputLabel>
                  <Select
                    name="defaultModel"
                    value={formValues.defaultModel || ''}
                    onChange={handleSelectChange}
                    label="Default Model (Optional)"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {models.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveTemplate}
            variant="contained"
            color="primary"
            disabled={!formValues.name || !formValues.template || loading}
          >
            {loading ? 'Saving...' : (editingTemplate ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Template Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>{viewingTemplate?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {viewingTemplate?.description || 'No description provided.'}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Variables
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {viewingTemplate?.variables.length ? (
              viewingTemplate.variables.map((variable) => (
                <Chip
                  key={variable}
                  label={variable}
                  size="small"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2">No variables defined.</Typography>
            )}
          </Box>

          {viewingTemplate?.systemPrompt && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                System Prompt
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {viewingTemplate.systemPrompt}
                </Typography>
              </Paper>
            </>
          )}

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Template
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {viewingTemplate?.template}
            </Typography>
          </Paper>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Required Capabilities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {viewingTemplate?.requiredCapabilities.length ? (
              viewingTemplate.requiredCapabilities.map((capability) => (
                <Chip
                  key={capability}
                  label={getCapabilityLabel(capability)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2">No specific capabilities required.</Typography>
            )}
          </Box>

          {viewingTemplate?.defaultModel && (
            <Typography variant="body2">
              <strong>Default Model:</strong> {viewingTemplate.defaultModel}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            onClick={() => {
              handleCloseViewDialog();
              if (viewingTemplate) {
                handleOpenDialog(viewingTemplate);
              }
            }}
            color="primary"
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PromptTemplates;
