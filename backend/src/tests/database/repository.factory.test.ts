import { RepositoryFactory } from '../../repositories/repository.factory';
import { DatabaseService } from '../../services/database.service';
import { RPGWorldRepository } from '../../repositories/rpg-world.repository';
import { CampaignRepository } from '../../repositories/campaign.repository';
import { SessionRepository } from '../../repositories/session.repository';
import { CharacterRepository } from '../../repositories/character.repository';
import { LocationRepository } from '../../repositories/location.repository';
import { TranscriptionRepository } from '../../repositories/transcription.repository';
import { UserRepository } from '../../repositories/user.repository';
import { PowerRepository } from '../../repositories/power.repository';
import { ItemRepository } from '../../repositories/item.repository';
import { EventRepository } from '../../repositories/event.repository';
import { AudioRecordingRepository } from '../../repositories/audio-recording.repository';
import { SessionAnalysisRepository } from '../../repositories/session-analysis.repository';
import { GraphRepository } from '../../repositories/graph.repository';
import { LLMRepository } from '../../repositories/llm.repository';
import { ChangeProposalRepository } from '../../repositories/change-proposal.repository';
import { ContentAnalysisRepository } from '../../repositories/content-analysis.repository';

// Mock all repositories
jest.mock('../../repositories/rpg-world.repository');
jest.mock('../../repositories/campaign.repository');
jest.mock('../../repositories/session.repository');
jest.mock('../../repositories/character.repository');
jest.mock('../../repositories/location.repository');
jest.mock('../../repositories/transcription.repository');
jest.mock('../../repositories/user.repository');
jest.mock('../../repositories/power.repository');
jest.mock('../../repositories/item.repository');
jest.mock('../../repositories/event.repository');
jest.mock('../../repositories/audio-recording.repository');
jest.mock('../../repositories/session-analysis.repository');
jest.mock('../../repositories/graph.repository');
jest.mock('../../repositories/llm.repository');
jest.mock('../../repositories/change-proposal.repository');
jest.mock('../../repositories/content-analysis.repository');

// Mock DatabaseService
jest.mock('../../services/database.service');

describe('RepositoryFactory', () => {
  let repositoryFactory: RepositoryFactory;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a mock DatabaseService
    mockDatabaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    
    // Create a new RepositoryFactory instance with the mock DatabaseService
    repositoryFactory = new RepositoryFactory(mockDatabaseService);
  });

  describe('constructor', () => {
    it('should initialize with DatabaseService', () => {
      // Verify that the DatabaseService was set correctly
      expect((repositoryFactory as any).dbService).toBe(mockDatabaseService);
      
      // Verify that the repositories map was initialized
      expect((repositoryFactory as any).repositories).toBeInstanceOf(Map);
      expect((repositoryFactory as any).repositories.size).toBe(0);
    });
  });

  describe('getRepository', () => {
    it('should create a new repository if it does not exist', () => {
      // Use a private method for testing
      const getRepository = (repositoryFactory as any).getRepository.bind(repositoryFactory);
      
      // Create a mock factory function
      const mockFactory = jest.fn().mockReturnValue('repository');
      
      // Call getRepository
      const repository = getRepository('test', mockFactory);
      
      // Verify that the factory function was called
      expect(mockFactory).toHaveBeenCalled();
      
      // Verify that the repository was returned
      expect(repository).toBe('repository');
      
      // Verify that the repository was added to the map
      expect((repositoryFactory as any).repositories.get('test')).toBe('repository');
    });

    it('should return an existing repository if it exists', () => {
      // Use a private method for testing
      const getRepository = (repositoryFactory as any).getRepository.bind(repositoryFactory);
      
      // Set up the repositories map
      (repositoryFactory as any).repositories.set('test', 'repository');
      
      // Create a mock factory function
      const mockFactory = jest.fn().mockReturnValue('new repository');
      
      // Call getRepository
      const repository = getRepository('test', mockFactory);
      
      // Verify that the factory function was not called
      expect(mockFactory).not.toHaveBeenCalled();
      
      // Verify that the existing repository was returned
      expect(repository).toBe('repository');
    });
  });

  describe('repository getters', () => {
    it('should return an RPGWorldRepository', () => {
      const repository = repositoryFactory.getRPGWorldRepository();
      
      // Verify that the repository is an instance of RPGWorldRepository
      expect(repository).toBeInstanceOf(RPGWorldRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(RPGWorldRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a CampaignRepository', () => {
      const repository = repositoryFactory.getCampaignRepository();
      
      // Verify that the repository is an instance of CampaignRepository
      expect(repository).toBeInstanceOf(CampaignRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(CampaignRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a SessionRepository', () => {
      const repository = repositoryFactory.getSessionRepository();
      
      // Verify that the repository is an instance of SessionRepository
      expect(repository).toBeInstanceOf(SessionRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(SessionRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a CharacterRepository', () => {
      const repository = repositoryFactory.getCharacterRepository();
      
      // Verify that the repository is an instance of CharacterRepository
      expect(repository).toBeInstanceOf(CharacterRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(CharacterRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a LocationRepository', () => {
      const repository = repositoryFactory.getLocationRepository();
      
      // Verify that the repository is an instance of LocationRepository
      expect(repository).toBeInstanceOf(LocationRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(LocationRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a TranscriptionRepository', () => {
      const repository = repositoryFactory.getTranscriptionRepository();
      
      // Verify that the repository is an instance of TranscriptionRepository
      expect(repository).toBeInstanceOf(TranscriptionRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(TranscriptionRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a UserRepository', () => {
      const repository = repositoryFactory.getUserRepository();
      
      // Verify that the repository is an instance of UserRepository
      expect(repository).toBeInstanceOf(UserRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(UserRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a PowerRepository', () => {
      const repository = repositoryFactory.getPowerRepository();
      
      // Verify that the repository is an instance of PowerRepository
      expect(repository).toBeInstanceOf(PowerRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(PowerRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return an ItemRepository', () => {
      const repository = repositoryFactory.getItemRepository();
      
      // Verify that the repository is an instance of ItemRepository
      expect(repository).toBeInstanceOf(ItemRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(ItemRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return an EventRepository', () => {
      const repository = repositoryFactory.getEventRepository();
      
      // Verify that the repository is an instance of EventRepository
      expect(repository).toBeInstanceOf(EventRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(EventRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return an AudioRecordingRepository', () => {
      const repository = repositoryFactory.getAudioRecordingRepository();
      
      // Verify that the repository is an instance of AudioRecordingRepository
      expect(repository).toBeInstanceOf(AudioRecordingRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(AudioRecordingRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a SessionAnalysisRepository', () => {
      const repository = repositoryFactory.getSessionAnalysisRepository();
      
      // Verify that the repository is an instance of SessionAnalysisRepository
      expect(repository).toBeInstanceOf(SessionAnalysisRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(SessionAnalysisRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a GraphRepository', () => {
      const repository = repositoryFactory.getGraphRepository();
      
      // Verify that the repository is an instance of GraphRepository
      expect(repository).toBeInstanceOf(GraphRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(GraphRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a LLMRepository', () => {
      const repository = repositoryFactory.getLLMRepository();
      
      // Verify that the repository is an instance of LLMRepository
      expect(repository).toBeInstanceOf(LLMRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(LLMRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a ChangeProposalRepository', () => {
      const repository = repositoryFactory.getChangeProposalRepository();
      
      // Verify that the repository is an instance of ChangeProposalRepository
      expect(repository).toBeInstanceOf(ChangeProposalRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(ChangeProposalRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should return a ContentAnalysisRepository', () => {
      const repository = repositoryFactory.getContentAnalysisRepository();
      
      // Verify that the repository is an instance of ContentAnalysisRepository
      expect(repository).toBeInstanceOf(ContentAnalysisRepository);
      
      // Verify that the repository was created with the DatabaseService
      expect(ContentAnalysisRepository).toHaveBeenCalledWith(mockDatabaseService);
    });

    it('should cache repositories', () => {
      // Get the repository twice
      const repository1 = repositoryFactory.getRPGWorldRepository();
      const repository2 = repositoryFactory.getRPGWorldRepository();
      
      // Verify that the repository was only created once
      expect(RPGWorldRepository).toHaveBeenCalledTimes(1);
      
      // Verify that the same repository instance was returned
      expect(repository1).toBe(repository2);
    });
  });
});
