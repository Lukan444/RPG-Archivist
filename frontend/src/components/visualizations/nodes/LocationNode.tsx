import React, { memo } from \ react\;
import { NodeProps } from \reactflow\;
import EntityNode from \./EntityNode\;

const LocationNode: React.FC<NodeProps> = (props) => {
  return <EntityNode {...props} />;
};

export default memo(LocationNode);
