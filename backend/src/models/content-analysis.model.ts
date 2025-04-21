/**
 * Content analysis models
 */

/**
 * Content suggestion type
 */
export enum SuggestionType {
  CHARACTER = 'character',
  LOCATION = 'location',
  ITEM = 'item',
  EVENT = 'event',
  RELATIONSHIP = 'relationship',
  LORE = 'lore',
  DIALOG = 'dialog',
  PLOT = 'plot',
  NOTE = 'note'
}

/**
 * Content suggestion status
 */
export enum SuggestionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  MODIFIED = 'modified'
}

/**
 * Content suggestion confidence level
 */
export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Base content suggestion interface
 */
export interface ContentSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  status: SuggestionStatus;
  sourceId?: string;
  sourceType?: string;
  contextId?: string;
  contextType?: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

/**
 * Character suggestion
 */
export interface CharacterSuggestion extends ContentSuggestion {
  type: SuggestionType.CHARACTER;
  characterData: {
    name: string;
    description?: string;
    background?: string;
    personality?: string;
    appearance?: string;
    goals?: string;
    relationships?: RelationshipSuggestion[];
  };
}

/**
 * Location suggestion
 */
export interface LocationSuggestion extends ContentSuggestion {
  type: SuggestionType.LOCATION;
  locationData: {
    name: string;
    description?: string;
    history?: string;
    features?: string;
    inhabitants?: string;
    pointsOfInterest?: string[];
    parentLocationId?: string;
  };
}

/**
 * Relationship suggestion
 */
export interface RelationshipSuggestion extends ContentSuggestion {
  type: SuggestionType.RELATIONSHIP;
  relationshipData: {
    sourceId?: string;
    sourceType?: string;
    sourceName: string;
    targetId?: string;
    targetType?: string;
    targetName: string;
    relationshipType: string;
    description?: string;
    strength?: number; // 1-10 scale
  };
}

/**
 * Lore suggestion
 */
export interface LoreSuggestion extends ContentSuggestion {
  type: SuggestionType.LORE;
  loreData: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    relatedEntities?: {
      id?: string;
      type?: string;
      name: string;
    }[];
  };
}

/**
 * Dialog suggestion
 */
export interface DialogSuggestion extends ContentSuggestion {
  type: SuggestionType.DIALOG;
  dialogData: {
    characterId?: string;
    characterName: string;
    content: string;
    context?: string;
    tone?: string;
    purpose?: string;
    alternatives?: string[];
  };
}

/**
 * Timeline event suggestion
 */
export interface EventSuggestion extends ContentSuggestion {
  type: SuggestionType.EVENT;
  eventData: {
    name: string;
    description?: string;
    date?: string;
    location?: string;
    participants?: {
      id?: string;
      type?: string;
      name: string;
      role?: string;
    }[];
    importance?: number; // 1-10 scale
    consequences?: string;
  };
}

/**
 * Note suggestion
 */
export interface NoteSuggestion extends ContentSuggestion {
  type: SuggestionType.NOTE;
  noteData: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    relatedEntities?: {
      id?: string;
      type?: string;
      name: string;
    }[];
  };
}

/**
 * Content analysis filter options
 */
export interface ContentAnalysisFilterOptions {
  types?: SuggestionType[];
  status?: SuggestionStatus[];
  confidence?: ConfidenceLevel[];
  sourceId?: string;
  sourceType?: string;
  contextId?: string;
  contextType?: string;
  createdAfter?: number;
  createdBefore?: number;
  search?: string;
}

/**
 * Content analysis request
 */
export interface ContentAnalysisRequest {
  sourceId?: string;
  sourceType?: string;
  contextId?: string;
  contextType?: string;
  content?: string;
  transcriptionId?: string;
  sessionId?: string;
  analysisTypes: SuggestionType[];
  options?: {
    maxResults?: number;
    minConfidence?: ConfidenceLevel;
    includeExisting?: boolean;
    model?: string;
    customPrompt?: string;
  };
}

/**
 * Content analysis result
 */
export interface ContentAnalysisResult {
  id: string;
  requestId: string;
  suggestions: ContentSuggestion[];
  createdAt: number;
  processingTime: number;
  metadata?: {
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    error?: string;
  };
}
