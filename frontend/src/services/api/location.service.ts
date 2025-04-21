import apiClient from './client';
import { AxiosResponse } from 'axios';

// Location interface
export interface Location {
  id: string;
  name: string;
  description: string;
  locationType: string;
  worldId: string;
  worldName?: string;
  campaignId?: string;
  campaignName?: string;
  parentLocationId?: string;
  parentLocationName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  characterCount?: number;
  childLocationCount?: number;
  sessionCount?: number;
}

// Location creation/update interface
export interface LocationInput {
  name: string;
  description: string;
  locationType: string;
  worldId: string;
  campaignId?: string;
  parentLocationId?: string;
  imageUrl?: string;
}

// Location service
const LocationService = {
  /**
   * Get all Locations
   * @returns List of Locations
   */
  getAllLocations: async (): Promise<Location[]> => {
    const response: AxiosResponse<{ success: boolean; data: Location[] }> = await apiClient.get('/locations');
    return response.data.data;
  },

  /**
   * Get Locations by World ID
   * @param worldId World ID
   * @returns List of Locations
   */
  getLocationsByWorldId: async (worldId: string): Promise<Location[]> => {
    const response: AxiosResponse<{ success: boolean; data: Location[] }> = await apiClient.get(/worlds//locations);
    return response.data.data;
  },

  /**
   * Get Locations by Campaign ID
   * @param campaignId Campaign ID
   * @returns List of Locations
   */
  getLocationsByCampaignId: async (campaignId: string): Promise<Location[]> => {
    const response: AxiosResponse<{ success: boolean; data: Location[] }> = await apiClient.get(/campaigns//locations);
    return response.data.data;
  },

  /**
   * Get Locations by Session ID
   * @param sessionId Session ID
   * @returns List of Locations
   */
  getLocationsBySessionId: async (sessionId: string): Promise<Location[]> => {
    const response: AxiosResponse<{ success: boolean; data: Location[] }> = await apiClient.get(/sessions//locations);
    return response.data.data;
  },

  /**
   * Get Child Locations by Parent Location ID
   * @param locationId Parent Location ID
   * @returns List of Child Locations
   */
  getChildLocationsByParentId: async (locationId: string): Promise<Location[]> => {
    const response: AxiosResponse<{ success: boolean; data: Location[] }> = await apiClient.get(/locations//children);
    return response.data.data;
  },

  /**
   * Get Location by ID
   * @param id Location ID
   * @returns Location
   */
  getLocationById: async (id: string): Promise<Location> => {
    const response: AxiosResponse<{ success: boolean; data: Location }> = await apiClient.get(/locations/);
    return response.data.data;
  },

  /**
   * Create new Location
   * @param locationData Location data
   * @returns Created Location
   */
  createLocation: async (locationData: LocationInput): Promise<Location> => {
    const response: AxiosResponse<{ success: boolean; data: Location }> = await apiClient.post('/locations', locationData);
    return response.data.data;
  },

  /**
   * Update Location
   * @param id Location ID
   * @param locationData Location data
   * @returns Updated Location
   */
  updateLocation: async (id: string, locationData: Partial<LocationInput>): Promise<Location> => {
    const response: AxiosResponse<{ success: boolean; data: Location }> = await apiClient.put(/locations/, locationData);
    return response.data.data;
  },

  /**
   * Delete Location
   * @param id Location ID
   * @returns Success status
   */
  deleteLocation: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/locations/);
    return response.data.success;
  },

  /**
   * Upload image for Location
   * @param id Location ID
   * @param file Image file
   * @returns Image URL
   */
  uploadLocationImage: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      /locations//image,
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
   * Generate image for Location using AI
   * @param id Location ID
   * @param prompt Image generation prompt
   * @returns Image URL
   */
  generateLocationImage: async (id: string, prompt: string): Promise<string> => {
    const response: AxiosResponse<{ success: boolean; data: { imageUrl: string } }> = await apiClient.post(
      /locations//generate-image,
      { prompt }
    );
    
    return response.data.data.imageUrl;
  },

  /**
   * Delete Location image
   * @param id Location ID
   * @returns Success status
   */
  deleteLocationImage: async (id: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/locations//image);
    return response.data.success;
  },

  /**
   * Add Location to Session
   * @param locationId Location ID
   * @param sessionId Session ID
   * @returns Success status
   */
  addLocationToSession: async (locationId: string, sessionId: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.post(/locations//sessions/);
    return response.data.success;
  },

  /**
   * Remove Location from Session
   * @param locationId Location ID
   * @param sessionId Session ID
   * @returns Success status
   */
  removeLocationFromSession: async (locationId: string, sessionId: string): Promise<boolean> => {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(/locations//sessions/);
    return response.data.success;
  },

  /**
   * Get Characters at Location
   * @param locationId Location ID
   * @returns List of Characters
   */
  getCharactersAtLocation: async (locationId: string): Promise<any[]> => {
    const response: AxiosResponse<{ success: boolean; data: any[] }> = await apiClient.get(/locations//characters);
    return response.data.data;
  },
};

export default LocationService;
