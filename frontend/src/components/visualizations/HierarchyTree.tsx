import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper, Typography, Tooltip } from '@mui/material';

// Node types
const nodeTypes = {
  // Custom node types can be defined here
};

// Default node style
const defaultNodeStyle = {
  background: '#f5f5f5',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '10px',
  width: 180,
};

// Edge types with different styles
const edgeTypes = {
  // Custom edge types can be defined here
};

// Props for the HierarchyTree component
interface HierarchyTreeProps {
  nodes?: Node[];
  edges?: Edge[];
  title?: string;
  description?: string;
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
  height?: number | string;
  worldId?: string;
  campaignId?: string;
}

const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  title,
  description,
  onNodeClick,
  onEdgeClick,
  height = 600,
  worldId,
  campaignId,
}) => {
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick]
  );

  // Handle edge click
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge);
      }
    },
    [onEdgeClick]
  );

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ height, border: '1px solid #eee', borderRadius: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#999' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#999',
            },
          }}
          fitView
          attributionPosition="bottom-right"
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Controls />
          <Background color="#f8f8f8" gap={16} />
        </ReactFlow>
      </Box>
    </Paper>
  );
};

export default HierarchyTree;