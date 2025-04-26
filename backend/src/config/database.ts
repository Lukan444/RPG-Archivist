import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database configuration
 */
export const databaseConfig = {
  uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
  username: process.env.NEO4J_USERNAME || 'neo4j',
  password: process.env.NEO4J_PASSWORD || 'password',
};

export default databaseConfig;
