/**
 * Graph models for mind map visualization
 */

/**
 * Node types
 */
export enum NodeType {
  WORLD = 'world',
  CAMPAIGN = 'campaign',
  SESSION = 'session',
  CHARACTER = 'character',
  LOCATION = 'location',
  ITEM = 'item',
  EVENT = 'event',
  POWER = 'power'
}

/**
 * Edge types
 */
export enum EdgeType {
  PART_OF = 'PART_OF',
  CONTAINS = 'CONTAINS',
  LOCATED_AT = 'LOCATED_AT',
  PARTICIPATED_IN = 'PARTICIPATED_IN',
  RELATED_TO = 'RELATED_TO',
  PARENT_OF = 'PARENT_OF',
  CHILD_OF = 'CHILD_OF',
  OWNS = 'OWNS',
  CREATED = 'CREATED',
  HAS_POWER = 'HAS_POWER',
  OCCURRED_AT = 'OCCURRED_AT'
}

/**
 * Graph node
 */
export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  imageUrl?: string;
  properties?: Record<string, any>;
}

/**
 * Graph edge
 */
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  properties?: Record<string, any>;
}

/**
 * Graph data
 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Graph query parameters
 */
export interface GraphQueryParams {
  worldId?: string;
  campaignId?: string;
  sessionId?: string;
  characterId?: string;
  locationId?: string;
  itemId?: string;
  eventId?: string;
  powerId?: string;
  depth?: number;
  nodeTypes?: NodeType[];
  edgeTypes?: EdgeType[];
  includeImages?: boolean;
  layout?: 'force' | 'hierarchy' | 'radial';
}
