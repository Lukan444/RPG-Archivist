import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../utils/validation';
import { RepositoryFactory } from '../repositories/repository.factory';
import { DatabaseService } from '../services/database.service';

/**
 * Auth routes
 * @param repositoryFactory Repository factory
 * @returns Router
 */
export const authRouter = (repositoryFactory: RepositoryFactory): Router => {
  const router = Router();
  const authController = new AuthController(repositoryFactory);

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: johndoe
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john.doe@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: Password123!
   *               name:
   *                 type: string
   *                 example: John Doe
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       properties:
   *                         user_id:
   *                           type: string
   *                           example: 123e4567-e89b-12d3-a456-426614174000
   *                         username:
   *                           type: string
   *                           example: johndoe
   *                         email:
   *                           type: string
   *                           example: john.doe@example.com
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: VALIDATION_ERROR
   *                     message:
   *                       type: string
   *                       example: Validation failed
   *                     details:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           param:
   *                             type: string
   *                             example: email
   *                           msg:
   *                             type: string
   *                             example: Invalid email format
   *       409:
   *         description: User already exists
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: USER_EXISTS
   *                     message:
   *                       type: string
   *                       example: User with this email or username already exists
   */
  router.post(
    '/register',
    validate([
      body('username')
        .isString()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
      body('email')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
      body('password')
        .isString()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
      body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
    ]),
    authController.register.bind(authController)
  );

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: johndoe
   *               password:
   *                 type: string
   *                 format: password
   *                 example: Password123!
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       properties:
   *                         user_id:
   *                           type: string
   *                           example: 123e4567-e89b-12d3-a456-426614174000
   *                         username:
   *                           type: string
   *                           example: johndoe
   *                         email:
   *                           type: string
   *                           example: john.doe@example.com
   *                     tokens:
   *                       type: object
   *                       properties:
   *                         access:
   *                           type: string
   *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                         refresh:
   *                           type: string
   *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: VALIDATION_ERROR
   *                     message:
   *                       type: string
   *                       example: Validation failed
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: INVALID_CREDENTIALS
   *                     message:
   *                       type: string
   *                       example: Invalid username or password
   */
  router.post(
    '/login',
    validate([
      body('username')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
      body('password')
        .isString()
        .notEmpty()
        .withMessage('Password is required')
    ]),
    authController.login.bind(authController)
  );

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     tokens:
   *                       type: object
   *                       properties:
   *                         access:
   *                           type: string
   *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                         refresh:
   *                           type: string
   *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: VALIDATION_ERROR
   *                     message:
   *                       type: string
   *                       example: Validation failed
   *       401:
   *         description: Invalid refresh token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: INVALID_TOKEN
   *                     message:
   *                       type: string
   *                       example: Invalid or expired refresh token
   */
  router.post(
    '/refresh',
    validate([
      body('refreshToken')
        .isString()
        .notEmpty()
        .withMessage('Refresh token is required')
    ]),
    authController.refreshToken.bind(authController)
  );

  return router;
};

/**
 * Create auth router
 * @returns Router
 */
export const createAuthRouter = (): Router => {
  const dbService = new DatabaseService();
  const repositoryFactory = new RepositoryFactory(dbService);
  return authRouter(repositoryFactory);
};
