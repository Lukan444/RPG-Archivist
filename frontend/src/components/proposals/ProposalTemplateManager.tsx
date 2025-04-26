import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  Grid,
  Chip,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import {
  ChangeProposalService,
  ProposalTemplate,
  ProposalEntityType
} from '../../services/api/change-proposal.service';
import { adaptSelectChangeHandlerForInput } from '../../utils/eventHandlers';

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
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

interface ProposalTemplateManagerProps {
  entityType?: ProposalEntityType;
}

const ProposalTemplateManager: React.FC<ProposalTemplateManagerProps> = ({
  entityType
}) => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<ProposalTemplate | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formValues, setFormValues] = useState<Partial<ProposalTemplate>>({
    name: '',
    description: '',
    entityType: entityType || ProposalEntityType.CHARACTER,
    promptTemplate: '',
    systemPrompt: '',
    defaultModel: '',
    requiredContext: true
  });

  useEffect(() => {
    fetchTemplates();
  }, [entityType]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const templates = await ChangeProposalService.getTemplates(entityType);
      setTemplates(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (template?: ProposalTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormValues({ ...template });
    } else {
      setEditingTemplate(null);
      setFormValues({
        name: '',
        description: '',
        entityType: entityType || ProposalEntityType.CHARACTER,
        promptTemplate: '',
        systemPrompt: '',
        defaultModel: '',
        requiredContext: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleViewTemplate = (template: ProposalTemplate) => {
    setViewingTemplate(template);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewingTemplate(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;

    if (name) {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  // Create an adapter for Material UI's SelectChangeEvent
  const adaptedHandleChange = adaptSelectChangeHandlerForInput(handleChange);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setFormValues({
      ...formValues,
      [name]: checked
    });
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);

      if (!formValues.name || !formValues.entityType || !formValues.promptTemplate) {
        setError('Name, entity type, and prompt template are required');
        return;
      }

      if (editingTemplate) {
        // Update existing template
        await ChangeProposalService.updateTemplate(
          editingTemplate.id,
          formValues
        );
      } else {
        // Create new template
        await ChangeProposalService.createTemplate(formValues as Omit<ProposalTemplate, 'id'>);
      }

      // Refresh templates
      await fetchTemplates();

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setLoading(true);

      await ChangeProposalService.deleteTemplate(templateId);

      // Refresh templates
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTemplate = (template: ProposalTemplate) => {
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

  const getEntityTypeName = (type: ProposalEntityType): string => {
    switch (type) {
      case ProposalEntityType.WORLD:
        return 'World';
      case ProposalEntityType.CAMPAIGN:
        return 'Campaign';
      case ProposalEntityType.SESSION:
        return 'Session';
      case ProposalEntityType.CHARACTER:
        return 'Character';
      case ProposalEntityType.LOCATION:
        return 'Location';
      case ProposalEntityType.ITEM:
        return 'Item';
      case ProposalEntityType.EVENT:
        return 'Event';
      case ProposalEntityType.POWER:
        return 'Power';
      case ProposalEntityType.RELATIONSHIP:
        return 'Relationship';
      default:
        return type;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Proposal Templates
          {templates.length > 0 && ` (${templates.length})`}
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          No templates found
        </Typography>
      ) : (
        <List>
          {templates.map((template) => (
            <React.Fragment key={template.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {template.name}
                      </Typography>
                      <Chip
                        label={getEntityTypeName(template.entityType)}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        component="span"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          mb: 1
                        }}
                      >
                        {template.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        {template.requiredContext ? 'Requires context' : 'No context required'}
                        {template.defaultModel && ` • Default model: ${template.defaultModel}`}
                      </Typography>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="View Template">
                      <IconButton
                        edge="end"
                        aria-label="view"
                        onClick={() => handleViewTemplate(template)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Template">
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenDialog(template)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate Template">
                      <IconButton
                        edge="end"
                        aria-label="duplicate"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Template">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteTemplate(template.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Create/Edit Template Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="template tabs">
              <Tab label="Basic Info" />
              <Tab label="Prompt Template" />
              <Tab label="System Prompt" />
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
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formValues.description || ''}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="entity-type-label">Entity Type</InputLabel>
                  <Select
                    labelId="entity-type-label"
                    id="entityType"
                    name="entityType"
                    value={formValues.entityType || ProposalEntityType.CHARACTER}
                    onChange={adaptedHandleChange}
                    label="Entity Type"
                    disabled={!!entityType}
                  >
                    {Object.values(ProposalEntityType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {getEntityTypeName(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Model (Optional)"
                  name="defaultModel"
                  value={formValues.defaultModel || ''}
                  onChange={handleChange}
                  placeholder="e.g., gpt-4o"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <label>
                    <input
                      type="checkbox"
                      name="requiredContext"
                      checked={formValues.requiredContext}
                      onChange={handleSwitchChange}
                    />
                    Requires Context
                  </label>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Use the following variables in your template:
              <br />
              <code>{'{{entityType}}'}</code> - Type of entity
              <br />
              <code>{'{{entityId}}'}</code> - ID of the entity (if updating)
              <br />
              <code>{'{{entityData}}'}</code> - Data of the entity (if updating)
              <br />
              <code>{'{{contextId}}'}</code> - ID of the context (campaign or session)
              <br />
              <code>{'{{contextData}}'}</code> - Data of the context
            </Typography>

            <TextField
              fullWidth
              label="Prompt Template"
              name="promptTemplate"
              value={formValues.promptTemplate || ''}
              onChange={handleChange}
              multiline
              rows={10}
              required
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="body2" color="text.secondary" paragraph>
              The system prompt sets the context for the LLM. It can include instructions on how to format the response and what to include.
            </Typography>

            <TextField
              fullWidth
              label="System Prompt"
              name="systemPrompt"
              value={formValues.systemPrompt || ''}
              onChange={handleChange}
              multiline
              rows={10}
              placeholder="Optional system prompt to guide the LLM"
            />
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveTemplate}
            variant="contained"
            color="primary"
            disabled={!formValues.name || !formValues.entityType || !formValues.promptTemplate || loading}
          >
            {loading ? 'Saving...' : (editingTemplate ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Template Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{viewingTemplate?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {viewingTemplate?.description || 'No description provided.'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={viewingTemplate?.entityType ? getEntityTypeName(viewingTemplate.entityType) : ''}
              variant="outlined"
            />
            <Chip
              label={viewingTemplate?.requiredContext ? 'Requires Context' : 'No Context Required'}
              variant="outlined"
            />
            {viewingTemplate?.defaultModel && (
              <Chip
                label={`Default Model: ${viewingTemplate.defaultModel}`}
                variant="outlined"
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Prompt Template
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {viewingTemplate?.promptTemplate}
            </Typography>
          </Paper>

          {viewingTemplate?.systemPrompt && (
            <React.Fragment>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                System Prompt
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {viewingTemplate.systemPrompt}
                </Typography>
              </Paper>
            </React.Fragment>
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
    </Paper>
  );
};

export default ProposalTemplateManager;
