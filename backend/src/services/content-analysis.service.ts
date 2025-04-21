import { ContentAnalysisRepository } from '../repositories/content-analysis.repository';
import { LLMService } from './llm.service';
import { SessionAnalysisService } from './session-analysis.service';
import { TranscriptionService } from './transcription.service';
import { RepositoryFactory } from '../repositories/repository.factory';
import {
  ContentSuggestion,
  SuggestionType,
  SuggestionStatus,
  ConfidenceLevel,
  ContentAnalysisFilterOptions,
  ContentAnalysisRequest,
  ContentAnalysisResult,
  CharacterSuggestion,
  LocationSuggestion,
  RelationshipSuggestion,
  LoreSuggestion,
  DialogSuggestion,
  EventSuggestion,
  NoteSuggestion
} from '../models/content-analysis.model';
import { LLMMessage, LLMMessageRole } from '../models/llm.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for content analysis
 */
export class ContentAnalysisService {
  private contentAnalysisRepository: ContentAnalysisRepository;
  private llmService: LLMService;
  private sessionAnalysisService: SessionAnalysisService;
  private transcriptionService: TranscriptionService;
  private repositoryFactory: RepositoryFactory;

  constructor(
    contentAnalysisRepository: ContentAnalysisRepository,
    llmService: LLMService,
    sessionAnalysisService: SessionAnalysisService,
    transcriptionService: TranscriptionService,
    repositoryFactory: RepositoryFactory
  ) {
    this.contentAnalysisRepository = contentAnalysisRepository;
    this.llmService = llmService;
    this.sessionAnalysisService = sessionAnalysisService;
    this.transcriptionService = transcriptionService;
    this.repositoryFactory = repositoryFactory;
  }

  /**
   * Get content suggestion by ID
   * @param suggestionId Suggestion ID
   * @returns Content suggestion
   */
  public async getSuggestion(suggestionId: string): Promise<ContentSuggestion | null> {
    return this.contentAnalysisRepository.getSuggestion(suggestionId);
  }

  /**
   * Get all content suggestions with optional filtering
   * @param filter Filter options
   * @returns Content suggestions
   */
  public async getSuggestions(filter?: ContentAnalysisFilterOptions): Promise<ContentSuggestion[]> {
    return this.contentAnalysisRepository.getSuggestions(filter);
  }

  /**
   * Update content suggestion
   * @param suggestionId Suggestion ID
   * @param suggestion Updated suggestion data
   * @returns Updated suggestion
   */
  public async updateSuggestion(
    suggestionId: string,
    suggestion: Partial<Omit<ContentSuggestion, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ContentSuggestion> {
    return this.contentAnalysisRepository.updateSuggestion(suggestionId, suggestion);
  }

  /**
   * Delete content suggestion
   * @param suggestionId Suggestion ID
   * @returns True if deleted
   */
  public async deleteSuggestion(suggestionId: string): Promise<boolean> {
    return this.contentAnalysisRepository.deleteSuggestion(suggestionId);
  }

  /**
   * Accept content suggestion
   * @param suggestionId Suggestion ID
   * @returns Updated suggestion
   */
  public async acceptSuggestion(suggestionId: string): Promise<ContentSuggestion> {
    return this.contentAnalysisRepository.updateSuggestion(suggestionId, {
      status: SuggestionStatus.ACCEPTED
    });
  }

  /**
   * Reject content suggestion
   * @param suggestionId Suggestion ID
   * @returns Updated suggestion
   */
  public async rejectSuggestion(suggestionId: string): Promise<ContentSuggestion> {
    return this.contentAnalysisRepository.updateSuggestion(suggestionId, {
      status: SuggestionStatus.REJECTED
    });
  }

  /**
   * Modify content suggestion
   * @param suggestionId Suggestion ID
   * @param suggestion Updated suggestion data
   * @returns Updated suggestion
   */
  public async modifySuggestion(
    suggestionId: string,
    suggestion: Partial<Omit<ContentSuggestion, 'id' | 'createdAt' | 'updatedAt' | 'status'>>
  ): Promise<ContentSuggestion> {
    return this.contentAnalysisRepository.updateSuggestion(suggestionId, {
      ...suggestion,
      status: SuggestionStatus.MODIFIED
    });
  }

  /**
   * Get content analysis result by ID
   * @param resultId Result ID
   * @returns Content analysis result
   */
  public async getAnalysisResult(resultId: string): Promise<ContentAnalysisResult | null> {
    return this.contentAnalysisRepository.getAnalysisResult(resultId);
  }

  /**
   * Get all content analysis results
   * @param contextId Optional context ID
   * @returns Content analysis results
   */
  public async getAnalysisResults(contextId?: string): Promise<ContentAnalysisResult[]> {
    return this.contentAnalysisRepository.getAnalysisResults(contextId);
  }

  /**
   * Delete content analysis result
   * @param resultId Result ID
   * @returns True if deleted
   */
  public async deleteAnalysisResult(resultId: string): Promise<boolean> {
    return this.contentAnalysisRepository.deleteAnalysisResult(resultId);
  }

  /**
   * Analyze content and generate suggestions
   * @param request Analysis request
   * @returns Analysis result
   */
  public async analyzeContent(request: ContentAnalysisRequest): Promise<ContentAnalysisResult> {
    try {
      const startTime = Date.now();
      const requestId = uuidv4();
      
      // Get content to analyze
      let content = request.content || '';
      
      // If transcription ID is provided, get transcription content
      if (request.transcriptionId) {
        const transcription = await this.transcriptionService.getTranscriptionById(request.transcriptionId);
        
        if (transcription) {
          content = transcription.segments.map(segment => 
            `${segment.speaker ? segment.speaker + ': ' : ''}${segment.text}`
          ).join('\n\n');
        }
      }
      
      // If session ID is provided, get session analysis
      if (request.sessionId) {
        const sessionAnalysis = await this.sessionAnalysisService.getSessionAnalysis(request.sessionId);
        
        if (sessionAnalysis) {
          content += '\n\n' + sessionAnalysis.summary;
          
          if (sessionAnalysis.keyPoints) {
            content += '\n\nKey Points:\n' + sessionAnalysis.keyPoints.map(point => 
              `- ${point.text}`
            ).join('\n');
          }
        }
      }
      
      // Get context data
      let contextData: any = null;
      
      if (request.contextId && request.contextType) {
        contextData = await this.getContextData(request.contextId, request.contextType);
      }
      
      // Generate suggestions for each requested type
      const suggestions: ContentSuggestion[] = [];
      
      for (const analysisType of request.analysisTypes) {
        const typeSuggestions = await this.generateSuggestionsForType(
          analysisType,
          content,
          contextData,
          request
        );
        
        suggestions.push(...typeSuggestions);
      }
      
      // Create analysis result
      const result: Omit<ContentAnalysisResult, 'id' | 'createdAt'> = {
        requestId,
        suggestions,
        processingTime: Date.now() - startTime,
        metadata: {
          model: request.options?.model
        }
      };
      
      return this.contentAnalysisRepository.createAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  }

  /**
   * Get context data for analysis
   * @param contextId Context ID
   * @param contextType Context type
   * @returns Context data
   */
  private async getContextData(contextId: string, contextType: string): Promise<any> {
    try {
      switch (contextType.toLowerCase()) {
        case 'campaign':
          const campaignRepository = this.repositoryFactory.getCampaignRepository();
          return campaignRepository.getById(contextId);
        
        case 'session':
          const sessionRepository = this.repositoryFactory.getSessionRepository();
          const session = await sessionRepository.getById(contextId);
          
          // If session has campaign ID, get campaign data too
          if (session && session.campaignId) {
            const campaignRepository = this.repositoryFactory.getCampaignRepository();
            const campaign = await campaignRepository.getById(session.campaignId);
            
            if (campaign) {
              return {
                ...session,
                campaign
              };
            }
          }
          
          return session;
        
        case 'world':
          const worldRepository = this.repositoryFactory.getRPGWorldRepository();
          return worldRepository.getById(contextId);
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Error getting context data:', error);
      return null;
    }
  }

  /**
   * Generate suggestions for a specific analysis type
   * @param analysisType Analysis type
   * @param content Content to analyze
   * @param contextData Context data
   * @param request Analysis request
   * @returns Generated suggestions
   */
  private async generateSuggestionsForType(
    analysisType: SuggestionType,
    content: string,
    contextData: any,
    request: ContentAnalysisRequest
  ): Promise<ContentSuggestion[]> {
    try {
      // Get prompt for analysis type
      const prompt = this.getPromptForAnalysisType(analysisType, content, contextData);
      
      // Use custom prompt if provided
      const finalPrompt = request.options?.customPrompt || prompt;
      
      // Prepare messages for LLM
      const messages: LLMMessage[] = [
        {
          role: LLMMessageRole.SYSTEM,
          content: this.getSystemPromptForAnalysisType(analysisType)
        },
        {
          role: LLMMessageRole.USER,
          content: finalPrompt
        }
      ];
      
      // Call LLM
      const response = await this.llmService.chat(messages, {
        model: request.options?.model,
        temperature: 0.7,
        maxTokens: 2000
      });
      
      // Parse LLM response to create suggestions
      return this.parseSuggestionsFromLLMResponse(
        response.message.content,
        analysisType,
        request
      );
    } catch (error) {
      console.error(`Error generating ${analysisType} suggestions:`, error);
      return [];
    }
  }

  /**
   * Get system prompt for analysis type
   * @param analysisType Analysis type
   * @returns System prompt
   */
  private getSystemPromptForAnalysisType(analysisType: SuggestionType): string {
    switch (analysisType) {
      case SuggestionType.CHARACTER:
        return `You are an AI assistant for an RPG campaign management system.
Your task is to analyze RPG campaign content and suggest new characters or identify existing characters that are mentioned but not yet fully defined.
Respond in JSON format with an array of character suggestions, each containing:
{
  "type": "character",
  "title": "Character Name",
  "description": "Brief description of the character",
  "confidence": "high|medium|low",
  "characterData": {
    "name": "Character name",
    "description": "Physical description",
    "background": "Character background",
    "personality": "Personality traits",
    "appearance": "Detailed appearance",
    "goals": "Character goals and motivations",
    "relationships": [
      {
        "type": "relationship",
        "sourceName": "This character's name",
        "targetName": "Related character name",
        "relationshipType": "FRIEND_OF|ENEMY_OF|RELATED_TO|etc",
        "description": "Description of the relationship"
      }
    ]
  }
}`;

      case SuggestionType.LOCATION:
        return `You are an AI assistant for an RPG campaign management system.
Your task is to analyze RPG campaign content and suggest new locations or identify existing locations that are mentioned but not yet fully defined.
Respond in JSON format with an array of location suggestions, each containing:
{
  "type": "location",
  "title": "Location Name",
  "description": "Brief description of the location",
  "confidence": "high|medium|low",
  "locationData": {
    "name": "Location name",
    "description": "General description",
    "history": "Historical background",
    "features": "Notable features",
    "inhabitants": "Who lives here",
    "pointsOfInterest": ["Point 1", "Point 2", "..."],
    "parentLocationId": "ID of parent location if known"
  }
}`;

      case SuggestionType.RELATIONSHIP:
        return `You are an AI assistant for an RPG campaign management system.
Your task is to analyze RPG campaign content and identify relationships between entities (characters, locations, etc.) that are mentioned.
Respond in JSON format with an array of relationship suggestions, each containing:
{
  "type": "relationship",
  "title": "Relationship Title",
  "description": "Brief description of the relationship",
  "confidence": "high|medium|low",
  "relationshipData": {
    "sourceId": "ID of source entity if known",
    "sourceType": "Type of source entity if known",
    "sourceName": "Name of source entity",
    "targetId": "ID of target entity if known",
    "targetType": "Type of target entity if known",
    "targetName": "Name of target entity",
    "relationshipType": "FRIEND_OF|ENEMY_OF|LOCATED_IN|OWNS|etc",
    "description": "Detailed description of the relationship",
    "strength": 7 // 1-10 scale
  }
}`;

      case SuggestionType.LORE:
        return `You are an AI assistant for an RPG campaign management system.
Your task is to analyze RPG campaign content and extract lore elements (history, legends, customs, etc.) that are mentioned.
Respond in JSON format with an array of lore suggestions, each containing:
{
  "type": "lore",
  "title": "Lore Title",
  "description": "Brief description of the lore element",
  "confidence": "high|medium|low",
  "loreData": {
    "title": "Title of the lore element",
    "content": "Detailed content of the lore",
    "category": "HISTORY|LEGEND|RELIGION|CUSTOM|etc",
    "tags": ["tag1", "tag2", "..."],
    "relatedEntities": [
      {
        "id": "ID if known",
        "type": "Type if known",
        "name": "Name of related entity"
      }
    ]
  }
}`;

      case SuggestionType.DIALOG:
        return `You are an AI assistant for an RPG campaign management system.
Your task is to analyze RPG campaign content and suggest dialog options for NPCs based on their character and the context.
Respond in JSON format with an array of dialog suggestions, each containing:
{
  "type": "dialog",
  "title": "Dialog Title",
  "description": "Brief description of the dialog",
  "confidence": "high|medium|low",
  "dialogData": {
    "characterId": "ID if known",
    "characterName": "Name of the character",
    "content": "The dialog text",
    "context": "When this dialog would be used",
    "tone": "FRIENDLY|HOSTILE|NEUTRAL|etc",
    "purpose": "INFORMATION|QUEST|WARNING|etc",
    "alternatives": ["Alternative 1", "Alternative 2", "..."]
  }
}`;

      case SuggestionType.EVENT:
        return `You are an AI assistant for an RPG campaign management system.
Your task is to analyze RPG campaign content and identify events that have occurred or might occur in the future.
Respond in JSON format with an array of event suggestions, each containing:
{
  "type": "event",
  "title": "Event Title",
  "description": "Brief description of the event",
  "confidence": "high|medium|low",
  "eventData": {
    "name": "Name of the event",
    "description": "Detailed description",
    "date": "When it occurred or will occur",
    "location": "Where it occurred or will occur",
    "participants": [
      {
        "id": "ID if known",
        "type": "Type if known",
        "name": "Name of participant",
        "role": "Role in the event"
      }
    ],
    "importance": 8, // 1-10 scale
    "consequences": "What happened or will happen as a result"
  }
}`;

      case SuggestionType.NOTE:
        return `You are an AI assistant for an RPG campaign management system.
Your task is to analyze RPG campaign content and suggest notes that the game master might want to keep.
Respond in JSON format with an array of note suggestions, each containing:
{
  "type": "note",
  "title": "Note Title",
  "description": "Brief description of the note",
  "confidence": "high|medium|low",
  "noteData": {
    "title": "Title of the note",
    "content": "Detailed content",
    "category": "PLOT|CHARACTER|LOCATION|QUEST|etc",
    "tags": ["tag1", "tag2", "..."],
    "relatedEntities": [
      {
        "id": "ID if known",
        "type": "Type if known",
        "name": "Name of related entity"
      }
    ]
  }
}`;

      default:
        return `You are an AI assistant for an RPG campaign management system.
Your task is to analyze RPG campaign content and provide helpful suggestions.
Respond in JSON format with an array of suggestions.`;
    }
  }

  /**
   * Get prompt for analysis type
   * @param analysisType Analysis type
   * @param content Content to analyze
   * @param contextData Context data
   * @returns Prompt
   */
  private getPromptForAnalysisType(
    analysisType: SuggestionType,
    content: string,
    contextData: any
  ): string {
    let contextDescription = '';
    
    if (contextData) {
      contextDescription = `\n\nContext Information:\n${JSON.stringify(contextData, null, 2)}`;
    }
    
    switch (analysisType) {
      case SuggestionType.CHARACTER:
        return `Analyze the following RPG campaign content and identify characters that are mentioned or implied but not yet fully defined. Also suggest new characters that would fit well in this context.${contextDescription}\n\nContent to analyze:\n${content}\n\nProvide character suggestions in the required JSON format. Focus on characters that seem important to the story or would add interesting elements to the campaign. For each character, include as much detail as you can reasonably infer from the content.`;
      
      case SuggestionType.LOCATION:
        return `Analyze the following RPG campaign content and identify locations that are mentioned or implied but not yet fully defined. Also suggest new locations that would fit well in this context.${contextDescription}\n\nContent to analyze:\n${content}\n\nProvide location suggestions in the required JSON format. Focus on locations that seem important to the story or would add interesting elements to the campaign. For each location, include as much detail as you can reasonably infer from the content.`;
      
      case SuggestionType.RELATIONSHIP:
        return `Analyze the following RPG campaign content and identify relationships between entities (characters, locations, etc.) that are mentioned or implied.${contextDescription}\n\nContent to analyze:\n${content}\n\nProvide relationship suggestions in the required JSON format. Focus on relationships that seem important to the story or would add interesting dynamics to the campaign. For each relationship, include as much detail as you can reasonably infer from the content.`;
      
      case SuggestionType.LORE:
        return `Analyze the following RPG campaign content and extract lore elements (history, legends, customs, etc.) that are mentioned or implied.${contextDescription}\n\nContent to analyze:\n${content}\n\nProvide lore suggestions in the required JSON format. Focus on lore elements that seem important to the story or would add depth to the campaign world. For each lore element, include as much detail as you can reasonably infer from the content.`;
      
      case SuggestionType.DIALOG:
        return `Analyze the following RPG campaign content and suggest dialog options for NPCs based on their character and the context.${contextDescription}\n\nContent to analyze:\n${content}\n\nProvide dialog suggestions in the required JSON format. Focus on dialog that would be useful for the game master to have prepared for important NPCs. Include alternative phrasings for flexibility.`;
      
      case SuggestionType.EVENT:
        return `Analyze the following RPG campaign content and identify events that have occurred or might occur in the future.${contextDescription}\n\nContent to analyze:\n${content}\n\nProvide event suggestions in the required JSON format. Focus on events that seem important to the story or would add interesting developments to the campaign. For each event, include as much detail as you can reasonably infer from the content.`;
      
      case SuggestionType.NOTE:
        return `Analyze the following RPG campaign content and suggest notes that the game master might want to keep.${contextDescription}\n\nContent to analyze:\n${content}\n\nProvide note suggestions in the required JSON format. Focus on information that would be useful for the game master to remember for future sessions. These could be plot points, character details, location information, quest ideas, etc.`;
      
      default:
        return `Analyze the following RPG campaign content and provide helpful suggestions.${contextDescription}\n\nContent to analyze:\n${content}\n\nProvide suggestions in JSON format.`;
    }
  }

  /**
   * Parse suggestions from LLM response
   * @param response LLM response
   * @param analysisType Analysis type
   * @param request Analysis request
   * @returns Parsed suggestions
   */
  private parseSuggestionsFromLLMResponse(
    response: string,
    analysisType: SuggestionType,
    request: ContentAnalysisRequest
  ): ContentSuggestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/```\n([\s\S]*?)\n```/) ||
                        response.match(/({[\s\S]*})/);
      
      let jsonStr = jsonMatch ? jsonMatch[1] : response;
      
      // Clean up the JSON string
      jsonStr = jsonStr.trim();
      
      // Parse JSON
      let parsedData = JSON.parse(jsonStr);
      
      // Handle both array and single object responses
      const suggestions = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      // Process each suggestion
      return suggestions.map(suggestion => {
        // Set common fields
        const commonFields = {
          id: uuidv4(),
          type: suggestion.type || analysisType,
          title: suggestion.title || 'Untitled Suggestion',
          description: suggestion.description || 'No description provided',
          confidence: suggestion.confidence || ConfidenceLevel.MEDIUM,
          status: SuggestionStatus.PENDING,
          sourceId: request.sourceId,
          sourceType: request.sourceType,
          contextId: request.contextId,
          contextType: request.contextType,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          metadata: suggestion.metadata || {}
        };
        
        // Return appropriate suggestion type
        switch (suggestion.type || analysisType) {
          case SuggestionType.CHARACTER:
            return {
              ...commonFields,
              type: SuggestionType.CHARACTER,
              characterData: suggestion.characterData || {
                name: suggestion.title || 'Unnamed Character',
                description: suggestion.description || ''
              }
            } as CharacterSuggestion;
          
          case SuggestionType.LOCATION:
            return {
              ...commonFields,
              type: SuggestionType.LOCATION,
              locationData: suggestion.locationData || {
                name: suggestion.title || 'Unnamed Location',
                description: suggestion.description || ''
              }
            } as LocationSuggestion;
          
          case SuggestionType.RELATIONSHIP:
            return {
              ...commonFields,
              type: SuggestionType.RELATIONSHIP,
              relationshipData: suggestion.relationshipData || {
                sourceName: 'Unknown',
                targetName: 'Unknown',
                relationshipType: 'RELATED_TO',
                description: suggestion.description || ''
              }
            } as RelationshipSuggestion;
          
          case SuggestionType.LORE:
            return {
              ...commonFields,
              type: SuggestionType.LORE,
              loreData: suggestion.loreData || {
                title: suggestion.title || 'Unnamed Lore',
                content: suggestion.description || ''
              }
            } as LoreSuggestion;
          
          case SuggestionType.DIALOG:
            return {
              ...commonFields,
              type: SuggestionType.DIALOG,
              dialogData: suggestion.dialogData || {
                characterName: 'Unknown Character',
                content: suggestion.description || ''
              }
            } as DialogSuggestion;
          
          case SuggestionType.EVENT:
            return {
              ...commonFields,
              type: SuggestionType.EVENT,
              eventData: suggestion.eventData || {
                name: suggestion.title || 'Unnamed Event',
                description: suggestion.description || ''
              }
            } as EventSuggestion;
          
          case SuggestionType.NOTE:
            return {
              ...commonFields,
              type: SuggestionType.NOTE,
              noteData: suggestion.noteData || {
                title: suggestion.title || 'Unnamed Note',
                content: suggestion.description || ''
              }
            } as NoteSuggestion;
          
          default:
            return commonFields as ContentSuggestion;
        }
      });
    } catch (error) {
      console.error('Error parsing suggestions from LLM response:', error);
      
      // Create a fallback suggestion
      return [{
        id: uuidv4(),
        type: analysisType,
        title: 'Failed to Parse Suggestion',
        description: 'The AI generated a response that could not be parsed as a valid suggestion.',
        confidence: ConfidenceLevel.LOW,
        status: SuggestionStatus.PENDING,
        sourceId: request.sourceId,
        sourceType: request.sourceType,
        contextId: request.contextId,
        contextType: request.contextType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          error: error.message,
          rawResponse: response
        }
      }];
    }
  }
}
