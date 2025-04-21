import { DatabaseService } from '../services/database.service';
import {
  ChangeProposal,
  ProposalStatus,
  ProposalType,
  ProposalEntityType,
  ProposalComment,
  ProposalBatch,
  ProposalFilterOptions,
  ProposalTemplate
} from '../models/change-proposal.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for change proposals
 */
export class ChangeProposalRepository {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Create a new change proposal
   * @param proposal Change proposal
   * @returns Created change proposal
   */
  public async createProposal(proposal: Omit<ChangeProposal, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChangeProposal> {
    try {
      const now = Date.now();
      const proposalId = uuidv4();
      
      const newProposal: ChangeProposal = {
        ...proposal,
        id: proposalId,
        createdAt: now,
        updatedAt: now,
        status: ProposalStatus.PENDING,
        comments: []
      };

      const query = `
        CREATE (p:ChangeProposal $proposal)
        RETURN p {.*} as proposal
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { proposal: newProposal });
        return result.records[0].get('proposal');
      });

      // If this proposal is related to an entity, create a relationship
      if (newProposal.entityId) {
        await this.linkProposalToEntity(newProposal);
      }

      // If this proposal has context, create a relationship
      if (newProposal.contextId) {
        await this.linkProposalToContext(newProposal);
      }

      return result;
    } catch (error) {
      console.error('Error creating change proposal:', error);
      throw error;
    }
  }

  /**
   * Link proposal to entity
   * @param proposal Change proposal
   */
  private async linkProposalToEntity(proposal: ChangeProposal): Promise<void> {
    try {
      let entityLabel: string;
      
      switch (proposal.entityType) {
        case ProposalEntityType.WORLD:
          entityLabel = 'RPGWorld';
          break;
        case ProposalEntityType.CAMPAIGN:
          entityLabel = 'Campaign';
          break;
        case ProposalEntityType.SESSION:
          entityLabel = 'Session';
          break;
        case ProposalEntityType.CHARACTER:
          entityLabel = 'Character';
          break;
        case ProposalEntityType.LOCATION:
          entityLabel = 'Location';
          break;
        case ProposalEntityType.ITEM:
          entityLabel = 'Item';
          break;
        case ProposalEntityType.EVENT:
          entityLabel = 'Event';
          break;
        case ProposalEntityType.POWER:
          entityLabel = 'Power';
          break;
        default:
          return; // No valid entity type
      }

      const query = `
        MATCH (p:ChangeProposal {id: $proposalId})
        MATCH (e:${entityLabel} {id: $entityId})
        CREATE (p)-[:PROPOSES_CHANGE_TO]->(e)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { 
          proposalId: proposal.id, 
          entityId: proposal.entityId 
        });
      });
    } catch (error) {
      console.error('Error linking proposal to entity:', error);
      throw error;
    }
  }

  /**
   * Link proposal to context
   * @param proposal Change proposal
   */
  private async linkProposalToContext(proposal: ChangeProposal): Promise<void> {
    try {
      const query = `
        MATCH (p:ChangeProposal {id: $proposalId})
        MATCH (c) WHERE c.id = $contextId AND (c:Campaign OR c:Session)
        CREATE (p)-[:HAS_CONTEXT]->(c)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { 
          proposalId: proposal.id, 
          contextId: proposal.contextId 
        });
      });
    } catch (error) {
      console.error('Error linking proposal to context:', error);
      throw error;
    }
  }

  /**
   * Get change proposal by ID
   * @param proposalId Proposal ID
   * @returns Change proposal
   */
  public async getProposal(proposalId: string): Promise<ChangeProposal | null> {
    try {
      const query = `
        MATCH (p:ChangeProposal {id: $proposalId})
        OPTIONAL MATCH (p)-[:PROPOSES_CHANGE_TO]->(e)
        OPTIONAL MATCH (p)-[:HAS_CONTEXT]->(c)
        RETURN p {
          .*,
          entityDetails: CASE WHEN e IS NOT NULL THEN {
            id: e.id,
            name: e.name,
            type: labels(e)[0]
          } ELSE NULL END,
          contextDetails: CASE WHEN c IS NOT NULL THEN {
            id: c.id,
            name: c.name,
            type: labels(c)[0]
          } ELSE NULL END
        } as proposal
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { proposalId });
        return result.records.length > 0 ? result.records[0].get('proposal') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting change proposal:', error);
      throw error;
    }
  }

  /**
   * Get all change proposals with optional filtering
   * @param filter Filter options
   * @returns Change proposals
   */
  public async getProposals(filter?: ProposalFilterOptions): Promise<ChangeProposal[]> {
    try {
      let whereClause = '';
      const params: Record<string, any> = {};

      if (filter) {
        const conditions: string[] = [];

        if (filter.status && filter.status.length > 0) {
          conditions.push('p.status IN $statuses');
          params.statuses = filter.status;
        }

        if (filter.type && filter.type.length > 0) {
          conditions.push('p.type IN $types');
          params.types = filter.type;
        }

        if (filter.entityType && filter.entityType.length > 0) {
          conditions.push('p.entityType IN $entityTypes');
          params.entityTypes = filter.entityType;
        }

        if (filter.entityId) {
          conditions.push('p.entityId = $entityId');
          params.entityId = filter.entityId;
        }

        if (filter.contextId) {
          conditions.push('p.contextId = $contextId');
          params.contextId = filter.contextId;
        }

        if (filter.createdBy) {
          conditions.push('p.createdBy = $createdBy');
          params.createdBy = filter.createdBy;
        }

        if (filter.createdAfter) {
          conditions.push('p.createdAt >= $createdAfter');
          params.createdAfter = filter.createdAfter;
        }

        if (filter.createdBefore) {
          conditions.push('p.createdAt <= $createdBefore');
          params.createdBefore = filter.createdBefore;
        }

        if (filter.search) {
          conditions.push('(p.title CONTAINS $search OR p.description CONTAINS $search)');
          params.search = filter.search;
        }

        if (conditions.length > 0) {
          whereClause = 'WHERE ' + conditions.join(' AND ');
        }
      }

      const query = `
        MATCH (p:ChangeProposal)
        ${whereClause}
        OPTIONAL MATCH (p)-[:PROPOSES_CHANGE_TO]->(e)
        OPTIONAL MATCH (p)-[:HAS_CONTEXT]->(c)
        RETURN p {
          .*,
          entityDetails: CASE WHEN e IS NOT NULL THEN {
            id: e.id,
            name: e.name,
            type: labels(e)[0]
          } ELSE NULL END,
          contextDetails: CASE WHEN c IS NOT NULL THEN {
            id: c.id,
            name: c.name,
            type: labels(c)[0]
          } ELSE NULL END
        } as proposal
        ORDER BY p.updatedAt DESC
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, params);
        return result.records.map(record => record.get('proposal'));
      });

      return result;
    } catch (error) {
      console.error('Error getting change proposals:', error);
      throw error;
    }
  }

  /**
   * Update change proposal
   * @param proposalId Proposal ID
   * @param proposal Updated proposal data
   * @returns Updated change proposal
   */
  public async updateProposal(
    proposalId: string,
    proposal: Partial<Omit<ChangeProposal, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ChangeProposal> {
    try {
      const updateData = {
        ...proposal,
        updatedAt: Date.now()
      };

      const query = `
        MATCH (p:ChangeProposal {id: $proposalId})
        SET p += $updateData
        RETURN p {.*} as proposal
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { 
          proposalId,
          updateData
        });
        return result.records[0].get('proposal');
      });

      return result;
    } catch (error) {
      console.error('Error updating change proposal:', error);
      throw error;
    }
  }

  /**
   * Delete change proposal
   * @param proposalId Proposal ID
   * @returns True if deleted
   */
  public async deleteProposal(proposalId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (p:ChangeProposal {id: $proposalId})
        DETACH DELETE p
        RETURN count(p) as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { proposalId });
        return result.records[0].get('deleted') > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting change proposal:', error);
      throw error;
    }
  }

  /**
   * Add comment to proposal
   * @param proposalId Proposal ID
   * @param comment Comment data
   * @returns Updated proposal
   */
  public async addComment(
    proposalId: string,
    comment: Omit<ProposalComment, 'id' | 'createdAt'>
  ): Promise<ChangeProposal> {
    try {
      const commentId = uuidv4();
      const now = Date.now();
      
      const newComment: ProposalComment = {
        ...comment,
        id: commentId,
        createdAt: now
      };

      const query = `
        MATCH (p:ChangeProposal {id: $proposalId})
        SET p.comments = CASE 
          WHEN p.comments IS NULL THEN [$newComment] 
          ELSE p.comments + $newComment 
        END,
        p.updatedAt = $now
        RETURN p {.*} as proposal
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { 
          proposalId,
          newComment,
          now
        });
        return result.records[0].get('proposal');
      });

      return result;
    } catch (error) {
      console.error('Error adding comment to proposal:', error);
      throw error;
    }
  }

  /**
   * Create proposal batch
   * @param batch Proposal batch
   * @returns Created batch
   */
  public async createBatch(batch: Omit<ProposalBatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProposalBatch> {
    try {
      const now = Date.now();
      const batchId = uuidv4();
      
      const newBatch: ProposalBatch = {
        ...batch,
        id: batchId,
        createdAt: now,
        updatedAt: now
      };

      const query = `
        CREATE (b:ProposalBatch $batch)
        RETURN b {.*} as batch
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { batch: newBatch });
        return result.records[0].get('batch');
      });

      // Create relationships to proposals
      if (newBatch.proposalIds.length > 0) {
        await this.linkBatchToProposals(newBatch);
      }

      // If this batch has context, create a relationship
      if (newBatch.contextId) {
        await this.linkBatchToContext(newBatch);
      }

      return result;
    } catch (error) {
      console.error('Error creating proposal batch:', error);
      throw error;
    }
  }

  /**
   * Link batch to proposals
   * @param batch Proposal batch
   */
  private async linkBatchToProposals(batch: ProposalBatch): Promise<void> {
    try {
      const query = `
        MATCH (b:ProposalBatch {id: $batchId})
        MATCH (p:ChangeProposal)
        WHERE p.id IN $proposalIds
        CREATE (b)-[:CONTAINS]->(p)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { 
          batchId: batch.id, 
          proposalIds: batch.proposalIds 
        });
      });
    } catch (error) {
      console.error('Error linking batch to proposals:', error);
      throw error;
    }
  }

  /**
   * Link batch to context
   * @param batch Proposal batch
   */
  private async linkBatchToContext(batch: ProposalBatch): Promise<void> {
    try {
      const query = `
        MATCH (b:ProposalBatch {id: $batchId})
        MATCH (c) WHERE c.id = $contextId AND (c:Campaign OR c:Session)
        CREATE (b)-[:HAS_CONTEXT]->(c)
      `;

      await this.dbService.writeTransaction(async (tx) => {
        await tx.run(query, { 
          batchId: batch.id, 
          contextId: batch.contextId 
        });
      });
    } catch (error) {
      console.error('Error linking batch to context:', error);
      throw error;
    }
  }

  /**
   * Get proposal batch by ID
   * @param batchId Batch ID
   * @returns Proposal batch
   */
  public async getBatch(batchId: string): Promise<ProposalBatch | null> {
    try {
      const query = `
        MATCH (b:ProposalBatch {id: $batchId})
        OPTIONAL MATCH (b)-[:CONTAINS]->(p:ChangeProposal)
        OPTIONAL MATCH (b)-[:HAS_CONTEXT]->(c)
        RETURN b {
          .*,
          proposals: collect(p {.*}),
          contextDetails: CASE WHEN c IS NOT NULL THEN {
            id: c.id,
            name: c.name,
            type: labels(c)[0]
          } ELSE NULL END
        } as batch
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { batchId });
        return result.records.length > 0 ? result.records[0].get('batch') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting proposal batch:', error);
      throw error;
    }
  }

  /**
   * Get all proposal batches
   * @param contextId Optional context ID to filter by
   * @returns Proposal batches
   */
  public async getBatches(contextId?: string): Promise<ProposalBatch[]> {
    try {
      let whereClause = '';
      const params: Record<string, any> = {};

      if (contextId) {
        whereClause = 'WHERE b.contextId = $contextId';
        params.contextId = contextId;
      }

      const query = `
        MATCH (b:ProposalBatch)
        ${whereClause}
        OPTIONAL MATCH (b)-[:CONTAINS]->(p:ChangeProposal)
        OPTIONAL MATCH (b)-[:HAS_CONTEXT]->(c)
        RETURN b {
          .*,
          proposalCount: count(p),
          contextDetails: CASE WHEN c IS NOT NULL THEN {
            id: c.id,
            name: c.name,
            type: labels(c)[0]
          } ELSE NULL END
        } as batch
        ORDER BY b.updatedAt DESC
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, params);
        return result.records.map(record => record.get('batch'));
      });

      return result;
    } catch (error) {
      console.error('Error getting proposal batches:', error);
      throw error;
    }
  }

  /**
   * Update proposal batch
   * @param batchId Batch ID
   * @param batch Updated batch data
   * @returns Updated proposal batch
   */
  public async updateBatch(
    batchId: string,
    batch: Partial<Omit<ProposalBatch, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ProposalBatch> {
    try {
      const updateData = {
        ...batch,
        updatedAt: Date.now()
      };

      const query = `
        MATCH (b:ProposalBatch {id: $batchId})
        SET b += $updateData
        RETURN b {.*} as batch
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { 
          batchId,
          updateData
        });
        return result.records[0].get('batch');
      });

      return result;
    } catch (error) {
      console.error('Error updating proposal batch:', error);
      throw error;
    }
  }

  /**
   * Delete proposal batch
   * @param batchId Batch ID
   * @returns True if deleted
   */
  public async deleteBatch(batchId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (b:ProposalBatch {id: $batchId})
        DETACH DELETE b
        RETURN count(b) as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { batchId });
        return result.records[0].get('deleted') > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting proposal batch:', error);
      throw error;
    }
  }

  /**
   * Create proposal template
   * @param template Proposal template
   * @returns Created template
   */
  public async createTemplate(template: Omit<ProposalTemplate, 'id'>): Promise<ProposalTemplate> {
    try {
      const templateId = uuidv4();
      
      const newTemplate: ProposalTemplate = {
        ...template,
        id: templateId
      };

      const query = `
        CREATE (t:ProposalTemplate $template)
        RETURN t {.*} as template
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { template: newTemplate });
        return result.records[0].get('template');
      });

      return result;
    } catch (error) {
      console.error('Error creating proposal template:', error);
      throw error;
    }
  }

  /**
   * Get proposal template by ID
   * @param templateId Template ID
   * @returns Proposal template
   */
  public async getTemplate(templateId: string): Promise<ProposalTemplate | null> {
    try {
      const query = `
        MATCH (t:ProposalTemplate {id: $templateId})
        RETURN t {.*} as template
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { templateId });
        return result.records.length > 0 ? result.records[0].get('template') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting proposal template:', error);
      throw error;
    }
  }

  /**
   * Get all proposal templates
   * @param entityType Optional entity type to filter by
   * @returns Proposal templates
   */
  public async getTemplates(entityType?: ProposalEntityType): Promise<ProposalTemplate[]> {
    try {
      let whereClause = '';
      const params: Record<string, any> = {};

      if (entityType) {
        whereClause = 'WHERE t.entityType = $entityType';
        params.entityType = entityType;
      }

      const query = `
        MATCH (t:ProposalTemplate)
        ${whereClause}
        RETURN t {.*} as template
        ORDER BY t.name
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, params);
        return result.records.map(record => record.get('template'));
      });

      return result;
    } catch (error) {
      console.error('Error getting proposal templates:', error);
      throw error;
    }
  }

  /**
   * Update proposal template
   * @param templateId Template ID
   * @param template Updated template data
   * @returns Updated proposal template
   */
  public async updateTemplate(
    templateId: string,
    template: Partial<Omit<ProposalTemplate, 'id'>>
  ): Promise<ProposalTemplate> {
    try {
      const query = `
        MATCH (t:ProposalTemplate {id: $templateId})
        SET t += $updateData
        RETURN t {.*} as template
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { 
          templateId,
          updateData: template
        });
        return result.records[0].get('template');
      });

      return result;
    } catch (error) {
      console.error('Error updating proposal template:', error);
      throw error;
    }
  }

  /**
   * Delete proposal template
   * @param templateId Template ID
   * @returns True if deleted
   */
  public async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (t:ProposalTemplate {id: $templateId})
        DELETE t
        RETURN count(t) as deleted
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { templateId });
        return result.records[0].get('deleted') > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting proposal template:', error);
      throw error;
    }
  }
}
