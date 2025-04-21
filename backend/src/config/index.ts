import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Application version
  version: process.env.npm_package_version || '1.0.0',
  
  // Server configuration
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  
  // Neo4j database configuration
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
  },
  
  // File upload configuration
  upload: {
    directory: process.env.UPLOAD_DIRECTORY || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  
  // Sentry error reporting configuration
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
};

export default config;
