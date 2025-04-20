import apiClient from './client';
import { AxiosResponse } from 'axios';

// Character interface
export interface Character {
  id: string;
  name: string;
  description: string;
  characterType: 'PC' | 'NPC';
  race: string;
  class: string;
  worldId: string;
  worldName?: string;
  campaignId?: string;
  campaignName?: string;
  locationId?: string;
  locationName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  sessionCount?: number;
}

// Character creation/update interface
export interface CharacterInput {
  name: string;
  description: string;
  characterType: 'PC' | 'NPC';
  race: string;
  class: string;
  worldId: string;
  campaignId?: string;
  locationId?: string;
  imageUrl?: string;
}

// Character service
const CharacterService = {
  /**
   * Get all Characters
   * @returns List of Characters
   */
  getAllCharacters: async (): Promise<Character[]> => {
    const response: AxiosResponse<{ success: boolean; data: Character[] }> = await apiClient.get('/characters');
    return response.data.data;
  },

  /**
   * Get Characters by World ID
   * @param worldId World ID
   * @returns List of Characters
   */
  getCharactersByWorldId: async (worldId: string): Promise<Character[]> => {
    const response: AxiosResponse<{ success: boolean; data: Character[] }> = await apiClient.get(/worlds//characters);
    return response.data.data;
  },

  /**
   * Get Characters by Campaign ID
   * @param campaignId Campaign ID
   * @returns List of Characters
   */
  getCharactersByCampaignId: async (campaignId: string): Promise<Character[]> => {
    const response: AxiosResponse<{ success: boolean; data: Character[] }> = await apiClient.get(/campaigns//characters);
    return response.data.data;
  },

  /**
   * Get Characters by Session ID
   * @param sessionId Session ID
   * @returns List of Characters
   */
  getCharactersBySessionId: async (sessionId: string): Promise<Character[]> => {
    const response: AxiosResponse<{ success: boolean; data: Character[] }> = await apiClient.get(/sessions//characters);
    return response.data.data;
  },

  /**
   * Get Characters by Location ID
   * @param locationId Location ID
   * @returns List of Characters
   */
  getCharactersByLocationId: async (locationId: string): Promise<Character[]> => {
    const response: AxiosResponse<{ success: boolean; data: Character[] }> = await apiClient.get(/locations//characters);
    return response.data.data;
  },

  /**
   * Get Character by ID
   * @param id Character ID
   * @returns Character
   */
  getCharacterById: async (id: string): Promise<Character> => {
    const response: AxiosResponse<{ success: boolean; data: Character }> = await apiClient.get(/characters/);
    return response.data.data;
  },

  /**
   * Create new Character
   * @param characterData Character data
   * @returns Created Character
   */
  createCharacter: async (characterData: CharacterInput): Promise<Character> => {
    const response: AxiosResponse<{ success: boolean; data: Character }> = await apiClient.post('/characters', characterData);
    return response.data.data;
  },

  /**
   * Update Character
   * @param id Character ID
   * @param characterData Character data
   * @returns Updated Character
   */
  updateCharacter: async (id: string, characterData: Partial<CharacterInput>): Promise<Character> => {
    const response: AxiosResponse<{ success: boolean; data: Character }> = await apiClient.put(/characters/, characterData);
    return response.data.data;
  },

  /**
   * Delete Character
   * @param id Character ID
   * @returns Success status
   */
  deleteCharacter: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/characters/);
    return response.data.success;
  },

  /**
   * Upload image for Character
   * @param id Character ID
   * @param file Image file
   * @returns Image URL
   */
  uploadCharacterImage: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      /characters//image,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.data.imageUrl;
  },

  /**
   * Generate image for Character using AI
   * @param id Character ID
   * @param prompt Image generation prompt
   * @returns Image URL
   */
  generateCharacterImage: async (id: string, prompt: string): Promise<string> => {
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      /characters//generate-image,
      { prompt }
    );
    
    return response.data.data.imageUrl;
  },

  /**
   * Delete Character image
   * @param id Character ID
   * @returns Success status
   */
  deleteCharacterImage: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/characters//image);
    return response.data.success;
  },

  /**
   * Add Character to Session
   * @param characterId Character ID
   * @param sessionId Session ID
   * @returns Success status
   */
  addCharacterToSession: async (characterId: string, sessionId: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.post(/characters//sessions/);
    return response.data.success;
  },

  /**
   * Remove Character from Session
   * @param characterId Character ID
   * @param sessionId Session ID
   * @returns Success status
   */
  removeCharacterFromSession: async (characterId: string, sessionId: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/characters//sessions/);
    return response.data.success;
  },

  /**
   * Set Character Location
   * @param characterId Character ID
   * @param locationId Location ID
   * @returns Success status
   */
  setCharacterLocation: async (characterId: string, locationId: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.post(/characters//location/);
    return response.data.success;
  },

  /**
   * Remove Character Location
   * @param characterId Character ID
   * @returns Success status
   */
  removeCharacterLocation: async (characterId: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/characters//location);
    return response.data.success;
  },
};

export default CharacterService;
