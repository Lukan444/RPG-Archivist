import axios from 'axios';
import { API_BASE_URL } from '../../config';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  worldId?: string;
  worldName?: string;
  gameSystem?: string;
  sessionCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}

export interface CampaignInput {
  name: string;
  description?: string;
  worldId?: string;
  gameSystem?: string;
  status?: string;
  imageUrl?: string;
}

class CampaignService {
  /**
   * Get all campaigns
   * @returns List of campaigns
   */
  public async getCampaigns(): Promise<Campaign[]> {
    try {
      // In development mode, return mock campaigns
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock campaigns');
        return [
          {
            id: '1',
            name: 'Amber Chronicles',
            description: 'A campaign set in the world of Amber',
            worldId: '1',
            worldName: 'Amber',
            gameSystem: 'Amber Diceless',
            sessionCount: 3,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Amber+Chronicles'
          },
          {
            id: '2',
            name: 'Courts of Chaos',
            description: 'Adventures in the Courts of Chaos',
            worldId: '2',
            worldName: 'Courts of Chaos',
            gameSystem: 'Amber Diceless',
            sessionCount: 1,
            status: 'planned',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Courts+of+Chaos'
          }
        ];
      }

      const response = await axios.get(`${API_BASE_URL}/campaigns`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // In development mode, return mock campaigns
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock campaigns after error');
        return [
          {
            id: '1',
            name: 'Amber Chronicles',
            description: 'A campaign set in the world of Amber',
            worldId: '1',
            worldName: 'Amber',
            gameSystem: 'Amber Diceless',
            sessionCount: 3,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Amber+Chronicles'
          },
          {
            id: '2',
            name: 'Courts of Chaos',
            description: 'Adventures in the Courts of Chaos',
            worldId: '2',
            worldName: 'Courts of Chaos',
            gameSystem: 'Amber Diceless',
            sessionCount: 1,
            status: 'planned',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Courts+of+Chaos'
          }
        ];
      }
      throw error;
    }
  }

  /**
   * Get campaign by ID
   * @param id Campaign ID
   * @returns Campaign details
   */
  public async getCampaign(id: string): Promise<Campaign> {
    try {
      // In development mode, return a mock campaign
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock campaign');
        return {
          id,
          name: 'Amber Chronicles',
          description: 'A campaign set in the world of Amber',
          worldId: '1',
          worldName: 'Amber',
          gameSystem: 'Amber Diceless',
          sessionCount: 3,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrl: 'https://via.placeholder.com/300x200?text=Amber+Chronicles'
        };
      }

      const response = await axios.get(`${API_BASE_URL}/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      // In development mode, return a mock campaign
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock campaign after error');
        return {
          id,
          name: 'Amber Chronicles',
          description: 'A campaign set in the world of Amber',
          worldId: '1',
          worldName: 'Amber',
          gameSystem: 'Amber Diceless',
          sessionCount: 3,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrl: 'https://via.placeholder.com/300x200?text=Amber+Chronicles'
        };
      }
      throw error;
    }
  }

  /**
   * Create a new campaign
   * @param campaign Campaign data
   * @returns Created campaign
   */
  public async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    try {
      // In development mode, return a mock created campaign
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock created campaign');
        return {
          id: Math.random().toString(36).substring(7),
          name: campaign.name || 'New Campaign',
          description: campaign.description,
          worldId: campaign.worldId,
          worldName: 'Amber',
          gameSystem: campaign.gameSystem,
          status: 'planned',
          sessionCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrl: 'https://via.placeholder.com/300x200?text=New+Campaign'
        };
      }

      const response = await axios.post(`${API_BASE_URL}/campaigns`, campaign);
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      // In development mode, return a mock created campaign
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock created campaign after error');
        return {
          id: Math.random().toString(36).substring(7),
          name: campaign.name || 'New Campaign',
          description: campaign.description,
          worldId: campaign.worldId,
          worldName: 'Amber',
          gameSystem: campaign.gameSystem,
          status: 'planned',
          sessionCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrl: 'https://via.placeholder.com/300x200?text=New+Campaign'
        };
      }
      throw error;
    }
  }

  /**
   * Update an existing campaign
   * @param id Campaign ID
   * @param campaign Campaign data to update
   * @returns Updated campaign
   */
  public async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    try {
      // In development mode, return a mock updated campaign
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock updated campaign');
        return {
          id,
          name: campaign.name || 'Updated Campaign',
          description: campaign.description,
          worldId: campaign.worldId,
          worldName: 'Amber',
          gameSystem: campaign.gameSystem,
          status: campaign.status || 'active',
          sessionCount: 0,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date().toISOString(),
          imageUrl: campaign.imageUrl || 'https://via.placeholder.com/300x200?text=Updated+Campaign'
        };
      }

      const response = await axios.put(`${API_BASE_URL}/campaigns/${id}`, campaign);
      return response.data;
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      // In development mode, return a mock updated campaign
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock updated campaign after error');
        return {
          id,
          name: campaign.name || 'Updated Campaign',
          description: campaign.description,
          worldId: campaign.worldId,
          worldName: 'Amber',
          gameSystem: campaign.gameSystem,
          status: campaign.status || 'active',
          sessionCount: 0,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date().toISOString(),
          imageUrl: campaign.imageUrl || 'https://via.placeholder.com/300x200?text=Updated+Campaign'
        };
      }
      throw error;
    }
  }

  /**
   * Get campaigns by world ID
   * @param worldId World ID
   * @returns List of campaigns in the specified world
   */
  public async getCampaignsByWorldId(worldId: string): Promise<Campaign[]> {
    try {
      // In development mode, return mock campaigns for this world
      if (process.env.NODE_ENV === 'development') {
        console.log(`Development mode: Returning mock campaigns for world ${worldId}`);
        return [
          {
            id: '1',
            name: 'Amber Chronicles',
            description: 'A campaign set in the world of Amber',
            worldId: worldId,
            gameSystem: 'Amber Diceless',
            sessionCount: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Amber+Chronicles'
          },
          {
            id: '3',
            name: 'Pattern Masters',
            description: 'The struggle for the Pattern',
            worldId: worldId,
            gameSystem: 'Amber Diceless',
            sessionCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Pattern+Masters'
          }
        ];
      }

      const response = await axios.get(`${API_BASE_URL}/campaigns?worldId=${worldId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaigns for world ${worldId}:`, error);
      // In development mode, return mock campaigns for this world
      if (process.env.NODE_ENV === 'development') {
        console.log(`Development mode: Returning mock campaigns for world ${worldId} after error`);
        return [
          {
            id: '1',
            name: 'Amber Chronicles',
            description: 'A campaign set in the world of Amber',
            worldId: worldId,
            gameSystem: 'Amber Diceless',
            sessionCount: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Amber+Chronicles'
          },
          {
            id: '3',
            name: 'Pattern Masters',
            description: 'The struggle for the Pattern',
            worldId: worldId,
            gameSystem: 'Amber Diceless',
            sessionCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Pattern+Masters'
          }
        ];
      }
      throw error;
    }
  }

  /**
   * Delete a campaign
   * @param id Campaign ID
   * @returns Success status
   */
  public async deleteCampaign(id: string): Promise<boolean> {
    try {
      // In development mode, return success
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock delete success');
        return true;
      }

      await axios.delete(`${API_BASE_URL}/campaigns/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      // In development mode, return success
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock delete success after error');
        return true;
      }
      throw error;
    }
  }
}

export default new CampaignService();
