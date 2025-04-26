import { BaseRepository } from '../../repositories/base.repository';
import { DatabaseService } from '../../services/database.service';

// Mock DatabaseService
jest.mock('../../services/database.service');

describe('BaseRepository', () => {
  let baseRepository: BaseRepository;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a mock DatabaseService
    mockDatabaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    
    // Create a new BaseRepository instance with the mock DatabaseService
    baseRepository = new BaseRepository(mockDatabaseService);
  });

  describe('constructor', () => {
    it('should initialize with DatabaseService', () => {
      // Verify that the DatabaseService was set correctly
      expect((baseRepository as any).dbService).toBe(mockDatabaseService);
    });
  });
});
