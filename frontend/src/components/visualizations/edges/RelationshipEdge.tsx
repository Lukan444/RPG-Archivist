import React, { memo } from \ react\;
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from \reactflow\;
import { GraphEdge } from \../../../services/api/graph.service\;

// Edge type colors
const edgeTypeColors: Record<string, string> = {
  PART_OF: \#9e9e9e\, // Gray
  CONTAINS: \#607d8b\, // Blue Gray
  LOCATED_AT: \#ff9800\, // Orange
  PARTICIPATED_IN: \#4caf50\, // Green
  RELATED_TO: \#9c27b0\, // Purple
  PARENT_OF: \#795548\, // Brown
  CHILD_OF: \#8d6e63\, // Light Brown
};

// RelationshipEdge props
interface RelationshipEdgeData extends GraphEdge {
  label?: string;
}

const RelationshipEdge: React.FC<EdgeProps<RelationshipEdgeData>> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  label,
}) => {
  // Get edge path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  // Get color based on edge type
  const color = data?.type ? edgeTypeColors[data.type] || \#ccc\ : \#ccc\;
  
  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: color,
          strokeWidth: 2,
        }}
        className=\react-flow__edge-path\
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: \absolute\,
              transform: 	ranslate(-50%, -50%) translate(px,px),
              background: \rgba 255 255 255 0.75 \,
              padding: \4px 8px\,
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              pointerEvents: \all\,
              border: 1px solid ,
            }}
            className=\nodrag nopan\
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(RelationshipEdge);
