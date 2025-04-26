import { ChangeProposalRepository } from '../repositories/change-proposal.repository';
import { LLMService } from './llm.service';
import { DatabaseService } from './database.service';
import {
  ChangeProposal,
  ProposalStatus,
  ProposalType,
  ProposalEntityType,
  ProposalComment,
  ProposalGenerationRequest,
  ProposalFilterOptions,
  ProposalApplicationResult,
  ProposalTemplate,
  ChangeField,
  RelationshipChange
} from '../models/change-proposal.model';
import { LLMMessage, LLMMessageRole } from '../models/llm.model';
import { RPGWorldRepository } from '../repositories/rpg-world.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { SessionRepository } from '../repositories/session.repository';
import { CharacterRepository } from '../repositories/character.repository';
import { LocationRepository } from '../repositories/location.repository';
import { ItemRepository } from '../repositories/item.repository';
import { EventRepository } from '../repositories/event.repository';
import { PowerRepository } from '../repositories/power.repository';
import { RepositoryFactory } from '../repositories/repository.factory';

/**
 * Service for change proposals
 */
export class ChangeProposalService {
  private changeProposalRepository: ChangeProposalRepository;
  private llmService: LLMService;
  private dbService: DatabaseService;
  private repositoryFactory: RepositoryFactory;

  constructor(
    changeProposalRepository: ChangeProposalRepository,
    llmService: LLMService,
    dbService: DatabaseService,
    repositoryFactory: RepositoryFactory
  ) {
    this.changeProposalRepository = changeProposalRepository;
    this.llmService = llmService;
    this.dbService = dbService;
    this.repositoryFactory = repositoryFactory;
  }

  /**
   * Get change proposal by ID
   * @param proposalId Proposal ID
   * @returns Change proposal
   */
  public async getProposal(proposalId: string): Promise<ChangeProposal | null> {
    return this.changeProposalRepository.getProposal(proposalId);
  }

  /**
   * Get all change proposals with optional filtering
   * @param filter Filter options
   * @returns Change proposals
   */
  public async getProposals(filter?: ProposalFilterOptions): Promise<ChangeProposal[]> {
    return this.changeProposalRepository.getProposals(filter);
  }

  /**
   * Create a new change proposal
   * @param proposal Change proposal
   * @param userId User ID
   * @returns Created change proposal
   */
  public async createProposal(
    proposal: Omit<ChangeProposal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>,
    userId: string
  ): Promise<ChangeProposal> {
    const newProposal = {
      ...proposal,
      createdBy: userId,
      status: ProposalStatus.PENDING
    };

    return this.changeProposalRepository.createProposal(newProposal);
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
    return this.changeProposalRepository.updateProposal(proposalId, proposal);
  }

  /**
   * Delete change proposal
   * @param proposalId Proposal ID
   * @returns True if deleted
   */
  public async deleteProposal(proposalId: string): Promise<boolean> {
    return this.changeProposalRepository.deleteProposal(proposalId);
  }

  /**
   * Add comment to proposal
   * @param proposalId Proposal ID
   * @param content Comment content
   * @param userId User ID
   * @returns Updated proposal
   */
  public async addComment(
    proposalId: string,
    content: string,
    userId: string
  ): Promise<ChangeProposal> {
    const comment: Omit<ProposalComment, 'id' | 'createdAt'> = {
      content,
      createdBy: userId
    };

    return this.changeProposalRepository.addComment(proposalId, comment);
  }

  /**
   * Review proposal
   * @param proposalId Proposal ID
   * @param status New status
   * @param userId User ID
   * @param comment Optional comment
   * @returns Updated proposal
   */
  public async reviewProposal(
    proposalId: string,
    status: ProposalStatus,
    userId: string,
    comment?: string
  ): Promise<ChangeProposal> {
    const updateData: Partial<ChangeProposal> = {
      status,
      reviewedBy: userId,
      reviewedAt: Date.now()
    };

    const updatedProposal = await this.changeProposalRepository.updateProposal(proposalId, updateData);

    if (comment) {
      await this.addComment(proposalId, comment, userId);
    }

    return updatedProposal;
  }

  /**
   * Apply proposal changes to the entity
   * @param proposalId Proposal ID
   * @param userId User ID
   * @returns Application result
   */
  public async applyProposal(proposalId: string, userId: string): Promise<ProposalApplicationResult> {
    try {
      // Get the proposal
      const proposal = await this.changeProposalRepository.getProposal(proposalId);

      if (!proposal) {
        return {
          success: false,
          proposalId,
          message: 'Proposal not found'
        };
      }

      // Check if proposal is approved
      if (proposal.status !== ProposalStatus.APPROVED) {
        return {
          success: false,
          proposalId,
          message: 'Proposal must be approved before applying changes'
        };
      }

      // Apply changes based on proposal type
      let result: ProposalApplicationResult;

      switch (proposal.type) {
        case ProposalType.CREATE:
          result = await this.applyCreateProposal(proposal);
          break;
        case ProposalType.UPDATE:
          result = await this.applyUpdateProposal(proposal);
          break;
        case ProposalType.DELETE:
          result = await this.applyDeleteProposal(proposal);
          break;
        case ProposalType.RELATE:
          result = await this.applyRelateProposal(proposal);
          break;
        default:
          return {
            success: false,
            proposalId,
            message: 'Unknown proposal type'
          };
      }

      // If successful, update proposal status
      if (result.success) {
        await this.reviewProposal(
          proposalId,
          ProposalStatus.APPROVED,
          userId,
          'Changes applied successfully'
        );
      }

      return result;
    } catch (error) {
      console.error('Error applying proposal:', error);
      return {
        success: false,
        proposalId,
        message: `Error applying proposal: ${error instanceof Error ? error.message : String(error)}`,
        details: { error: String(error) }
      };
    }
  }

  /**
   * Apply create proposal
   * @param proposal Proposal
   * @returns Application result
   */
  private async applyCreateProposal(proposal: ChangeProposal): Promise<ProposalApplicationResult> {
    try {
      // Get the appropriate repository based on entity type
      const repository = this.getRepositoryForEntityType(proposal.entityType);

      if (!repository) {
        return {
          success: false,
          proposalId: proposal.id,
          message: `Unsupported entity type: ${proposal.entityType}`
        };
      }

      // Extract entity data from changes
      const entityData: Record<string, any> = {};

      for (const change of proposal.changes) {
        entityData[change.field] = change.newValue;
      }

      // Create the entity
      const createdEntity = await repository.create(entityData);

      return {
        success: true,
        proposalId: proposal.id,
        entityId: createdEntity.id,
        message: `Successfully created ${proposal.entityType}: ${createdEntity.name || createdEntity.id}`
      };
    } catch (error) {
      console.error('Error applying create proposal:', error);
      return {
        success: false,
        proposalId: proposal.id,
        message: `Error creating entity: ${error instanceof Error ? error.message : String(error)}`,
        details: { error: String(error) }
      };
    }
  }

  /**
   * Apply update proposal
   * @param proposal Proposal
   * @returns Application result
   */
  private async applyUpdateProposal(proposal: ChangeProposal): Promise<ProposalApplicationResult> {
    try {
      // Check if entity ID is provided
      if (!proposal.entityId) {
        return {
          success: false,
          proposalId: proposal.id,
          message: 'Entity ID is required for update proposals'
        };
      }

      // Get the appropriate repository based on entity type
      const repository = this.getRepositoryForEntityType(proposal.entityType);

      if (!repository) {
        return {
          success: false,
          proposalId: proposal.id,
          message: `Unsupported entity type: ${proposal.entityType}`
        };
      }

      // Extract entity data from changes
      const entityData: Record<string, any> = {
        id: proposal.entityId
      };

      for (const change of proposal.changes) {
        entityData[change.field] = change.newValue;
      }

      // Update the entity
      const updatedEntity = await repository.update(proposal.entityId, entityData);

      return {
        success: true,
        proposalId: proposal.id,
        entityId: updatedEntity.id,
        message: `Successfully updated ${proposal.entityType}: ${updatedEntity.name || updatedEntity.id}`
      };
    } catch (error) {
      console.error('Error applying update proposal:', error);
      return {
        success: false,
        proposalId: proposal.id,
        message: `Error updating entity: ${error instanceof Error ? error.message : String(error)}`,
        details: { error: String(error) }
      };
    }
  }

  /**
   * Apply delete proposal
   * @param proposal Proposal
   * @returns Application result
   */
  private async applyDeleteProposal(proposal: ChangeProposal): Promise<ProposalApplicationResult> {
    try {
      // Check if entity ID is provided
      if (!proposal.entityId) {
        return {
          success: false,
          proposalId: proposal.id,
          message: 'Entity ID is required for delete proposals'
        };
      }

      // Get the appropriate repository based on entity type
      const repository = this.getRepositoryForEntityType(proposal.entityType);

      if (!repository) {
        return {
          success: false,
          proposalId: proposal.id,
          message: `Unsupported entity type: ${proposal.entityType}`
        };
      }

      // Delete the entity
      const deleted = await repository.delete(proposal.entityId);

      if (!deleted) {
        return {
          success: false,
          proposalId: proposal.id,
          entityId: proposal.entityId,
          message: `Entity not found or could not be deleted: ${proposal.entityId}`
        };
      }

      return {
        success: true,
        proposalId: proposal.id,
        entityId: proposal.entityId,
        message: `Successfully deleted ${proposal.entityType}: ${proposal.entityId}`
      };
    } catch (error) {
      console.error('Error applying delete proposal:', error);
      return {
        success: false,
        proposalId: proposal.id,
        message: `Error deleting entity: ${error instanceof Error ? error.message : String(error)}`,
        details: { error: String(error) }
      };
    }
  }

  /**
   * Apply relate proposal
   * @param proposal Proposal
   * @returns Application result
   */
  private async applyRelateProposal(proposal: ChangeProposal): Promise<ProposalApplicationResult> {
    try {
      // Check if relationship changes are provided
      if (!proposal.relationshipChanges || proposal.relationshipChanges.length === 0) {
        return {
          success: false,
          proposalId: proposal.id,
          message: 'Relationship changes are required for relate proposals'
        };
      }

      // Apply each relationship change
      const results: { success: boolean; message: string }[] = [];

      for (const relationshipChange of proposal.relationshipChanges) {
        try {
          // Create the relationship using a Cypher query
          const query = `
            MATCH (source) WHERE source.id = $sourceId
            MATCH (target) WHERE target.id = $targetId
            MERGE (source)-[r:${relationshipChange.relationshipType}]->(target)
            ${relationshipChange.properties ? 'SET r = $properties' : ''}
            RETURN source, target
          `;

          await this.dbService.writeTransaction(async (tx) => {
            await tx.run(query, {
              sourceId: relationshipChange.sourceId,
              targetId: relationshipChange.targetId,
              properties: relationshipChange.properties || {}
            });
          });

          results.push({
            success: true,
            message: `Created relationship ${relationshipChange.relationshipType} from ${relationshipChange.sourceId} to ${relationshipChange.targetId}`
          });
        } catch (error) {
          results.push({
            success: false,
            message: `Error creating relationship: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      }

      // Check if all relationships were created successfully
      const allSuccessful = results.every(result => result.success);

      return {
        success: allSuccessful,
        proposalId: proposal.id,
        message: allSuccessful
          ? 'All relationships created successfully'
          : 'Some relationships could not be created',
        details: { results }
      };
    } catch (error) {
      console.error('Error applying relate proposal:', error);
      return {
        success: false,
        proposalId: proposal.id,
        message: `Error creating relationships: ${error instanceof Error ? error.message : String(error)}`,
        details: { error: String(error) }
      };
    }
  }

  /**
   * Get repository for entity type
   * @param entityType Entity type
   * @returns Repository
   */
  private getRepositoryForEntityType(entityType: ProposalEntityType): any {
    switch (entityType) {
      case ProposalEntityType.WORLD:
        return this.repositoryFactory.getRPGWorldRepository();
      case ProposalEntityType.CAMPAIGN:
        return this.repositoryFactory.getCampaignRepository();
      case ProposalEntityType.SESSION:
        return this.repositoryFactory.getSessionRepository();
      case ProposalEntityType.CHARACTER:
        return this.repositoryFactory.getCharacterRepository();
      case ProposalEntityType.LOCATION:
        return this.repositoryFactory.getLocationRepository();
      case ProposalEntityType.ITEM:
        return this.repositoryFactory.getItemRepository();
      case ProposalEntityType.EVENT:
        return this.repositoryFactory.getEventRepository();
      case ProposalEntityType.POWER:
        return this.repositoryFactory.getPowerRepository();
      default:
        return null;
    }
  }

  /**
   * Generate proposal using LLM
   * @param request Generation request
   * @param userId User ID
   * @returns Generated proposal
   */
  public async generateProposal(
    request: ProposalGenerationRequest,
    userId: string
  ): Promise<ChangeProposal> {
    try {
      // Get entity data if entity ID is provided
      let entityData: any = null;

      if (request.entityId) {
        const repository = this.getRepositoryForEntityType(request.entityType);

        if (repository) {
          entityData = await repository.getById(request.entityId);
        }
      }

      // Get context data if context ID is provided
      let contextData: any = null;

      if (request.contextId) {
        // Determine if context is campaign or session
        const campaignRepository = this.repositoryFactory.getCampaignRepository();
        const sessionRepository = this.repositoryFactory.getSessionRepository();

        const campaign = await campaignRepository.getById(request.contextId);

        if (campaign) {
          contextData = campaign;
        } else {
          const session = await sessionRepository.getById(request.contextId);

          if (session) {
            contextData = session;

            // Also get the campaign for additional context
            if (session.campaign_id) {
              const campaign = await campaignRepository.getById(session.campaign_id);

              if (campaign) {
                contextData.campaign = campaign;
              }
            }
          }
        }
      }

      // Get prompt template if provided
      let promptTemplate: ProposalTemplate | null = null;

      if (request.promptId) {
        promptTemplate = await this.changeProposalRepository.getTemplate(request.promptId);
      } else {
        // Get default template for entity type
        const templates = await this.changeProposalRepository.getTemplates(request.entityType);

        if (templates.length > 0) {
          // Find a template that matches the entity type
          promptTemplate = templates.find(t => t.entityType === request.entityType) || templates[0];
        }
      }

      // Build prompt
      let prompt: string;
      let systemPrompt: string = '';

      if (promptTemplate) {
        // Use template
        prompt = promptTemplate.promptTemplate;
        systemPrompt = promptTemplate.systemPrompt || '';

        // Replace variables in template
        const variables: Record<string, any> = {
          entityType: request.entityType,
          entityId: request.entityId || '',
          entityData: entityData ? JSON.stringify(entityData, null, 2) : 'No entity data',
          contextId: request.contextId || '',
          contextData: contextData ? JSON.stringify(contextData, null, 2) : 'No context data'
        };

        // Replace variables in prompt
        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          prompt = prompt.replace(regex, String(value));

          if (systemPrompt) {
            systemPrompt = systemPrompt.replace(regex, String(value));
          }
        }
      } else if (request.customPrompt) {
        // Use custom prompt
        prompt = request.customPrompt;
      } else {
        // Use default prompt
        prompt = this.getDefaultPrompt(request.entityType, entityData, contextData);
        systemPrompt = this.getDefaultSystemPrompt();
      }

      // Prepare messages for LLM
      const messages: LLMMessage[] = [];

      if (systemPrompt) {
        messages.push({
          role: LLMMessageRole.SYSTEM,
          content: systemPrompt
        });
      } else {
        messages.push({
          role: LLMMessageRole.SYSTEM,
          content: this.getDefaultSystemPrompt()
        });
      }

      messages.push({
        role: LLMMessageRole.USER,
        content: prompt
      });

      // Call LLM
      const response = await this.llmService.chat(messages, {
        model: request.model || promptTemplate?.defaultModel,
        ...request.options
      });

      // Parse LLM response to create proposal
      const proposal = this.parseProposalFromLLMResponse(
        response.message.content,
        request.entityType,
        request.entityId,
        request.contextId
      );

      // Create the proposal
      return this.createProposal(proposal, userId);
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw error;
    }
  }

  /**
   * Get default system prompt
   * @returns Default system prompt
   */
  private getDefaultSystemPrompt(): string {
    return `You are an AI assistant for an RPG campaign management system.
Your task is to generate proposals for changes to entities in the system.
Respond in JSON format with the following structure:
{
  "type": "create|update|delete|relate",
  "title": "Brief title of the proposal",
  "description": "Detailed description of the proposal",
  "reason": "Reason for the proposal",
  "changes": [
    {
      "field": "Field name",
      "oldValue": "Current value (for updates)",
      "newValue": "Proposed value",
      "description": "Explanation of the change"
    }
  ],
  "relationshipChanges": [
    {
      "sourceId": "ID of source entity",
      "sourceType": "Type of source entity",
      "targetId": "ID of target entity",
      "targetType": "Type of target entity",
      "relationshipType": "Type of relationship",
      "properties": {
        "property1": "value1"
      }
    }
  ]
}`;
  }

  /**
   * Get default prompt for entity type
   * @param entityType Entity type
   * @param entityData Entity data
   * @param contextData Context data
   * @returns Default prompt
   */
  private getDefaultPrompt(
    entityType: ProposalEntityType,
    entityData: any,
    contextData: any
  ): string {
    let prompt = `Generate a proposal to `;

    if (entityData) {
      prompt += `update the following ${entityType}:\n\n`;
      prompt += `${JSON.stringify(entityData, null, 2)}\n\n`;
    } else {
      prompt += `create a new ${entityType}`;

      if (contextData) {
        prompt += ` in the context of:\n\n`;
        prompt += `${JSON.stringify(contextData, null, 2)}\n\n`;
      } else {
        prompt += `.\n\n`;
      }
    }

    prompt += `Please provide a detailed proposal with changes that would improve or enhance this ${entityType}.`;

    if (contextData) {
      prompt += ` Make sure your proposal is consistent with the context provided.`;
    }

    return prompt;
  }

  /**
   * Parse proposal from LLM response
   * @param response LLM response
   * @param entityType Entity type
   * @param entityId Entity ID
   * @param contextId Context ID
   * @returns Proposal
   */
  private parseProposalFromLLMResponse(
    response: string,
    entityType: ProposalEntityType,
    entityId?: string,
    contextId?: string
  ): Omit<ChangeProposal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'> {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                        response.match(/```\n([\s\S]*?)\n```/) ||
                        response.match(/({[\s\S]*})/);

      let jsonStr = jsonMatch ? jsonMatch[1] : response;

      // Clean up the JSON string
      jsonStr = jsonStr.trim();

      // Parse JSON
      const proposalData = JSON.parse(jsonStr);

      // Create proposal
      const proposal: Omit<ChangeProposal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'> = {
        type: proposalData.type || ProposalType.UPDATE,
        entityType,
        entityId,
        title: proposalData.title || 'Untitled Proposal',
        description: proposalData.description || 'No description provided',
        reason: proposalData.reason || 'No reason provided',
        changes: proposalData.changes || [],
        relationshipChanges: proposalData.relationshipChanges || [],
        contextId,
        comments: []
      };

      return proposal;
    } catch (error) {
      console.error('Error parsing proposal from LLM response:', error);

      // Create a fallback proposal
      return {
        type: ProposalType.UPDATE,
        entityType,
        entityId,
        title: 'Failed to Parse Proposal',
        description: 'The AI generated a response that could not be parsed as a valid proposal.',
        reason: 'Parsing error',
        changes: [],
        relationshipChanges: [],
        contextId,
        comments: [{
          id: 'error',
          content: `Error parsing proposal: ${error instanceof Error ? error.message : String(error)}\n\nRaw response:\n${response}`,
          createdBy: 'system',
          createdAt: Date.now()
        }]
      };
    }
  }

  /**
   * Create proposal template
   * @param template Proposal template
   * @returns Created template
   */
  public async createTemplate(template: Omit<ProposalTemplate, 'id'>): Promise<ProposalTemplate> {
    return this.changeProposalRepository.createTemplate(template);
  }

  /**
   * Get proposal template by ID
   * @param templateId Template ID
   * @returns Proposal template
   */
  public async getTemplate(templateId: string): Promise<ProposalTemplate | null> {
    return this.changeProposalRepository.getTemplate(templateId);
  }

  /**
   * Get all proposal templates
   * @param entityType Optional entity type to filter by
   * @returns Proposal templates
   */
  public async getTemplates(entityType?: ProposalEntityType): Promise<ProposalTemplate[]> {
    return this.changeProposalRepository.getTemplates(entityType);
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
    return this.changeProposalRepository.updateTemplate(templateId, template);
  }

  /**
   * Delete proposal template
   * @param templateId Template ID
   * @returns True if deleted
   */
  public async deleteTemplate(templateId: string): Promise<boolean> {
    return this.changeProposalRepository.deleteTemplate(templateId);
  }
}
