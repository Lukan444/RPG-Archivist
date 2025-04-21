import { BaseRepository } from '../../repositories/base.repository';
import { DatabaseService } from '../../services/database.service';

// Mock DatabaseService
jest.mock('../../services/database.service');

describe('BaseRepository', () => {
  let baseRepository: BaseRepository;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    mockDatabaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    
    // Create base repository instance
    baseRepository = new BaseRepository(mockDatabaseService);
  });

  it('should be initialized with a database service', () => {
    // Assert
    expect(baseRepository['dbService']).toBe(mockDatabaseService);
  });
});
