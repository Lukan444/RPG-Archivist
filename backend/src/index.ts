import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { DatabaseService } from './services/database.service';
import { RepositoryFactory } from './repositories/repository.factory';
import { rpgWorldRoutes } from './routes/rpg-world.routes';
import { campaignRoutes } from './routes/campaign.routes';
import { sessionRoutes } from './routes/session.routes';
import { characterRoutes } from './routes/character.routes';
import { locationRoutes } from './routes/location.routes';
import { userRoutes } from './routes/user.routes';
import { authRoutes } from './routes/auth.routes';
import { powerRoutes } from './routes/power.routes';
import { itemRoutes } from './routes/item.routes';
import { eventRoutes } from './routes/event.routes';
import { audioRecordingRoutes } from './routes/audio-recording.routes';
import { transcriptionRoutes } from './routes/transcription.routes';
import { sessionAnalysisRoutes } from './routes/session-analysis.routes';
import { graphRoutes } from './routes/graph.routes';
import path from 'path';

// Initialize database service
const dbService = new DatabaseService();
const repositoryFactory = new RepositoryFactory(dbService);

// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes(repositoryFactory));
app.use('/api/users', userRoutes(repositoryFactory));
app.use('/api/rpg-worlds', rpgWorldRoutes(repositoryFactory));
app.use('/api/campaigns', campaignRoutes(repositoryFactory));
app.use('/api/sessions', sessionRoutes(repositoryFactory));
app.use('/api/characters', characterRoutes(repositoryFactory));
app.use('/api/locations', locationRoutes(repositoryFactory));
app.use('/api/powers', powerRoutes(repositoryFactory));
app.use('/api/items', itemRoutes(repositoryFactory));
app.use('/api/events', eventRoutes(repositoryFactory));
app.use('/api/audio-recordings', audioRecordingRoutes(repositoryFactory));
app.use('/api/transcriptions', transcriptionRoutes(repositoryFactory));
app.use('/api/session-analyses', sessionAnalysisRoutes(repositoryFactory));
app.use('/api/graph', graphRoutes(repositoryFactory));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await dbService.initialize();
    await dbService.initSchema();

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await dbService.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
startServer();