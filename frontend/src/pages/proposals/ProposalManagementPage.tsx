import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ProposalList from '../../components/proposals/ProposalList';
import ProposalReview from '../../components/proposals/ProposalReview';
import ProposalGenerator from '../../components/proposals/ProposalGenerator';
import ProposalTemplateManager from '../../components/proposals/ProposalTemplateManager';
import { ProposalEntityType, ProposalStatus } from '../../services/api/change-proposal.service';

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
      id={`proposal-tabpanel-${index}`}
      aria-labelledby={`proposal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const ProposalManagementPage: React.FC = () => {
  const { contextId, entityId, entityType } = useParams<{
    contextId?: string;
    entityId?: string;
    entityType?: string;
  }>();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [refreshList, setRefreshList] = useState(0);

  useEffect(() => {
    // If a proposal ID is provided in the URL, switch to the review tab
    if (selectedProposalId) {
      setTabValue(1);
    }
  }, [selectedProposalId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Clear selected proposal when switching away from review tab
    if (newValue !== 1) {
      setSelectedProposalId(null);
    }
  };

  const handleSelectProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setTabValue(1);
  };

  const handleStatusChange = (status: ProposalStatus) => {
    // Refresh the proposal list when a proposal status changes
    setRefreshList(prev => prev + 1);
  };

  const handleProposalGenerated = (proposalId: string) => {
    // Select the newly generated proposal
    setSelectedProposalId(proposalId);
    setTabValue(1);
  };

  const handleBackToList = () => {
    setSelectedProposalId(null);
    setTabValue(0);
  };

  const getEntityTypeEnum = (): ProposalEntityType | undefined => {
    if (!entityType) return undefined;
    
    switch (entityType.toLowerCase()) {
      case 'world':
        return ProposalEntityType.WORLD;
      case 'campaign':
        return ProposalEntityType.CAMPAIGN;
      case 'session':
        return ProposalEntityType.SESSION;
      case 'character':
        return ProposalEntityType.CHARACTER;
      case 'location':
        return ProposalEntityType.LOCATION;
      case 'item':
        return ProposalEntityType.ITEM;
      case 'event':
        return ProposalEntityType.EVENT;
      case 'power':
        return ProposalEntityType.POWER;
      case 'relationship':
        return ProposalEntityType.RELATIONSHIP;
      default:
        return undefined;
    }
  };

  const getPageTitle = (): string => {
    if (entityType && entityId) {
      return `Proposals for ${entityType}`;
    } else if (contextId) {
      return 'Proposals for Campaign';
    } else {
      return 'Proposal Management';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {getPageTitle()}
      </Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="proposal tabs">
            <Tab label="Proposal List" />
            <Tab label="Review Proposal" disabled={!selectedProposalId} />
            <Tab label="Generate Proposal" />
            <Tab label="Templates" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <ProposalList
            contextId={contextId}
            entityId={entityId}
            entityType={getEntityTypeEnum()}
            onSelectProposal={handleSelectProposal}
            key={refreshList} // Force re-render when refreshList changes
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {selectedProposalId ? (
            <Box>
              <Button
                variant="outlined"
                onClick={handleBackToList}
                sx={{ mb: 2 }}
              >
                Back to List
              </Button>
              
              <ProposalReview
                proposalId={selectedProposalId}
                onStatusChange={handleStatusChange}
                onApplied={() => setRefreshList(prev => prev + 1)}
              />
            </Box>
          ) : (
            <Alert severity="info">
              Select a proposal from the list to review it.
            </Alert>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ProposalGenerator
            entityType={getEntityTypeEnum() || ProposalEntityType.CHARACTER}
            entityId={entityId}
            contextId={contextId}
            onProposalGenerated={handleProposalGenerated}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <ProposalTemplateManager
            entityType={getEntityTypeEnum()}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ProposalManagementPage;
