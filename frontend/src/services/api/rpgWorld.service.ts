import { apiClient } from './api-client';
import { API_BASE_URL } from '../../config';

export interface RPGWorld {
  id: string;
  name: string;
  description?: string;
  gameSystem?: string;
  genre?: string;
  system?: string;
  campaignCount?: number;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}

export interface RPGWorldInput {
  name: string;
  description?: string;
  gameSystem?: string;
  genre?: string;
  system?: string;
  imageUrl?: string;
}

class RPGWorldService {
  /**
   * Get all RPG worlds
   * @returns List of RPG worlds
   */
  public async getRPGWorlds(): Promise<RPGWorld[]> {
    try {
      // In development mode, return mock RPG worlds
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock RPG worlds');
        return [
          {
            id: '1',
            name: 'Amber',
            description: 'The one true world, of which all others are but shadows',
            gameSystem: 'Amber Diceless',
            genre: 'Fantasy',
            system: 'Amber Diceless',
            campaignCount: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Amber'
          },
          {
            id: '2',
            name: 'Courts of Chaos',
            description: 'The realm of chaos at the far end of reality',
            gameSystem: 'Amber Diceless',
            genre: 'Fantasy',
            system: 'Amber Diceless',
            campaignCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Courts+of+Chaos'
          }
        ];
      }

      const response = await apiClient.get(`/rpg-worlds`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching RPG worlds:', error);
      // In development mode, return mock RPG worlds
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock RPG worlds after error');
        return [
          {
            id: '1',
            name: 'Amber',
            description: 'The one true world, of which all others are but shadows',
            gameSystem: 'Amber Diceless',
            genre: 'Fantasy',
            system: 'Amber Diceless',
            campaignCount: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://via.placeholder.com/300x200?text=Amber'
          },
          {
            id: '2',
            name: 'Courts of Chaos',
            description: 'The realm of chaos at the far end of reality',
            gameSystem: 'Amber Diceless',
            genre: 'Fantasy',
            system: 'Amber Diceless',
            campaignCount: 1,
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
   * Get RPG world by ID
   * @param id RPG world ID
   * @returns RPG world details
   */
  public async getRPGWorld(id: string): Promise<RPGWorld> {
    try {
      // In development mode, return a mock RPG world
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock RPG world');
        return {
          id,
          name: id === '1' ? 'Amber' : 'Courts of Chaos',
          description: id === '1' ? 'The one true world, of which all others are but shadows' : 'The realm of chaos at the far end of reality',
          gameSystem: 'Amber Diceless',
          genre: 'Fantasy',
          system: 'Amber Diceless',
          campaignCount: id === '1' ? 2 : 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrl: id === '1' ? 'https://via.placeholder.com/300x200?text=Amber' : 'https://via.placeholder.com/300x200?text=Courts+of+Chaos'
        };
      }

      const response = await apiClient.get(`/rpg-worlds/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching RPG world ${id}:`, error);
      // In development mode, return a mock RPG world
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock RPG world after error');
        return {
          id,
          name: id === '1' ? 'Amber' : 'Courts of Chaos',
          description: id === '1' ? 'The one true world, of which all others are but shadows' : 'The realm of chaos at the far end of reality',
          gameSystem: 'Amber Diceless',
          genre: 'Fantasy',
          system: 'Amber Diceless',
          campaignCount: id === '1' ? 2 : 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrl: id === '1' ? 'https://via.placeholder.com/300x200?text=Amber' : 'https://via.placeholder.com/300x200?text=Courts+of+Chaos'
        };
      }
      throw error;
    }
  }

  /**
   * Create a new RPG world
   * @param rpgWorld RPG world data
   * @returns Created RPG world
   */
  public async createRPGWorld(rpgWorld: Partial<RPGWorld>): Promise<RPGWorld> {
    try {
      // In development mode, return a mock created RPG world
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock created RPG world');
        return {
          id: Math.random().toString(36).substring(7),
          name: rpgWorld.name || 'New RPG World',
          description: rpgWorld.description,
          gameSystem: rpgWorld.gameSystem,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      const response = await apiClient.post(`/rpg-worlds`, rpgWorld);
      return response.data.data;
    } catch (error) {
      console.error('Error creating RPG world:', error);
      // In development mode, return a mock created RPG world
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock created RPG world after error');
        return {
          id: Math.random().toString(36).substring(7),
          name: rpgWorld.name || 'New RPG World',
          description: rpgWorld.description,
          gameSystem: rpgWorld.gameSystem,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  /**
   * Update an existing RPG world
   * @param id RPG world ID
   * @param rpgWorld RPG world data to update
   * @returns Updated RPG world
   */
  public async updateRPGWorld(id: string, rpgWorld: Partial<RPGWorld>): Promise<RPGWorld> {
    try {
      // In development mode, return a mock updated RPG world
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock updated RPG world');
        return {
          id,
          name: rpgWorld.name || 'Updated RPG World',
          description: rpgWorld.description,
          gameSystem: rpgWorld.gameSystem,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date().toISOString()
        };
      }

      const response = await apiClient.put(`/rpg-worlds/${id}`, rpgWorld);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating RPG world ${id}:`, error);
      // In development mode, return a mock updated RPG world
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock updated RPG world after error');
        return {
          id,
          name: rpgWorld.name || 'Updated RPG World',
          description: rpgWorld.description,
          gameSystem: rpgWorld.gameSystem,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  /**
   * Delete a RPG world
   * @param id RPG world ID
   * @returns Success status
   */
  public async deleteRPGWorld(id: string): Promise<boolean> {
    try {
      // In development mode, return success
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock delete success');
        return true;
      }

      await apiClient.delete(`/rpg-worlds/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting RPG world ${id}:`, error);
      // In development mode, return success
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Returning mock delete success after error');
        return true;
      }
      throw error;
    }
  }
}

export default new RPGWorldService();
