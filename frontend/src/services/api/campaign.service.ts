import apiClient from './client';
import { AxiosResponse } from 'axios';

// Campaign interface
export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'planned';
  worldId: string;
  worldName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  sessionCount?: number;
  characterCount?: number;
  locationCount?: number;
}

// Campaign creation/update interface
export interface CampaignInput {
  name: string;
  description: string;
  status: 'active' | 'completed' | 'planned';
  worldId: string;
  imageUrl?: string;
}

// Campaign service
const CampaignService = {
  /**
   * Get all Campaigns
   * @returns List of Campaigns
   */
  getAllCampaigns: async (): Promise<Campaign[]> => {
    const response: AxiosResponse<{ success: boolean; data: Campaign[] }> = await apiClient.get('/campaigns');
    return response.data.data;
  },

  /**
   * Get Campaigns by World ID
   * @param worldId World ID
   * @returns List of Campaigns
   */
  getCampaignsByWorldId: async (worldId: string): Promise<Campaign[]> => {
    const response: AxiosResponse<{ success: boolean; data: Campaign[] }> = await apiClient.get(/worlds//campaigns);
    return response.data.data;
  },

  /**
   * Get Campaign by ID
   * @param id Campaign ID
   * @returns Campaign
   */
  getCampaignById: async (id: string): Promise<Campaign> => {
    const response: AxiosResponse<{ success: boolean; data: Campaign }> = await apiClient.get(/campaigns/);
    return response.data.data;
  },

  /**
   * Create new Campaign
   * @param campaignData Campaign data
   * @returns Created Campaign
   */
  createCampaign: async (campaignData: CampaignInput): Promise<Campaign> => {
    const response: AxiosResponse<{ success: boolean; data: Campaign }> = await apiClient.post('/campaigns', campaignData);
    return response.data.data;
  },

  /**
   * Update Campaign
   * @param id Campaign ID
   * @param campaignData Campaign data
   * @returns Updated Campaign
   */
  updateCampaign: async (id: string, campaignData: Partial<CampaignInput>): Promise<Campaign> => {
    const response: AxiosResponse<{ success: boolean; data: Campaign }> = await apiClient.put(/campaigns/, campaignData);
    return response.data.data;
  },

  /**
   * Delete Campaign
   * @param id Campaign ID
   * @returns Success status
   */
  deleteCampaign: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/campaigns/);
    return response.data.success;
  },

  /**
   * Upload image for Campaign
   * @param id Campaign ID
   * @param file Image file
   * @returns Image URL
   */
  uploadCampaignImage: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      /campaigns//image,
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
   * Generate image for Campaign using AI
   * @param id Campaign ID
   * @param prompt Image generation prompt
   * @returns Image URL
   */
  generateCampaignImage: async (id: string, prompt: string): Promise<string> => {
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      /campaigns//generate-image,
      { prompt }
    );
    
    return response.data.data.imageUrl;
  },

  /**
   * Delete Campaign image
   * @param id Campaign ID
   * @returns Success status
   */
  deleteCampaignImage: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/campaigns//image);
    return response.data.success;
  },
};

export default CampaignService;
