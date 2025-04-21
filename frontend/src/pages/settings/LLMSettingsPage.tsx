import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { LLMService, LLMConfig } from '../../services/api/llm.service';
import GeneralLLMSettings from '../../components/settings/llm/GeneralLLMSettings';
import ModelManagement from '../../components/settings/llm/ModelManagement';
import PromptTemplates from '../../components/settings/llm/PromptTemplates';
import CacheManagement from '../../components/settings/llm/CacheManagement';

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
      id={`llm-settings-tabpanel-${index}`}
      aria-labelledby={`llm-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `llm-settings-tab-${index}`,
    'aria-controls': `llm-settings-tabpanel-${index}`,
  };
};

const LLMSettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await LLMService.getConfig();
      setConfig(config);
    } catch (error) {
      console.error('Error fetching LLM configuration:', error);
      setError('Failed to load LLM configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConfigUpdate = async (updatedConfig: Partial<LLMConfig>) => {
    try {
      setLoading(true);
      const newConfig = await LLMService.updateConfig(updatedConfig);
      setConfig(newConfig);
      setSnackbar({
        open: true,
        message: 'LLM configuration updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating LLM configuration:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update LLM configuration',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setLoading(true);
      await LLMService.clearCache();
      setSnackbar({
        open: true,
        message: 'LLM cache cleared successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error clearing LLM cache:', error);
      setSnackbar({
        open: true,
        message: 'Failed to clear LLM cache',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && !config) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !config) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        LLM Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure the Large Language Model (LLM) integration for the Brain feature.
      </Typography>

      <Paper sx={{ width: '100%', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="LLM settings tabs">
            <Tab label="General" {...a11yProps(0)} />
            <Tab label="Models" {...a11yProps(1)} />
            <Tab label="Prompt Templates" {...a11yProps(2)} />
            <Tab label="Cache" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {config && (
            <GeneralLLMSettings
              config={config}
              onUpdate={handleConfigUpdate}
              loading={loading}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {config && (
            <ModelManagement
              config={config}
              onUpdate={handleConfigUpdate}
              loading={loading}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <PromptTemplates />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {config && (
            <CacheManagement
              config={config}
              onUpdate={handleConfigUpdate}
              onClearCache={handleClearCache}
              loading={loading}
            />
          )}
        </TabPanel>
      </Paper>

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

export default LLMSettingsPage;
