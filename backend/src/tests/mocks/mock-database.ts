import { DatabaseService } from '../../services/database.service';
import { Transaction } from 'neo4j-driver';

/**
 * Mock database service for testing
 */
export class MockDatabaseService extends DatabaseService {
  private mockData: Map<string, any[]>;

  constructor() {
    super();
    this.mockData = new Map();
  }

  /**
   * Initialize the mock database
   */
  public async initialize(): Promise<void> {
    // No-op for mock
    return Promise.resolve();
  }

  /**
   * Close the mock database
   */
  public async close(): Promise<void> {
    // No-op for mock
    return Promise.resolve();
  }

  /**
   * Execute a read transaction
   * @param callback Transaction callback
   * @returns Result of the transaction
   */
  public async readTransaction<T>(
    callback: (tx: Transaction) => Promise<T>
  ): Promise<T> {
    const mockTransaction = this.createMockTransaction();
    return callback(mockTransaction as unknown as Transaction);
  }

  /**
   * Execute a write transaction
   * @param callback Transaction callback
   * @returns Result of the transaction
   */
  public async writeTransaction<T>(
    callback: (tx: Transaction) => Promise<T>
  ): Promise<T> {
    const mockTransaction = this.createMockTransaction();
    return callback(mockTransaction as unknown as Transaction);
  }

  /**
   * Create a mock transaction
   * @returns Mock transaction
   */
  private createMockTransaction() {
    return {
      run: async (query: string, params?: Record<string, any>) => {
        // Parse the query to determine the operation
        const operation = this.parseQuery(query);
        
        // Execute the operation
        switch (operation.type) {
          case 'MATCH':
            return this.executeMockMatch(operation, params);
          case 'CREATE':
            return this.executeMockCreate(operation, params);
          case 'DELETE':
            return this.executeMockDelete(operation, params);
          case 'MERGE':
            return this.executeMockMerge(operation, params);
          default:
            // For simple queries like 'RETURN 1'
            if (query.includes('RETURN 1')) {
              return {
                records: [{ get: (key: string) => ({ toNumber: () => 1 }) }],
              };
            }
            
            // For schema initialization queries
            if (query.includes('CREATE CONSTRAINT') || query.includes('CREATE INDEX')) {
              return { records: [] };
            }
            
            // Default empty response
            return { records: [] };
        }
      },
    };
  }

  /**
   * Parse a Cypher query
   * @param query Cypher query
   * @returns Parsed operation
   */
  private parseQuery(query: string): { type: string; label?: string; properties?: string[] } {
    // Simple parser for demonstration purposes
    if (query.includes('MATCH')) {
      const labelMatch = query.match(/\([\w:]*:(\w+)\)/);
      const label = labelMatch ? labelMatch[1] : undefined;
      return { type: 'MATCH', label };
    } else if (query.includes('CREATE')) {
      const labelMatch = query.match(/\([\w:]*:(\w+)\)/);
      const label = labelMatch ? labelMatch[1] : undefined;
      return { type: 'CREATE', label };
    } else if (query.includes('DELETE')) {
      return { type: 'DELETE' };
    } else if (query.includes('MERGE')) {
      const labelMatch = query.match(/\([\w:]*:(\w+)\)/);
      const label = labelMatch ? labelMatch[1] : undefined;
      return { type: 'MERGE', label };
    }
    
    return { type: 'UNKNOWN' };
  }

  /**
   * Execute a mock MATCH operation
   * @param operation Parsed operation
   * @param params Query parameters
   * @returns Mock result
   */
  private executeMockMatch(
    operation: { type: string; label?: string },
    params?: Record<string, any>
  ) {
    if (!operation.label) {
      return { records: [] };
    }
    
    // Get data for the label
    const data = this.mockData.get(operation.label) || [];
    
    // Filter data based on parameters
    let filteredData = data;
    if (params) {
      filteredData = data.filter((item) => {
        for (const [key, value] of Object.entries(params)) {
          if (item[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Convert to Neo4j-like records
    const records = filteredData.map((item) => ({
      get: (key: string) => item[key],
    }));
    
    return { records };
  }

  /**
   * Execute a mock CREATE operation
   * @param operation Parsed operation
   * @param params Query parameters
   * @returns Mock result
   */
  private executeMockCreate(
    operation: { type: string; label?: string },
    params?: Record<string, any>
  ) {
    if (!operation.label || !params) {
      return { records: [] };
    }
    
    // Get or create data array for the label
    if (!this.mockData.has(operation.label)) {
      this.mockData.set(operation.label, []);
    }
    
    // Add new item
    const data = this.mockData.get(operation.label)!;
    data.push({ ...params });
    
    return { records: [{ get: () => params }] };
  }

  /**
   * Execute a mock DELETE operation
   * @param operation Parsed operation
   * @param params Query parameters
   * @returns Mock result
   */
  private executeMockDelete(
    operation: { type: string },
    params?: Record<string, any>
  ) {
    // For simplicity, we don't actually delete anything in this mock
    return { records: [] };
  }

  /**
   * Execute a mock MERGE operation
   * @param operation Parsed operation
   * @param params Query parameters
   * @returns Mock result
   */
  private executeMockMerge(
    operation: { type: string; label?: string },
    params?: Record<string, any>
  ) {
    if (!operation.label || !params) {
      return { records: [] };
    }
    
    // Get or create data array for the label
    if (!this.mockData.has(operation.label)) {
      this.mockData.set(operation.label, []);
    }
    
    // Check if item exists
    const data = this.mockData.get(operation.label)!;
    const existingItemIndex = data.findIndex((item) => {
      for (const [key, value] of Object.entries(params)) {
        if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
    
    // Update or create item
    if (existingItemIndex >= 0) {
      data[existingItemIndex] = { ...data[existingItemIndex], ...params };
    } else {
      data.push({ ...params });
    }
    
    return { records: [{ get: () => params }] };
  }

  /**
   * Set mock data for testing
   * @param label Node label
   * @param data Mock data
   */
  public setMockData(label: string, data: any[]): void {
    this.mockData.set(label, [...data]);
  }

  /**
   * Get mock data for testing
   * @param label Node label
   * @returns Mock data
   */
  public getMockData(label: string): any[] {
    return this.mockData.get(label) || [];
  }

  /**
   * Clear all mock data
   */
  public clearMockData(): void {
    this.mockData.clear();
  }
}
