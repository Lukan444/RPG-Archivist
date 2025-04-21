import { apiClient } from './api-client';
import { AxiosResponse } from 'axios';

// Change proposal status
export enum ProposalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  MODIFIED = 'modified'
}

// Change proposal type
export enum ProposalType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RELATE = 'relate'
}

// Entity type for change proposals
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

// Change field
export interface ChangeField {
  field: string;
  oldValue?: any;
  newValue: any;
  description?: string;
}

// Relationship change
export interface RelationshipChange {
  sourceId: string;
  sourceType: ProposalEntityType;
  targetId: string;
  targetType: ProposalEntityType;
  relationshipType: string;
  properties?: Record<string, any>;
}

// Proposal comment
export interface ProposalComment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: number;
}

// Change proposal
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
  contextId?: string;
  promptId?: string;
  llmModel?: string;
  metadata?: Record<string, any>;
  entityDetails?: {
    id: string;
    name: string;
    type: string;
  };
  contextDetails?: {
    id: string;
    name: string;
    type: string;
  };
}

// Proposal generation request
export interface ProposalGenerationRequest {
  entityType: ProposalEntityType;
  entityId?: string;
  contextId?: string;
  promptId?: string;
  customPrompt?: string;
  model?: string;
  options?: Record<string, any>;
}

// Proposal filter options
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

// Proposal application result
export interface ProposalApplicationResult {
  success: boolean;
  proposalId: string;
  entityId?: string;
  message: string;
  details?: Record<string, any>;
}

// Proposal template
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

/**
 * Change proposal service for interacting with the change proposal API
 */
export const ChangeProposalService = {
  /**
   * Get change proposal by ID
   * @param id Proposal ID
   * @returns Change proposal
   */
  getProposal: async (id: string): Promise<ChangeProposal> => {
    const response: AxiosResponse<{ success: boolean; data: ChangeProposal }> = await apiClient.get(`/proposals/${id}`);
    return response.data.data;
  },

  /**
   * Get all change proposals with optional filtering
   * @param filter Filter options
   * @returns Change proposals
   */
  getProposals: async (filter?: ProposalFilterOptions): Promise<ChangeProposal[]> => {
    // Build query parameters
    const params: Record<string, string> = {};
    
    if (filter) {
      if (filter.status && filter.status.length > 0) {
        params.status = filter.status.join(',');
      }
      
      if (filter.type && filter.type.length > 0) {
        params.type = filter.type.join(',');
      }
      
      if (filter.entityType && filter.entityType.length > 0) {
        params.entityType = filter.entityType.join(',');
      }
      
      if (filter.entityId) {
        params.entityId = filter.entityId;
      }
      
      if (filter.contextId) {
        params.contextId = filter.contextId;
      }
      
      if (filter.createdBy) {
        params.createdBy = filter.createdBy;
      }
      
      if (filter.createdAfter) {
        params.createdAfter = filter.createdAfter.toString();
      }
      
      if (filter.createdBefore) {
        params.createdBefore = filter.createdBefore.toString();
      }
      
      if (filter.search) {
        params.search = filter.search;
      }
    }
    
    const response: AxiosResponse<{ success: boolean; data: ChangeProposal[] }> = await apiClient.get('/proposals', {
      params
    });
    
    return response.data.data;
  },

  /**
   * Create a new change proposal
   * @param proposal Change proposal
   * @returns Created change proposal
   */
  createProposal: async (proposal: Omit<ChangeProposal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>): Promise<ChangeProposal> => {
    const response: AxiosResponse<{ success: boolean; data: ChangeProposal }> = await apiClient.post('/proposals', proposal);
    return response.data.data;
  },

  /**
   * Update change proposal
   * @param id Proposal ID
   * @param proposal Updated proposal data
   * @returns Updated change proposal
   */
  updateProposal: async (id: string, proposal: Partial<Omit<ChangeProposal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ChangeProposal> => {
    const response: AxiosResponse<{ success: boolean; data: ChangeProposal }> = await apiClient.put(`/proposals/${id}`, proposal);
    return response.data.data;
  },

  /**
   * Delete change proposal
   * @param id Proposal ID
   * @returns Success message
   */
  deleteProposal: async (id: string): Promise<{ message: string }> => {
    const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await apiClient.delete(`/proposals/${id}`);
    return response.data.data;
  },

  /**
   * Add comment to proposal
   * @param id Proposal ID
   * @param content Comment content
   * @returns Updated proposal
   */
  addComment: async (id: string, content: string): Promise<ChangeProposal> => {
    const response: AxiosResponse<{ success: boolean; data: ChangeProposal }> = await apiClient.post(`/proposals/${id}/comments`, { content });
    return response.data.data;
  },

  /**
   * Review proposal
   * @param id Proposal ID
   * @param status New status
   * @param comment Optional comment
   * @returns Updated proposal
   */
  reviewProposal: async (id: string, status: ProposalStatus, comment?: string): Promise<ChangeProposal> => {
    const response: AxiosResponse<{ success: boolean; data: ChangeProposal }> = await apiClient.post(`/proposals/${id}/review`, { status, comment });
    return response.data.data;
  },

  /**
   * Apply proposal changes to the entity
   * @param id Proposal ID
   * @returns Application result
   */
  applyProposal: async (id: string): Promise<ProposalApplicationResult> => {
    const response: AxiosResponse<{ success: boolean; data: ProposalApplicationResult }> = await apiClient.post(`/proposals/${id}/apply`);
    return response.data.data;
  },

  /**
   * Generate proposal using LLM
   * @param request Generation request
   * @returns Generated proposal
   */
  generateProposal: async (request: ProposalGenerationRequest): Promise<ChangeProposal> => {
    const response: AxiosResponse<{ success: boolean; data: ChangeProposal }> = await apiClient.post('/proposals/generate', request);
    return response.data.data;
  },

  /**
   * Get proposal template by ID
   * @param id Template ID
   * @returns Proposal template
   */
  getTemplate: async (id: string): Promise<ProposalTemplate> => {
    const response: AxiosResponse<{ success: boolean; data: ProposalTemplate }> = await apiClient.get(`/proposals/templates/${id}`);
    return response.data.data;
  },

  /**
   * Get all proposal templates
   * @param entityType Optional entity type to filter by
   * @returns Proposal templates
   */
  getTemplates: async (entityType?: ProposalEntityType): Promise<ProposalTemplate[]> => {
    const params: Record<string, string> = {};
    
    if (entityType) {
      params.entityType = entityType;
    }
    
    const response: AxiosResponse<{ success: boolean; data: ProposalTemplate[] }> = await apiClient.get('/proposals/templates', {
      params
    });
    
    return response.data.data;
  },

  /**
   * Create proposal template
   * @param template Proposal template
   * @returns Created template
   */
  createTemplate: async (template: Omit<ProposalTemplate, 'id'>): Promise<ProposalTemplate> => {
    const response: AxiosResponse<{ success: boolean; data: ProposalTemplate }> = await apiClient.post('/proposals/templates', template);
    return response.data.data;
  },

  /**
   * Update proposal template
   * @param id Template ID
   * @param template Updated template data
   * @returns Updated proposal template
   */
  updateTemplate: async (id: string, template: Partial<Omit<ProposalTemplate, 'id'>>): Promise<ProposalTemplate> => {
    const response: AxiosResponse<{ success: boolean; data: ProposalTemplate }> = await apiClient.put(`/proposals/templates/${id}`, template);
    return response.data.data;
  },

  /**
   * Delete proposal template
   * @param id Template ID
   * @returns Success message
   */
  deleteTemplate: async (id: string): Promise<{ message: string }> => {
    const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await apiClient.delete(`/proposals/templates/${id}`);
    return response.data.data;
  }
};
