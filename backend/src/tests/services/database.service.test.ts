import { DatabaseService } from '../../services/database.service';
import neo4j from 'neo4j-driver';

// Mock Neo4j driver
jest.mock('neo4j-driver');

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  const mockDriver = {
    session: jest.fn(),
    close: jest.fn(),
  };
  const mockSession = {
    run: jest.fn(),
    close: jest.fn(),
    readTransaction: jest.fn(),
    writeTransaction: jest.fn(),
  };
  const mockTransaction = {
    run: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    (neo4j.driver as jest.Mock).mockReturnValue(mockDriver);
    mockDriver.session.mockReturnValue(mockSession);
    mockSession.readTransaction.mockImplementation((callback) => callback(mockTransaction));
    mockSession.writeTransaction.mockImplementation((callback) => callback(mockTransaction));
    
    // Create database service instance
    databaseService = new DatabaseService();
  });

  describe('initialize', () => {
    it('should initialize the Neo4j driver', async () => {
      // Act
      await databaseService.initialize();
      
      // Assert
      expect(neo4j.driver).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      // Arrange
      (neo4j.driver as jest.Mock).mockImplementation(() => {
        throw new Error('Connection error');
      });
      
      // Act & Assert
      await expect(databaseService.initialize()).rejects.toThrow('Connection error');
    });
  });

  describe('getSession', () => {
    it('should return a Neo4j session', async () => {
      // Arrange
      await databaseService.initialize();
      
      // Act
      const session = databaseService.getSession();
      
      // Assert
      expect(mockDriver.session).toHaveBeenCalled();
      expect(session).toBe(mockSession);
    });

    it('should throw an error if driver is not initialized', () => {
      // Act & Assert
      expect(() => databaseService.getSession()).toThrow('Neo4j driver not initialized');
    });
  });

  describe('close', () => {
    it('should close the Neo4j driver', async () => {
      // Arrange
      await databaseService.initialize();
      
      // Act
      await databaseService.close();
      
      // Assert
      expect(mockDriver.close).toHaveBeenCalled();
    });

    it('should handle close errors', async () => {
      // Arrange
      await databaseService.initialize();
      mockDriver.close.mockImplementation(() => {
        throw new Error('Close error');
      });
      
      // Act & Assert
      await expect(databaseService.close()).rejects.toThrow('Close error');
    });
  });

  describe('readTransaction', () => {
    it('should execute a read transaction', async () => {
      // Arrange
      await databaseService.initialize();
      const mockResult = { records: [{ get: () => 'test' }] };
      mockTransaction.run.mockResolvedValue(mockResult);
      
      // Act
      const result = await databaseService.readTransaction(async (tx) => {
        const queryResult = await tx.run('MATCH (n) RETURN n LIMIT 1');
        return queryResult.records[0].get();
      });
      
      // Assert
      expect(mockSession.readTransaction).toHaveBeenCalled();
      expect(result).toBe('test');
    });

    it('should handle transaction errors', async () => {
      // Arrange
      await databaseService.initialize();
      mockSession.readTransaction.mockImplementation(() => {
        throw new Error('Transaction error');
      });
      
      // Act & Assert
      await expect(databaseService.readTransaction(async () => {})).rejects.toThrow('Transaction error');
    });
  });

  describe('writeTransaction', () => {
    it('should execute a write transaction', async () => {
      // Arrange
      await databaseService.initialize();
      const mockResult = { records: [{ get: () => 'test' }] };
      mockTransaction.run.mockResolvedValue(mockResult);
      
      // Act
      const result = await databaseService.writeTransaction(async (tx) => {
        const queryResult = await tx.run('CREATE (n:Test) RETURN n');
        return queryResult.records[0].get();
      });
      
      // Assert
      expect(mockSession.writeTransaction).toHaveBeenCalled();
      expect(result).toBe('test');
    });

    it('should handle transaction errors', async () => {
      // Arrange
      await databaseService.initialize();
      mockSession.writeTransaction.mockImplementation(() => {
        throw new Error('Transaction error');
      });
      
      // Act & Assert
      await expect(databaseService.writeTransaction(async () => {})).rejects.toThrow('Transaction error');
    });
  });

  describe('initSchema', () => {
    it('should initialize the database schema', async () => {
      // Arrange
      await databaseService.initialize();
      mockTransaction.run.mockResolvedValue({ records: [] });
      
      // Act
      await databaseService.initSchema();
      
      // Assert
      expect(mockSession.writeTransaction).toHaveBeenCalled();
    });

    it('should handle schema initialization errors', async () => {
      // Arrange
      await databaseService.initialize();
      mockSession.writeTransaction.mockImplementation(() => {
        throw new Error('Schema initialization error');
      });
      
      // Act & Assert
      await expect(databaseService.initSchema()).rejects.toThrow('Schema initialization error');
    });
  });
});
