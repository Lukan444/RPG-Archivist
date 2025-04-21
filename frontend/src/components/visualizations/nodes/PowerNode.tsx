import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import EntityNode from './EntityNode';

const PowerNode: React.FC<NodeProps> = (props) => {
  return <EntityNode {...props} />;
};

export default memo(PowerNode);
