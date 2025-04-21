import React, { useState } from \ react\;
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
} from \@mui/material\;
import { PageHeader } from \../../components/ui\;
import RelationshipGraph from \../../components/visualizations/RelationshipGraph\;
import HierarchyTree from \../../components/visualizations/HierarchyTree\;
import { useNavigate } from \react-router-dom\;
import { GraphNode } from \../../services/api/graph.service\;

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
      role=\tabpanel\
      hidden={value !== index}
      id={mind-map-tabpanel-}
      aria-labelledby={mind-map-tab-}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const MindMapPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for filters
  const [worldId, setWorldId] = useState<string>(\\);
  const [campaignId, setCampaignId] = useState<string>(\\);
  const [sessionId, setSessionId] = useState<string>(\\);
  const [characterId, setCharacterId] = useState<string>(\\);
  const [locationId, setLocationId] = useState<string>(\\);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    // Navigate to the appropriate page based on node type
    switch (node.type) {
      case \world\:
        navigate(/rpg-worlds/);
        break;
      case \campaign\:
        navigate(/campaigns/);
        break;
      case \session\:
        navigate(/sessions/);
        break;
      case \character\:
        navigate(/characters/);
        break;
      case \location\:
        navigate(/locations/);
        break;
      default:
        break;
    }
  };
  
  return (
    <Container maxWidth=\lg\>
      <PageHeader
        title=\Mind Map\
        subtitle=\Visualize relationships between entities in your RPG world\
        breadcrumbs={[
          { label: \Dashboard\, href: \/dashboard\ },
          { label: \Mind Map\ },
        ]}
      />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label=\mind map tabs\
          sx={{ borderBottom: 1, borderColor: \divider\ }}
        >
          <Tab label=\Network Graph\ id=\mind-map-tab-0\ aria-controls=\mind-map-tabpanel-0\ />
          <Tab label=\Hierarchy Tree\ id=\mind-map-tab-1\ aria-controls=\mind-map-tabpanel-1\ />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 700 }}>
            <RelationshipGraph
              worldId={worldId || undefined}
              campaignId={campaignId || undefined}
              sessionId={sessionId || undefined}
              characterId={characterId || undefined}
              locationId={locationId || undefined}
              height=\100%\
              onNodeClick={handleNodeClick}
            />
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: 700 }}>
            <HierarchyTree
              worldId={worldId || undefined}
              campaignId={campaignId || undefined}
              height=\100%\
              onNodeClick={handleNodeClick}
            />
          </Box>
        </TabPanel>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant=\h6\ gutterBottom>
                Mind Map Guide
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant=\body2\ paragraph>
                The Mind Map visualizes the relationships between different entities in your RPG world.
              </Typography>
              <Typography variant=\body2\ paragraph>
                <strong>Network Graph:</strong> Shows all relationships between entities. You can filter by entity type, relationship type, and depth.
              </Typography>
              <Typography variant=\body2\ paragraph>
                <strong>Hierarchy Tree:</strong> Shows the hierarchical structure of your RPG world, with worlds containing campaigns, campaigns containing sessions, etc.
              </Typography>
              <Typography variant=\body2\>
                Click on any node to navigate to its detail page.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant=\h6\ gutterBottom>
                Node Types
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: \flex\, alignItems: \center\, mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: \50%\, bgcolor: \#3f51b5\, mr: 1 }} />
                    <Typography variant=\body2\>World</Typography>
                  </Box>
                  <Box sx={{ display: \flex\, alignItems: \center\, mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: \50%\, bgcolor: \#2196f3\, mr: 1 }} />
                    <Typography variant=\body2\>Campaign</Typography>
                  </Box>
                  <Box sx={{ display: \flex\, alignItems: \center\, mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: \50%\, bgcolor: \#00bcd4\, mr: 1 }} />
                    <Typography variant=\body2\>Session</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: \flex\, alignItems: \center\, mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: \50%\, bgcolor: \#4caf50\, mr: 1 }} />
                    <Typography variant=\body2\>Character</Typography>
                  </Box>
                  <Box sx={{ display: \flex\, alignItems: \center\, mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: \50%\, bgcolor: \#ff9800\, mr: 1 }} />
                    <Typography variant=\body2\>Location</Typography>
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
