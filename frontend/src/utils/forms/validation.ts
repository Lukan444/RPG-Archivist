import * as Yup from 'yup';

// Common validation schemas
export const validationSchemas = {
  // String validations
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  
  title: Yup.string()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be at most 100 characters'),
  
  description: Yup.string()
    .max(2000, 'Description must be at most 2000 characters'),
  
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  
  confirmPassword: (fieldName: string = 'password') => 
    Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref(fieldName)], 'Passwords must match'),
  
  // Number validations
  positiveNumber: Yup.number()
    .required('Value is required')
    .positive('Value must be positive'),
  
  nonNegativeNumber: Yup.number()
    .required('Value is required')
    .min(0, 'Value must be non-negative'),
  
  // Date validations
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  
  futureDate: Yup.date()
    .required('Date is required')
    .min(new Date(), 'Date must be in the future'),
  
  // ID validations
  uuid: Yup.string()
    .required('ID is required')
    .matches(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'Invalid ID format'
    ),
  
  // Array validations
  nonEmptyArray: Yup.array()
    .required('At least one item is required')
    .min(1, 'At least one item is required'),
};

// Helper function to create a validation schema for a form
export const createValidationSchema = (fields: Record<string, Yup.Schema>) => {
  return Yup.object().shape(fields);
};

// Example schemas for different forms
export const authSchemas = {
  login: createValidationSchema({
    email: validationSchemas.email,
    password: Yup.string().required('Password is required'),
  }),
  
  register: createValidationSchema({
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .matches(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    email: validationSchemas.email,
    password: validationSchemas.password,
    confirmPassword: validationSchemas.confirmPassword(),
  }),
  
  forgotPassword: createValidationSchema({
    email: validationSchemas.email,
  }),
  
  resetPassword: createValidationSchema({
    password: validationSchemas.password,
    confirmPassword: validationSchemas.confirmPassword(),
  }),
};

export const rpgWorldSchemas = {
  create: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
  }),
  
  update: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
  }),
};

export const campaignSchemas = {
  create: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    rpg_world_id: validationSchemas.uuid,
  }),
  
  update: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
  }),
};

export const sessionSchemas = {
  create: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    campaign_id: validationSchemas.uuid,
    session_date: Yup.date().nullable(),
  }),
  
  update: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    session_date: Yup.date().nullable(),
  }),
};

export const characterSchemas = {
  create: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    campaign_id: validationSchemas.uuid,
    character_type: Yup.string().required('Character type is required'),
  }),
  
  update: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    character_type: Yup.string(),
  }),
};

export const locationSchemas = {
  create: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    campaign_id: validationSchemas.uuid,
    location_type: Yup.string().required('Location type is required'),
  }),
  
  update: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    location_type: Yup.string(),
  }),
};

export const itemSchemas = {
  create: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    campaign_id: validationSchemas.uuid,
    item_type: Yup.string().required('Item type is required'),
    value: Yup.number().min(0, 'Value must be non-negative'),
    weight: Yup.number().min(0, 'Weight must be non-negative'),
  }),
  
  update: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    item_type: Yup.string(),
    value: Yup.number().min(0, 'Value must be non-negative'),
    weight: Yup.number().min(0, 'Weight must be non-negative'),
  }),
};

export const eventSchemas = {
  create: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    campaign_id: validationSchemas.uuid,
    event_type: Yup.string().required('Event type is required'),
    event_date: Yup.string(),
    timeline_position: Yup.number(),
    location_id: Yup.string().uuid('Invalid location ID'),
    session_id: Yup.string().uuid('Invalid session ID'),
  }),
  
  update: createValidationSchema({
    name: validationSchemas.name,
    description: validationSchemas.description,
    event_type: Yup.string(),
    event_date: Yup.string(),
    timeline_position: Yup.number(),
    location_id: Yup.string().uuid('Invalid location ID'),
    session_id: Yup.string().uuid('Invalid session ID'),
  }),
};
