import React, { useState, useEffect, useCallback } from \ react\;
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Panel,
} from \reactflow\;
import \reactflow/dist/style.css\;
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from \@mui/material\;
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  FilterList as FilterListIcon,
} from \@mui/icons-material\;
import GraphService, {
  GraphData,
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType,
  GraphQueryParams,
} from \../../services/api/graph.service\;

// Custom node components
import EntityNode from \./nodes/EntityNode\;
import WorldNode from \./nodes/WorldNode\;
import CampaignNode from \./nodes/CampaignNode\;
import SessionNode from \./nodes/SessionNode\;
import CharacterNode from \./nodes/CharacterNode\;
import LocationNode from \./nodes/LocationNode\;
import ItemNode from \./nodes/ItemNode\;
import EventNode from \./nodes/EventNode\;
import PowerNode from \./nodes/PowerNode\;

// Custom edge components
import RelationshipEdge from \./edges/RelationshipEdge\;

// Node types mapping
const nodeTypes: NodeTypes = {
  entity: EntityNode,
  world: WorldNode,
  campaign: CampaignNode,
  session: SessionNode,
  character: CharacterNode,
  location: LocationNode,
  item: ItemNode,
  event: EventNode,
  power: PowerNode,
};

// Edge types mapping
const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

// Node type colors
const nodeTypeColors: Record<NodeType, string> = {
  world: \#3f51b5\, // Indigo
  campaign: \#2196f3\, // Blue
  session: \#00bcd4\, // Cyan
  character: \#4caf50\, // Green
  location: \#ff9800\, // Orange
  item: \#f44336\, // Red
  event: \#9c27b0\, // Purple
  power: \#ffc107\, // Amber
};

// Edge type colors
const edgeTypeColors: Record<EdgeType, string> = {
  PART_OF: \#9e9e9e\, // Gray
  CONTAINS: \#607d8b\, // Blue Gray
  LOCATED_AT: \#ff9800\, // Orange
  PARTICIPATED_IN: \#4caf50\, // Green
  RELATED_TO: \#9c27b0\, // Purple
  PARENT_OF: \#795548\, // Brown
  CHILD_OF: \#8d6e63\, // Light Brown
  OWNS: \#f44336\, // Red
  CREATED: \#2196f3\, // Blue
  HAS_POWER: \#ffc107\, // Amber
  OCCURRED_AT: \#00bcd4\, // Cyan
};

// Props for RelationshipGraph component
interface RelationshipGraphProps {
  worldId?: string;
  campaignId?: string;
  sessionId?: string;
  characterId?: string;
  locationId?: string;
  itemId?: string;
  eventId?: string;
  powerId?: string;
  initialDepth?: number;
  height?: number | string;
  width?: number | string;
  showControls?: boolean;
  showMiniMap?: boolean;
  showFilters?: boolean;
  layout?: 'force' | 'hierarchy' | 'radial';
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  worldId,
  campaignId,
  sessionId,
  characterId,
  locationId,
  itemId,
  eventId,
  powerId,
  initialDepth = 1,
  height = 600,
  width = \100%\,
  showControls = true,
  showMiniMap = true,
  showFilters = true,
  layout = 'force',
  onNodeClick,
  onEdgeClick,
}) => {
  // State for graph data
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [depth, setDepth] = useState(initialDepth);
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([\world\, \campaign\, \session\, \character\, \location\, \item\, \event\, \power\]);
  const [edgeTypes, setEdgeTypes] = useState<EdgeType[]>([\PART_OF\, \CONTAINS\, \LOCATED_AT\, \PARTICIPATED_IN\, \RELATED_TO\, \PARENT_OF\, \CHILD_OF\, \OWNS\, \CREATED\, \HAS_POWER\, \OCCURRED_AT\]);
  const [layoutType, setLayoutType] = useState<'force' | 'hierarchy' | 'radial'>(layout);
  const [showLabels, setShowLabels] = useState(true);
  const [showImages, setShowImages] = useState(true);

  // Convert GraphData to ReactFlow nodes and edges
  const convertGraphDataToReactFlow = useCallback((graphData: GraphData) => {
    // Convert nodes
    const reactFlowNodes: Node[] = graphData.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      data: {
        ...node,
        label: node.label,
        showLabel: showLabels,
        showImage: showImages,
      },
      position: { x: 0, y: 0 }, // Will be positioned by layout
      style: {
        background: nodeTypeColors[node.type as NodeType] || \#ccc\,
      },
    }));

    // Convert edges
    const reactFlowEdges: Edge[] = graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: \relationship\,
      label: showLabels ? edge.label || edge.type : undefined,
      data: {
        ...edge,
      },
      style: {
        stroke: edgeTypeColors[edge.type as EdgeType] || \#ccc\,
      },
      animated: edge.type === \RELATED_TO\,
    }));

    return { nodes: reactFlowNodes, edges: reactFlowEdges };
  }, [showLabels, showImages]);

  // Apply force-directed layout to nodes
  const applyForceDirectedLayout = useCallback((nodes: Node[], edges: Edge[]) => {
    // This is a simplified force-directed layout
    // In a real implementation, you would use a more sophisticated algorithm
    // or a library like d3-force

    // For now, we'll just place nodes in a grid
    const nodeCount = nodes.length;
    const cols = Math.ceil(Math.sqrt(nodeCount));
    const spacing = 200;

    return nodes.map((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...node,
        position: {
          x: col * spacing,
          y: row * spacing,
        },
      };
    });
  }, []);

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params: GraphQueryParams = {
        depth,
        nodeTypes,
        edgeTypes,
        includeImages: showImages,
        layout: layoutType,
      };

      // Determine which fetch method to use based on provided IDs
      let graphData: GraphData;

      if (worldId) {
        graphData = await GraphService.getWorldGraph(worldId, params);
      } else if (campaignId) {
        graphData = await GraphService.getCampaignGraph(campaignId, params);
      } else if (sessionId) {
        graphData = await GraphService.getSessionGraph(sessionId, params);
      } else if (characterId) {
        graphData = await GraphService.getCharacterGraph(characterId, params);
      } else if (locationId) {
        graphData = await GraphService.getLocationGraph(locationId, params);
      } else if (itemId) {
        graphData = await GraphService.getItemGraph(itemId, params);
      } else if (eventId) {
        graphData = await GraphService.getEventGraph(eventId, params);
      } else if (powerId) {
        graphData = await GraphService.getPowerGraph(powerId, params);
      } else {
        // Default to mind map if no specific ID is provided
        graphData = await GraphService.getMindMapGraph(params);
      }

      // Convert graph data to ReactFlow format
      const { nodes: reactFlowNodes, edges: reactFlowEdges } = convertGraphDataToReactFlow(graphData);

      // Apply layout
      const positionedNodes = applyForceDirectedLayout(reactFlowNodes, reactFlowEdges);

      // Update state
      setNodes(positionedNodes);
      setEdges(reactFlowEdges);
    } catch (error) {
      console.error(\Error fetching graph data:\, error);
      setError(\Failed to load relationship data. Please try again.\);
    } finally {
      setLoading(false);
    }
  }, [worldId, campaignId, sessionId, characterId, locationId, itemId, eventId, powerId, depth, nodeTypes, edgeTypes, showImages, layoutType, convertGraphDataToReactFlow, applyForceDirectedLayout, setNodes, setEdges]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Handle node click
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node.data as GraphNode);
    }
  };

  // Handle edge click
  const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    if (onEdgeClick) {
      onEdgeClick(edge.data as GraphEdge);
    }
  };

  // Handle depth change
  const handleDepthChange = (event: Event, newValue: number | number[]) => {
    setDepth(newValue as number);
  };

  // Handle node type filter change
  const handleNodeTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNodeTypes(event.target.value as NodeType[]);
  };

  // Handle edge type filter change
  const handleEdgeTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setEdgeTypes(event.target.value as EdgeType[]);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchGraphData();
  };

  // Render loading state
  if (loading && nodes.length === 0) {
    return (
      <Box
        sx={{
          height,
          width,
          display: \flex\,
          justifyContent: \center\,
          alignItems: \center\,
          bgcolor: \background.paper\,
          borderRadius: 1,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error && nodes.length === 0) {
    return (
      <Box
        sx={{
          height,
          width,
          display: \flex\,
          justifyContent: \center\,
          alignItems: \center\,
          bgcolor: \background.paper\,
          borderRadius: 1,
        }}
      >
        <Alert severity=\error\>{error}</Alert>
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        height,
        width,
        overflow: \hidden\,
        borderRadius: 1,
        position: \relative\,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        {showControls && <Controls />}
        <Background />
        {showMiniMap && <MiniMap />}

        {showFilters && (
          <Panel position=\top-right\>
            <Paper sx={{ p: 2, width: 300 }}>
              <Typography variant=\h6\ gutterBottom>
                Filters
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant=\subtitle2\ gutterBottom>
                  Depth: {depth}
                </Typography>
                <Slider
                  value={depth}
                  onChange={handleDepthChange}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay=\auto\
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size=\small\>
                  <InputLabel id=\node-type-filter-label\>Node Types</InputLabel>
                  <Select
                    labelId=\node-type-filter-label\
                    multiple
                    value={nodeTypes}
                    onChange={handleNodeTypeChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: \flex\, flexWrap: \wrap\, gap: 0.5 }}>
                        {(selected as NodeType[]).map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            size=\small\
                            sx={{ bgcolor: nodeTypeColors[value] }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.keys(nodeTypeColors).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size=\small\>
                  <InputLabel id=\edge-type-filter-label\>Edge Types</InputLabel>
                  <Select
                    labelId=\edge-type-filter-label\
                    multiple
                    value={edgeTypes}
                    onChange={handleEdgeTypeChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: \flex\, flexWrap: \wrap\, gap: 0.5 }}>
                        {(selected as EdgeType[]).map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            size=\small\
                            sx={{ bgcolor: edgeTypeColors[value] }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.keys(edgeTypeColors).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.replace(\_\, \ \)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                    />
                  }
                  label=\Show Labels\
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showImages}
                      onChange={(e) => setShowImages(e.target.checked)}
                    />
                  }
                  label=\Show Images\
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size=\small\>
                  <InputLabel id=\layout-type-label\>Layout</InputLabel>
                  <Select
                    labelId=\layout-type-label\
                    value={layoutType}
                    onChange={(e) => setLayoutType(e.target.value as 'force' | 'hierarchy' | 'radial')}
                  >
                    <MenuItem value=\force\>Force-Directed</MenuItem>
                    <MenuItem value=\hierarchy\>Hierarchical</MenuItem>
                    <MenuItem value=\radial\>Radial</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: \flex\, justifyContent: \flex-end\ }}>
                <Tooltip title=\Refresh\>
                  <IconButton onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Panel>
        )}
      </ReactFlow>
    </Paper>
  );
};

export default RelationshipGraph;
