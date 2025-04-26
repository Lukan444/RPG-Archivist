import { DatabaseService } from '../../services/database.service';
import neo4j from 'neo4j-driver';

// Mock neo4j driver
jest.mock('neo4j-driver', () => {
  const mockSession = {
    run: jest.fn().mockResolvedValue({ records: [] }),
    close: jest.fn(),
    readTransaction: jest.fn(async (callback) => await callback(mockTransaction)),
    writeTransaction: jest.fn(async (callback) => await callback(mockTransaction)),
  };

  const mockTransaction = {
    run: jest.fn().mockResolvedValue({ records: [] }),
  };

  const mockDriver = {
    session: jest.fn().mockReturnValue(mockSession),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return {
    auth: {
      basic: jest.fn().mockReturnValue({ username: 'test', password: 'test' }),
    },
    driver: jest.fn().mockReturnValue(mockDriver),
  };
});

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let mockDriver: any;
  let mockSession: any;

  beforeEach(() => {
    jest.clearAllMocks();
    databaseService = new DatabaseService();
    mockDriver = neo4j.driver();
    mockSession = mockDriver.session();
  });

  describe('initialize', () => {
    it('should initialize the Neo4j driver', async () => {
      await databaseService.initialize();
      
      expect(neo4j.driver).toHaveBeenCalled();
      expect(mockSession.run).toHaveBeenCalledWith('RETURN 1');
      expect(mockSession.close).toHaveBeenCalled();
    });

    it('should throw an error if connection fails', async () => {
      const error = new Error('Connection failed');
      mockSession.run.mockRejectedValueOnce(error);
      
      await expect(databaseService.initialize()).rejects.toThrow('Connection failed');
    });
  });

  describe('getSession', () => {
    it('should return a Neo4j session', async () => {
      await databaseService.initialize();
      const session = databaseService.getSession();
      
      expect(mockDriver.session).toHaveBeenCalled();
      expect(session).toBe(mockSession);
    });

    it('should throw an error if driver is not initialized', () => {
      expect(() => databaseService.getSession()).toThrow('Neo4j driver not initialized');
    });
  });

  describe('close', () => {
    it('should close the Neo4j driver', async () => {
      await databaseService.initialize();
      await databaseService.close();
      
      expect(mockDriver.close).toHaveBeenCalled();
    });

    it('should not throw an error if driver is not initialized', async () => {
      await expect(databaseService.close()).resolves.not.toThrow();
    });
  });

  describe('readTransaction', () => {
    it('should execute a read transaction', async () => {
      await databaseService.initialize();
      
      const callback = jest.fn().mockResolvedValue('result');
      const result = await databaseService.readTransaction(callback);
      
      expect(mockSession.readTransaction).toHaveBeenCalledWith(callback);
      expect(mockSession.close).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should close the session even if transaction fails', async () => {
      await databaseService.initialize();
      
      const error = new Error('Transaction failed');
      const callback = jest.fn().mockRejectedValue(error);
      
      await expect(databaseService.readTransaction(callback)).rejects.toThrow('Transaction failed');
      expect(mockSession.close).toHaveBeenCalled();
    });
  });

  describe('writeTransaction', () => {
    it('should execute a write transaction', async () => {
      await databaseService.initialize();
      
      const callback = jest.fn().mockResolvedValue('result');
      const result = await databaseService.writeTransaction(callback);
      
      expect(mockSession.writeTransaction).toHaveBeenCalledWith(callback);
      expect(mockSession.close).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should close the session even if transaction fails', async () => {
      await databaseService.initialize();
      
      const error = new Error('Transaction failed');
      const callback = jest.fn().mockRejectedValue(error);
      
      await expect(databaseService.writeTransaction(callback)).rejects.toThrow('Transaction failed');
      expect(mockSession.close).toHaveBeenCalled();
    });
  });

  describe('initSchema', () => {
    it('should initialize the database schema', async () => {
      await databaseService.initialize();
      await databaseService.initSchema();
      
      // Verify that writeTransaction was called
      expect(mockSession.writeTransaction).toHaveBeenCalled();
    });

    it('should throw an error if schema initialization fails', async () => {
      await databaseService.initialize();
      
      const error = new Error('Schema initialization failed');
      mockSession.writeTransaction.mockRejectedValueOnce(error);
      
      await expect(databaseService.initSchema()).rejects.toThrow('Schema initialization failed');
    });
  });
});
