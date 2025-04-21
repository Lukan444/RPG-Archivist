import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

/**
 * Service for session analysis API
 */
export const sessionAnalysisService = {
  /**
   * Get session analysis by ID
   * @param analysisId Analysis ID
   * @returns Session analysis
   */
  getById: async (analysisId: string) => {
    try {
      const response = await axios.get(`/api/session-analyses/${analysisId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting session analysis:', error);
      throw error;
    }
  },

  /**
   * Get session analysis by session ID
   * @param sessionId Session ID
   * @returns Session analysis
   */
  getBySessionId: async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/session-analyses/session/${sessionId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting session analysis by session ID:', error);
      throw error;
    }
  },

  /**
   * Get session analysis by transcription ID
   * @param transcriptionId Transcription ID
   * @returns Session analysis
   */
  getByTranscriptionId: async (transcriptionId: string) => {
    try {
      const response = await axios.get(`/api/session-analyses/transcription/${transcriptionId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting session analysis by transcription ID:', error);
      throw error;
    }
  },

  /**
   * Create session analysis
   * @param sessionId Session ID
   * @param transcriptionId Transcription ID
   * @returns Created session analysis
   */
  create: async (sessionId: string, transcriptionId: string) => {
    try {
      const response = await axios.post(
        '/api/session-analyses',
        {
          session_id: sessionId,
          transcription_id: transcriptionId
        },
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating session analysis:', error);
      throw error;
    }
  },

  /**
   * Delete session analysis
   * @param analysisId Analysis ID
   * @returns Success status
   */
  delete: async (analysisId: string) => {
    try {
      const response = await axios.delete(`/api/session-analyses/${analysisId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting session analysis:', error);
      throw error;
    }
  },

  /**
   * Process session analysis
   * @param analysisId Analysis ID
   * @param options Processing options
   * @returns Processed session analysis
   */
  process: async (analysisId: string, options: any = {}) => {
    try {
      const response = await axios.post(
        `/api/session-analyses/${analysisId}/process`,
        options,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing session analysis:', error);
      throw error;
    }
  }
};
