import React, { memo } from \ react\;
import { Handle, Position, NodeProps } from \reactflow\;
import { Box, Typography, Avatar } from \@mui/material\;
import { GraphNode } from \../../../services/api/graph.service\;

// Node type icons
import {
  Public as WorldIcon,
  Campaign as CampaignIcon,
  Event as SessionIcon,
  Person as CharacterIcon,
  LocationOn as LocationIcon,
  Inventory as ItemIcon,
  EventNote as EventIcon,
  AutoFixHigh as PowerIcon,
} from \@mui/icons-material\;

// Node type colors
const nodeTypeColors: Record<string, string> = {
  world: \#3f51b5\, // Indigo
  campaign: \#2196f3\, // Blue
  session: \#00bcd4\, // Cyan
  character: \#4caf50\, // Green
  location: \#ff9800\, // Orange
  item: \#f44336\, // Red
  event: \#9c27b0\, // Purple
  power: \#ffc107\, // Amber
};

// Node type icons
const nodeTypeIcons: Record<string, React.ReactNode> = {
  world: <WorldIcon />,
  campaign: <CampaignIcon />,
  session: <SessionIcon />,
  character: <CharacterIcon />,
  location: <LocationIcon />,
  item: <ItemIcon />,
  event: <EventIcon />,
  power: <PowerIcon />,
};

// EntityNode props
interface EntityNodeData extends GraphNode {
  label: string;
  showLabel: boolean;
  showImage: boolean;
}

const EntityNode: React.FC<NodeProps<EntityNodeData>> = ({ data, isConnectable }) => {
  const { type, label, imageUrl, showLabel, showImage } = data;

  // Get color and icon based on node type
  const color = nodeTypeColors[type] || \#ccc\;
  const icon = nodeTypeIcons[type] || null;

  return (
    <Box
      sx={{
        padding: 1,
        borderRadius: 2,
        backgroundColor: \background.paper\,
        border: 2px solid ,
        boxShadow: 2,
        width: 150,
        height: \auto\,
        display: \flex\,
        flexDirection: \column\,
        alignItems: \center\,
        justifyContent: \center\,
        position: \relative\,
      }}
    >
      <Handle
        type=\target\
        position={Position.Top}
        style={{ background: color }}
        isConnectable={isConnectable}
      />

      {showImage && imageUrl ? (
        <Avatar
          src={imageUrl}
          alt={label}
          sx={{
            width: 60,
            height: 60,
            mb: 1,
            border: 2px solid ,
          }}
        />
      ) : (
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mb: 1,
            bgcolor: color,
          }}
        >
          {icon}
        </Avatar>
      )}

      {showLabel && (
        <Typography
          variant=\subtitle2\
          align=\center\
          sx={{
            fontWeight: \bold\,
            overflow: \hidden\,
            textOverflow: \ellipsis\,
            display: \-webkit-box\,
            WebkitLineClamp: 2,
            WebkitBoxOrient: \vertical\,
          }}
        >
          {label}
        </Typography>
      )}

      <Handle
        type=\source\
        position={Position.Bottom}
        style={{ background: color }}
        isConnectable={isConnectable}
      />
    </Box>
  );
};

export default memo(EntityNode);
