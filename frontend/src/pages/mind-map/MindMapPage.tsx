import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
} from '@mui/material';
import { PageHeader } from '../../components/ui';
import RelationshipGraph from '../../components/visualizations/RelationshipGraph';
import HierarchyTree from '../../components/visualizations/HierarchyTree';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraphNode, NodeType, EdgeType } from '../../services/api/graph.service';

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
      role="tabpanel"
      hidden={value !== index}
      id={`mind-map-tabpanel-${index}`}
      aria-labelledby={`mind-map-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const MindMapPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for filters
  const [worldId, setWorldId] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [characterId, setCharacterId] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [eventId, setEventId] = useState<string>('');
  const [powerId, setPowerId] = useState<string>('');

  // State for graph settings from URL
  const [depth, setDepth] = useState<number | undefined>(undefined);
  const [nodeTypeFilters, setNodeTypeFilters] = useState<NodeType[] | undefined>(undefined);
  const [edgeTypeFilters, setEdgeTypeFilters] = useState<EdgeType[] | undefined>(undefined);
  const [layout, setLayout] = useState<'force' | 'hierarchy' | 'radial' | undefined>(undefined);

  // State for errors
  const [error, setError] = useState<string | null>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Parse URL parameters on mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);

      // Parse entity IDs
      if (searchParams.has('worldId')) setWorldId(searchParams.get('worldId') || '');
      if (searchParams.has('campaignId')) setCampaignId(searchParams.get('campaignId') || '');
      if (searchParams.has('sessionId')) setSessionId(searchParams.get('sessionId') || '');
      if (searchParams.has('characterId')) setCharacterId(searchParams.get('characterId') || '');
      if (searchParams.has('locationId')) setLocationId(searchParams.get('locationId') || '');
      if (searchParams.has('itemId')) setItemId(searchParams.get('itemId') || '');
      if (searchParams.has('eventId')) setEventId(searchParams.get('eventId') || '');
      if (searchParams.has('powerId')) setPowerId(searchParams.get('powerId') || '');

      // Parse graph settings
      if (searchParams.has('depth')) {
        const depthParam = parseInt(searchParams.get('depth') || '1');
        if (!isNaN(depthParam) && depthParam > 0) {
          setDepth(depthParam);
        }
      }

      if (searchParams.has('nodeTypes')) {
        const nodeTypesParam = searchParams.get('nodeTypes');
        if (nodeTypesParam) {
          setNodeTypeFilters(nodeTypesParam.split(',') as NodeType[]);
        }
      }

      if (searchParams.has('edgeTypes')) {
        const edgeTypesParam = searchParams.get('edgeTypes');
        if (edgeTypesParam) {
          setEdgeTypeFilters(edgeTypesParam.split(',') as EdgeType[]);
        }
      }

      if (searchParams.has('layout')) {
        const layoutParam = searchParams.get('layout') as 'force' | 'hierarchy' | 'radial';
        if (['force', 'hierarchy', 'radial'].includes(layoutParam)) {
          setLayout(layoutParam);
        }
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      setError('Failed to parse URL parameters. Some graph settings may not be applied.');
    }
  }, [location.search]);

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    // Navigate to the appropriate page based on node type
    switch (node.type) {
      case 'world':
        navigate(`/rpg-worlds/${node.id}`);
        break;
      case 'campaign':
        navigate(`/campaigns/${node.id}`);
        break;
      case 'session':
        navigate(`/sessions/${node.id}`);
        break;
      case 'character':
        navigate(`/characters/${node.id}`);
        break;
      case 'location':
        navigate(`/locations/${node.id}`);
        break;
      case 'item':
        navigate(`/items/${node.id}`);
        break;
      case 'event':
        navigate(`/events/${node.id}`);
        break;
      case 'power':
        navigate(`/powers/${node.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Mind Map"
        subtitle="Visualize relationships between entities in your RPG world"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mind Map" },
        ]}
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="mind map tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Network Graph" id="mind-map-tab-0" aria-controls="mind-map-tabpanel-0" />
          <Tab label="Hierarchy Tree" id="mind-map-tab-1" aria-controls="mind-map-tabpanel-1" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 700 }}>
            <RelationshipGraph
              worldId={worldId || undefined}
              campaignId={campaignId || undefined}
              sessionId={sessionId || undefined}
              characterId={characterId || undefined}
              locationId={locationId || undefined}
              itemId={itemId || undefined}
              eventId={eventId || undefined}
              powerId={powerId || undefined}
              initialDepth={depth}
              nodeTypeFilters={nodeTypeFilters}
              edgeTypeFilters={edgeTypeFilters}
              layout={layout}
              height="100%"
              onNodeClick={handleNodeClick}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: 700 }}>
            <HierarchyTree
              worldId={worldId || undefined}
              campaignId={campaignId || undefined}
              height="100%"
              onNodeClick={(node) => handleNodeClick(node.data as GraphNode)}
            />
          </Box>
        </TabPanel>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mind Map Guide
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                The Mind Map visualizes the relationships between different entities in your RPG world.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Network Graph:</strong> Shows all relationships between entities. You can filter by entity type, relationship type, and depth.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Hierarchy Tree:</strong> Shows the hierarchical structure of your RPG world, with worlds containing campaigns, campaigns containing sessions, etc.
              </Typography>
              <Typography variant="body2" paragraph>
                Click on any node to navigate to its detail page.
              </Typography>
              <Typography variant="body2">
                You can share the mind map by clicking the share button in the top-left corner.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Node Types
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#3f51b5", mr: 1 }} />
                    <Typography variant="body2">World</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#2196f3", mr: 1 }} />
                    <Typography variant="body2">Campaign</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#00bcd4", mr: 1 }} />
                    <Typography variant="body2">Session</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#4caf50", mr: 1 }} />
                    <Typography variant="body2">Character</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#ff9800", mr: 1 }} />
                    <Typography variant="body2">Location</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#f44336", mr: 1 }} />
                    <Typography variant="body2">Item</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#9c27b0", mr: 1 }} />
                    <Typography variant="body2">Event</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#ffc107", mr: 1 }} />
                    <Typography variant="body2">Power</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MindMapPage;
