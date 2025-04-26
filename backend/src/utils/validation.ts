import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 * @returns Middleware function
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Return validation errors
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array()
      }
    });
  };
};

/**
 * Validate ID parameter
 * @param id ID to validate
 * @returns True if valid UUID, false otherwise
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validate pagination parameters
 * @param page Page number
 * @param limit Items per page
 * @returns Validated pagination parameters
 */
export const validatePagination = (page?: any, limit?: any): { page: number; limit: number } => {
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;

  return {
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum))
  };
};

/**
 * Sanitize search term
 * @param search Search term
 * @returns Sanitized search term
 */
export const sanitizeSearch = (search?: string): string | undefined => {
  if (!search) return undefined;

  // Remove any Neo4j Cypher injection attempts
  return search.replace(/[{}()\[\]|:;,]/g, ' ').trim();
};

/**
 * Validate and parse timestamp
 * @param timestamp Timestamp to validate
 * @returns Validated timestamp or undefined
 */
export const validateTimestamp = (timestamp?: any): number | undefined => {
  if (!timestamp) return undefined;

  const ts = parseInt(timestamp as string, 10);
  if (isNaN(ts)) return undefined;

  return ts;
};

/**
 * Validate and parse boolean
 * @param value Boolean value to validate
 * @returns Validated boolean or undefined
 */
export const validateBoolean = (value?: any): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    if (lowercased === 'true') return true;
    if (lowercased === 'false') return false;
  }

  return undefined;
};

/**
 * Validate request data against a schema
 * @param data Data to validate
 * @param schema Schema to validate against
 * @returns Validation result
 */
export const validateRequest = <T>(data: any, schema: any): { success: boolean; errors?: any; data?: T } => {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        errors: result.error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message
        }))
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [{
        path: 'schema',
        message: error instanceof Error ? error.message : String(error)
      }]
    };
  }
};
