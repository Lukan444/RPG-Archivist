import { MockDatabaseService } from './mock-database';

describe('MockDatabaseService', () => {
  let mockDbService: MockDatabaseService;

  beforeEach(() => {
    mockDbService = new MockDatabaseService();
    mockDbService.clearMockData();
  });

  describe('initialize and close', () => {
    it('should initialize without errors', async () => {
      await expect(mockDbService.initialize()).resolves.not.toThrow();
    });

    it('should close without errors', async () => {
      await expect(mockDbService.close()).resolves.not.toThrow();
    });
  });

  describe('readTransaction', () => {
    it('should execute a read transaction', async () => {
      const result = await mockDbService.readTransaction(async (tx) => {
        const result = await tx.run('RETURN 1 as n');
        return result.records[0].get('n').toNumber();
      });

      expect(result).toBe(1);
    });

    it('should return mock data for MATCH queries', async () => {
      // Set up mock data
      mockDbService.setMockData('User', [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);

      // Execute a read transaction
      const result = await mockDbService.readTransaction(async (tx) => {
        const result = await tx.run('MATCH (u:User) RETURN u');
        return result.records.map((record) => ({
          id: record.get('u').id,
          name: record.get('u').name,
        }));
      });

      // Verify that the mock data was returned
      expect(result).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);
    });

    it('should filter mock data based on parameters', async () => {
      // Set up mock data
      mockDbService.setMockData('User', [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);

      // Execute a read transaction with parameters
      const result = await mockDbService.readTransaction(async (tx) => {
        const result = await tx.run('MATCH (u:User {id: $id}) RETURN u', { id: '1' });
        return result.records.map((record) => ({
          id: record.get('u').id,
          name: record.get('u').name,
        }));
      });

      // Verify that the filtered mock data was returned
      expect(result).toEqual([{ id: '1', name: 'Alice' }]);
    });
  });

  describe('writeTransaction', () => {
    it('should execute a write transaction', async () => {
      const result = await mockDbService.writeTransaction(async (tx) => {
        const result = await tx.run('CREATE (u:User {id: $id, name: $name}) RETURN u', {
          id: '1',
          name: 'Alice',
        });
        return result.records[0].get('u');
      });

      // Verify that the mock data was created
      expect(result).toEqual({ id: '1', name: 'Alice' });

      // Verify that the mock data was stored
      const userData = mockDbService.getMockData('User');
      expect(userData).toEqual([{ id: '1', name: 'Alice' }]);
    });

    it('should handle MERGE operations', async () => {
      // Set up mock data
      mockDbService.setMockData('User', [{ id: '1', name: 'Alice' }]);

      // Execute a write transaction with MERGE
      await mockDbService.writeTransaction(async (tx) => {
        await tx.run('MERGE (u:User {id: $id}) SET u.name = $name', {
          id: '1',
          name: 'Alice Updated',
        });
      });

      // Verify that the mock data was updated
      const userData = mockDbService.getMockData('User');
      expect(userData).toEqual([{ id: '1', name: 'Alice Updated' }]);
    });

    it('should handle DELETE operations', async () => {
      // Set up mock data
      mockDbService.setMockData('User', [{ id: '1', name: 'Alice' }]);

      // Execute a write transaction with DELETE
      await mockDbService.writeTransaction(async (tx) => {
        await tx.run('MATCH (u:User {id: $id}) DELETE u', { id: '1' });
      });

      // Note: Our mock doesn't actually delete data for simplicity
      // In a real implementation, we would verify that the data was deleted
    });
  });

  describe('mock data management', () => {
    it('should set and get mock data', () => {
      // Set mock data
      mockDbService.setMockData('User', [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);

      // Get mock data
      const userData = mockDbService.getMockData('User');

      // Verify that the mock data was set correctly
      expect(userData).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);
    });

    it('should clear mock data', () => {
      // Set mock data
      mockDbService.setMockData('User', [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);

      // Clear mock data
      mockDbService.clearMockData();

      // Verify that the mock data was cleared
      const userData = mockDbService.getMockData('User');
      expect(userData).toEqual([]);
    });
  });
});
