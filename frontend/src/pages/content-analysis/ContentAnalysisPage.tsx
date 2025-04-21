import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ContentAnalyzer from '../../components/content-analysis/ContentAnalyzer';
import SuggestionList from '../../components/content-analysis/SuggestionList';
import SuggestionDetail from '../../components/content-analysis/SuggestionDetail';
import { SuggestionStatus } from '../../services/api/content-analysis.service';

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
      id={`content-analysis-tabpanel-${index}`}
      aria-labelledby={`content-analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const ContentAnalysisPage: React.FC = () => {
  const { contextId, entityId, entityType, suggestionId } = useParams<{
    contextId?: string;
    entityId?: string;
    entityType?: string;
    suggestionId?: string;
  }>();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(suggestionId || null);
  const [refreshList, setRefreshList] = useState(0);

  useEffect(() => {
    // If a suggestion ID is provided in the URL, switch to the detail tab
    if (selectedSuggestionId) {
      setTabValue(1);
    }
  }, [selectedSuggestionId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Clear selected suggestion when switching away from detail tab
    if (newValue !== 1) {
      setSelectedSuggestionId(null);
      
      // Update URL
      if (contextId) {
        navigate(`/content-analysis/context/${contextId}`);
      } else if (entityId && entityType) {
        navigate(`/content-analysis/entity/${entityType}/${entityId}`);
      } else {
        navigate('/content-analysis');
      }
    }
  };

  const handleSelectSuggestion = (suggestionId: string) => {
    setSelectedSuggestionId(suggestionId);
    setTabValue(1);
    
    // Update URL
    if (contextId) {
      navigate(`/content-analysis/context/${contextId}/suggestion/${suggestionId}`);
    } else if (entityId && entityType) {
      navigate(`/content-analysis/entity/${entityType}/${entityId}/suggestion/${suggestionId}`);
    } else {
      navigate(`/content-analysis/suggestion/${suggestionId}`);
    }
  };

  const handleStatusChange = (status: SuggestionStatus) => {
    // Refresh the suggestion list when a suggestion status changes
    setRefreshList(prev => prev + 1);
  };

  const handleBackToList = () => {
    setSelectedSuggestionId(null);
    setTabValue(0);
    
    // Update URL
    if (contextId) {
      navigate(`/content-analysis/context/${contextId}`);
    } else if (entityId && entityType) {
      navigate(`/content-analysis/entity/${entityType}/${entityId}`);
    } else {
      navigate('/content-analysis');
    }
  };

  const handleAnalysisComplete = () => {
    // Refresh the suggestion list when analysis is complete
    setRefreshList(prev => prev + 1);
    
    // Switch to the list tab
    setTabValue(0);
  };

  const getPageTitle = (): string => {
    if (entityType && entityId) {
      return `Content Analysis for ${entityType}`;
    } else if (contextId) {
      return 'Content Analysis for Campaign';
    } else {
      return 'Content Analysis';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {getPageTitle()}
      </Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="content analysis tabs">
            <Tab label="Suggestions" />
            <Tab label="Suggestion Detail" disabled={!selectedSuggestionId} />
            <Tab label="Analyze Content" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <SuggestionList
            contextId={contextId}
            contextType={contextId ? 'campaign' : undefined}
            sourceId={entityId}
            sourceType={entityType}
            onSelectSuggestion={handleSelectSuggestion}
            key={refreshList} // Force re-render when refreshList changes
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {selectedSuggestionId ? (
            <Box>
              <SuggestionDetail
                suggestionId={selectedSuggestionId}
                onStatusChange={handleStatusChange}
                onBack={handleBackToList}
              />
            </Box>
          ) : (
            <Alert severity="info">
              Select a suggestion from the list to view its details.
            </Alert>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ContentAnalyzer
            contextId={contextId}
            contextType={contextId ? 'campaign' : undefined}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ContentAnalysisPage;
