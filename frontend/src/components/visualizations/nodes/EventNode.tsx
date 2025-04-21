import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import EntityNode from './EntityNode';

const EventNode: React.FC<NodeProps> = (props) => {
  return <EntityNode {...props} />;
};

export default memo(EventNode);
