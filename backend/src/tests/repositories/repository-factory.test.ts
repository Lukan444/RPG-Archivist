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

// Mock repositories
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

describe('RepositoryFactory', () => {
  let repositoryFactory: RepositoryFactory;
  let mockDatabaseService: DatabaseService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    mockDatabaseService = {} as DatabaseService;
    
    // Create repository factory instance
    repositoryFactory = new RepositoryFactory(mockDatabaseService);
  });

  it('should create RPGWorldRepository', () => {
    // Act
    const repository = repositoryFactory.getRPGWorldRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(RPGWorldRepository);
    expect(RPGWorldRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create CampaignRepository', () => {
    // Act
    const repository = repositoryFactory.getCampaignRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(CampaignRepository);
    expect(CampaignRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create SessionRepository', () => {
    // Act
    const repository = repositoryFactory.getSessionRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(SessionRepository);
    expect(SessionRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create CharacterRepository', () => {
    // Act
    const repository = repositoryFactory.getCharacterRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(CharacterRepository);
    expect(CharacterRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create LocationRepository', () => {
    // Act
    const repository = repositoryFactory.getLocationRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(LocationRepository);
    expect(LocationRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create TranscriptionRepository', () => {
    // Act
    const repository = repositoryFactory.getTranscriptionRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(TranscriptionRepository);
    expect(TranscriptionRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create UserRepository', () => {
    // Act
    const repository = repositoryFactory.getUserRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(UserRepository);
    expect(UserRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create PowerRepository', () => {
    // Act
    const repository = repositoryFactory.getPowerRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(PowerRepository);
    expect(PowerRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create ItemRepository', () => {
    // Act
    const repository = repositoryFactory.getItemRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(ItemRepository);
    expect(ItemRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should create EventRepository', () => {
    // Act
    const repository = repositoryFactory.getEventRepository();
    
    // Assert
    expect(repository).toBeInstanceOf(EventRepository);
    expect(EventRepository).toHaveBeenCalledWith(mockDatabaseService);
  });

  it('should reuse existing repository instances', () => {
    // Act
    const repository1 = repositoryFactory.getRPGWorldRepository();
    const repository2 = repositoryFactory.getRPGWorldRepository();
    
    // Assert
    expect(repository1).toBe(repository2);
    expect(RPGWorldRepository).toHaveBeenCalledTimes(1);
  });
});
