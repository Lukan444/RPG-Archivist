import apiClient from './client';
import { AxiosResponse } from 'axios';

// RPG World interface
export interface RPGWorld {
  id: string;
  name: string;
  description: string;
  genre: string;
  system: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  campaignCount?: number;
}

// RPG World creation/update interface
export interface RPGWorldInput {
  name: string;
  description: string;
  genre: string;
  system: string;
  imageUrl?: string;
}

// RPG World service
const RPGWorldService = {
  /**
   * Get all RPG Worlds
   * @returns List of RPG Worlds
   */
  getAllWorlds: async (): Promise<RPGWorld[]> => {
    const response: AxiosResponse<{ success: boolean; data: RPGWorld[] }> = await apiClient.get('/rpg-worlds');
    return response.data.data;
  },

  /**
   * Get RPG World by ID
   * @param id RPG World ID
   * @returns RPG World
   */
  getWorldById: async (id: string): Promise<RPGWorld> => {
    const response: AxiosResponse<{ success: boolean; data: RPGWorld }> = await apiClient.get(/rpg-worlds/);
    return response.data.data;
  },

  /**
   * Create new RPG World
   * @param worldData RPG World data
   * @returns Created RPG World
   */
  createWorld: async (worldData: RPGWorldInput): Promise<RPGWorld> => {
    const response: AxiosResponse<{ success: boolean; data: RPGWorld }> = await apiClient.post('/rpg-worlds', worldData);
    return response.data.data;
  },

  /**
   * Update RPG World
   * @param id RPG World ID
   * @param worldData RPG World data
   * @returns Updated RPG World
   */
  updateWorld: async (id: string, worldData: Partial<RPGWorldInput>): Promise<RPGWorld> => {
    const response: AxiosResponse<{ success: boolean; data: RPGWorld }> = await apiClient.put(/rpg-worlds/, worldData);
    return response.data.data;
  },

  /**
   * Delete RPG World
   * @param id RPG World ID
   * @returns Success status
   */
  deleteWorld: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/rpg-worlds/);
    return response.data.success;
  },

  /**
   * Upload image for RPG World
   * @param id RPG World ID
   * @param file Image file
   * @returns Image URL
   */
  uploadWorldImage: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      /rpg-worlds//image,
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
   * Generate image for RPG World using AI
   * @param id RPG World ID
   * @param prompt Image generation prompt
   * @returns Image URL
   */
  generateWorldImage: async (id: string, prompt: string): Promise<string> => {
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      /rpg-worlds//generate-image,
      { prompt }
    );
    
    return response.data.data.imageUrl;
  },

  /**
   * Delete RPG World image
   * @param id RPG World ID
   * @returns Success status
   */
  deleteWorldImage: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/rpg-worlds//image);
    return response.data.success;
  },
};

export default RPGWorldService;
