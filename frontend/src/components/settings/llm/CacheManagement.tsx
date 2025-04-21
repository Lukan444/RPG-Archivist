import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Info as InfoIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import { LLMConfig } from '../../../services/api/llm.service';

interface CacheManagementProps {
  config: LLMConfig;
  onUpdate: (config: Partial<LLMConfig>) => Promise<void>;
  onClearCache: () => Promise<void>;
  loading: boolean;
}

const CacheManagement: React.FC<CacheManagementProps> = ({
  config,
  onUpdate,
  onClearCache,
  loading
}) => {
  const [formValues, setFormValues] = useState({
    cacheEnabled: config.cacheEnabled,
    cacheTTL: config.cacheTTL
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormValues({
      ...formValues,
      [name]: checked
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onUpdate(formValues);
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleClearCache = async () => {
    await onClearCache();
    handleCloseConfirmDialog();
  };

  // Convert milliseconds to human-readable format
  const formatTTL = (ms: number) => {
    if (ms < 1000) {
      return `${ms} milliseconds`;
    } else if (ms < 60000) {
      return `${ms / 1000} seconds`;
    } else if (ms < 3600000) {
      return `${ms / 60000} minutes`;
    } else if (ms < 86400000) {
      return `${ms / 3600000} hours`;
    } else {
      return `${ms / 86400000} days`;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cache Settings
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.cacheEnabled}
                    onChange={handleSwitchChange}
                    name="cacheEnabled"
                    disabled={loading}
                  />
                }
                label="Enable Caching"
              />
              <Tooltip title="Cache LLM responses to improve performance and reduce API costs">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="cacheTTL"
                name="cacheTTL"
                label="Cache TTL (ms)"
                type="number"
                value={formValues.cacheTTL}
                onChange={handleChange}
                disabled={loading || !formValues.cacheEnabled}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Time to live for cached responses in milliseconds">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
                helperText={formValues.cacheEnabled ? `Cached responses will expire after ${formatTTL(formValues.cacheTTL)}` : 'Caching is disabled'}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Cache Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          Clear the LLM response cache to free up memory and ensure fresh responses from the LLM.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={handleOpenConfirmDialog}
            disabled={loading}
          >
            Clear Cache
          </Button>
        </Box>
      </Paper>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>Clear LLM Cache</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear the LLM response cache? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleClearCache} color="error" autoFocus>
            Clear Cache
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CacheManagement;
