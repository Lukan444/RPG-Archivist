/**
 * Change proposal models
 */

/**
 * Change proposal status
 */
export enum ProposalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  MODIFIED = 'modified'
}

/**
 * Change proposal type
 */
export enum ProposalType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RELATE = 'relate'
}

/**
 * Entity type for change proposals
 */
export enum ProposalEntityType {
  WORLD = 'world',
  CAMPAIGN = 'campaign',
  SESSION = 'session',
  CHARACTER = 'character',
  LOCATION = 'location',
  ITEM = 'item',
  EVENT = 'event',
  POWER = 'power',
  RELATIONSHIP = 'relationship'
}

/**
 * Change field
 */
export interface ChangeField {
  field: string;
  oldValue?: any;
  newValue: any;
  description?: string;
}

/**
 * Relationship change
 */
export interface RelationshipChange {
  sourceId: string;
  sourceType: ProposalEntityType;
  targetId: string;
  targetType: ProposalEntityType;
  relationshipType: string;
  properties?: Record<string, any>;
}

/**
 * Change proposal
 */
export interface ChangeProposal {
  id: string;
  type: ProposalType;
  entityType: ProposalEntityType;
  entityId?: string;
  title: string;
  description: string;
  reason: string;
  status: ProposalStatus;
  changes: ChangeField[];
  relationshipChanges?: RelationshipChange[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  reviewedBy?: string;
  reviewedAt?: number;
  comments?: ProposalComment[];
  contextId?: string; // Campaign or session ID for context
  promptId?: string; // ID of the prompt template used
  llmModel?: string; // ID of the LLM model used
  metadata?: Record<string, any>;
}

/**
 * Proposal comment
 */
export interface ProposalComment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: number;
}

/**
 * Proposal batch
 */
export interface ProposalBatch {
  id: string;
  title: string;
  description: string;
  proposalIds: string[];
  status: ProposalStatus;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  contextId?: string;
}

/**
 * Proposal generation request
 */
export interface ProposalGenerationRequest {
  entityType: ProposalEntityType;
  entityId?: string;
  contextId?: string;
  promptId?: string;
  customPrompt?: string;
  model?: string;
  options?: Record<string, any>;
}

/**
 * Proposal filter options
 */
export interface ProposalFilterOptions {
  status?: ProposalStatus[];
  type?: ProposalType[];
  entityType?: ProposalEntityType[];
  entityId?: string;
  contextId?: string;
  createdBy?: string;
  createdAfter?: number;
  createdBefore?: number;
  search?: string;
}

/**
 * Proposal application result
 */
export interface ProposalApplicationResult {
  success: boolean;
  proposalId: string;
  entityId?: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Proposal template
 */
export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  entityType: ProposalEntityType;
  promptTemplate: string;
  systemPrompt?: string;
  defaultModel?: string;
  requiredContext?: boolean;
  metadata?: Record<string, any>;
}
