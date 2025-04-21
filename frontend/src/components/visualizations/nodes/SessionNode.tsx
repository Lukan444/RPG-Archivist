import React, { memo } from \ react\;
import { NodeProps } from \reactflow\;
import EntityNode from \./EntityNode\;

const SessionNode: React.FC<NodeProps> = (props) => {
  return <EntityNode {...props} />;
};

export default memo(SessionNode);
