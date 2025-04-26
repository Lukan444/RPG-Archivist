import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { initErrorReporting, sentryRequestHandler, sentryErrorHandler } from './utils/errorReporting';
import config from './config';
import { swaggerRouter } from './routes/swagger.routes';

// Initialize error reporting
initErrorReporting();

// Create Express app
const app = express();

// Apply Sentry request handler
app.use(sentryRequestHandler);

// Apply middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// ... other routes

// Apply Swagger documentation routes
app.use('/api-docs', swaggerRouter);

// Apply Sentry error handler
app.use(sentryErrorHandler);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Error: ${message}`);
  console.error(err.stack);

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
    },
  });
});

export default app;
