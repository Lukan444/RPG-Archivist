import * as Yup from 'yup';
import {
  validationSchemas,
  createValidationSchema,
  authSchemas,
  rpgWorldSchemas,
  campaignSchemas,
  sessionSchemas,
  characterSchemas,
  locationSchemas,
  itemSchemas,
  eventSchemas
} from '../validation';

describe('Validation Utils', () => {
  describe('validationSchemas', () => {
    describe('name', () => {
      it('should validate valid name', async () => {
        // Arrange
        const schema = validationSchemas.name;
        const validName = 'Test Name';

        // Act & Assert
        await expect(schema.validate(validName)).resolves.toBe(validName);
      });

      it('should reject empty name', async () => {
        // Arrange
        const schema = validationSchemas.name;

        // Act & Assert
        await expect(schema.validate('')).rejects.toThrow('Name is required');
      });

      it('should reject too short name', async () => {
        // Arrange
        const schema = validationSchemas.name;

        // Act & Assert
        await expect(schema.validate('A')).rejects.toThrow('Name must be at least 2 characters');
      });

      it('should reject too long name', async () => {
        // Arrange
        const schema = validationSchemas.name;
        const longName = 'A'.repeat(101);

        // Act & Assert
        await expect(schema.validate(longName)).rejects.toThrow('Name must be at most 100 characters');
      });
    });

    describe('email', () => {
      it('should validate valid email', async () => {
        // Arrange
        const schema = validationSchemas.email;
        const validEmail = 'test@example.com';

        // Act & Assert
        await expect(schema.validate(validEmail)).resolves.toBe(validEmail);
      });

      it('should reject empty email', async () => {
        // Arrange
        const schema = validationSchemas.email;

        // Act & Assert
        await expect(schema.validate('')).rejects.toThrow('Email is required');
      });

      it('should reject invalid email format', async () => {
        // Arrange
        const schema = validationSchemas.email;

        // Act & Assert
        await expect(schema.validate('invalid-email')).rejects.toThrow('Invalid email format');
      });
    });

    describe('password', () => {
      it('should validate valid password', async () => {
        // Arrange
        const schema = validationSchemas.password;
        const validPassword = 'Password1!';

        // Act & Assert
        await expect(schema.validate(validPassword)).resolves.toBe(validPassword);
      });

      it('should reject empty password', async () => {
        // Arrange
        const schema = validationSchemas.password;

        // Act & Assert
        await expect(schema.validate('')).rejects.toThrow('Password is required');
      });

      it('should reject too short password', async () => {
        // Arrange
        const schema = validationSchemas.password;

        // Act & Assert
        await expect(schema.validate('Pass1!')).rejects.toThrow('Password must be at least 8 characters');
      });

      it('should reject password without uppercase letter', async () => {
        // Arrange
        const schema = validationSchemas.password;

        // Act & Assert
        await expect(schema.validate('password1!')).rejects.toThrow(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        );
      });

      it('should reject password without lowercase letter', async () => {
        // Arrange
        const schema = validationSchemas.password;

        // Act & Assert
        await expect(schema.validate('PASSWORD1!')).rejects.toThrow(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        );
      });

      it('should reject password without number', async () => {
        // Arrange
        const schema = validationSchemas.password;

        // Act & Assert
        await expect(schema.validate('Password!')).rejects.toThrow(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        );
      });

      it('should reject password without special character', async () => {
        // Arrange
        const schema = validationSchemas.password;

        // Act & Assert
        await expect(schema.validate('Password1')).rejects.toThrow(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        );
      });
    });

    describe('confirmPassword', () => {
      it('should validate matching passwords', async () => {
        // Arrange
        const schema = Yup.object().shape({
          password: Yup.string(),
          confirmPassword: validationSchemas.confirmPassword()
        });
        const validData = { password: 'Password1!', confirmPassword: 'Password1!' };

        // Act & Assert
        await expect(schema.validate(validData)).resolves.toEqual(validData);
      });

      it('should reject empty confirm password', async () => {
        // Arrange
        const schema = Yup.object().shape({
          password: Yup.string(),
          confirmPassword: validationSchemas.confirmPassword()
        });
        const invalidData = { password: 'Password1!', confirmPassword: '' };

        // Act & Assert
        await expect(schema.validate(invalidData)).rejects.toThrow();
      });

      it('should reject non-matching passwords', async () => {
        // Arrange
        const schema = Yup.object().shape({
          password: Yup.string(),
          confirmPassword: validationSchemas.confirmPassword()
        });
        const invalidData = { password: 'Password1!', confirmPassword: 'DifferentPassword1!' };

        // Act & Assert
        await expect(schema.validate(invalidData)).rejects.toThrow('Passwords must match');
      });

      it('should use custom field name', async () => {
        // Arrange
        const schema = Yup.object().shape({
          newPassword: Yup.string(),
          confirmPassword: validationSchemas.confirmPassword('newPassword')
        });
        const validData = { newPassword: 'Password1!', confirmPassword: 'Password1!' };

        // Act & Assert
        await expect(schema.validate(validData)).resolves.toEqual(validData);
      });
    });

    describe('uuid', () => {
      it('should validate valid UUID', async () => {
        // Arrange
        const schema = validationSchemas.uuid;
        const validUuid = '123e4567-e89b-12d3-a456-426614174000';

        // Act & Assert
        await expect(schema.validate(validUuid)).resolves.toBe(validUuid);
      });

      it('should reject empty UUID', async () => {
        // Arrange
        const schema = validationSchemas.uuid;

        // Act & Assert
        await expect(schema.validate('')).rejects.toThrow('ID is required');
      });

      it('should reject invalid UUID format', async () => {
        // Arrange
        const schema = validationSchemas.uuid;

        // Act & Assert
        await expect(schema.validate('invalid-uuid')).rejects.toThrow('Invalid ID format');
      });
    });
  });

  describe('createValidationSchema', () => {
    it('should create a validation schema from fields', async () => {
      // Arrange
      const fields = {
        name: validationSchemas.name,
        email: validationSchemas.email
      };
      const schema = createValidationSchema(fields);
      const validData = { name: 'Test Name', email: 'test@example.com' };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it('should validate partial data', async () => {
      // Arrange
      const fields = {
        name: validationSchemas.name,
        email: validationSchemas.email,
        description: validationSchemas.description
      };
      const schema = createValidationSchema(fields);
      const validData = { name: 'Test Name', email: 'test@example.com' };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('authSchemas', () => {
    describe('login', () => {
      it('should validate valid login data', async () => {
        // Arrange
        const schema = authSchemas.login;
        const validData = { email: 'test@example.com', password: 'password' };

        // Act & Assert
        await expect(schema.validate(validData)).resolves.toEqual(validData);
      });

      it('should reject missing email', async () => {
        // Arrange
        const schema = authSchemas.login;
        const invalidData = { password: 'password' };

        // Act & Assert
        await expect(schema.validate(invalidData)).rejects.toThrow('Email is required');
      });

      it('should reject missing password', async () => {
        // Arrange
        const schema = authSchemas.login;
        const invalidData = { email: 'test@example.com' };

        // Act & Assert
        await expect(schema.validate(invalidData)).rejects.toThrow('Password is required');
      });
    });

    describe('register', () => {
      it('should validate valid registration data', async () => {
        // Arrange
        const schema = authSchemas.register;
        const validData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password1!',
          confirmPassword: 'Password1!'
        };

        // Act & Assert
        await expect(schema.validate(validData)).resolves.toEqual(validData);
      });

      it('should reject invalid username', async () => {
        // Arrange
        const schema = authSchemas.register;
        const invalidData = {
          username: 'test user',
          email: 'test@example.com',
          password: 'Password1!',
          confirmPassword: 'Password1!'
        };

        // Act & Assert
        await expect(schema.validate(invalidData)).rejects.toThrow('Username can only contain letters, numbers, and underscores');
      });
    });
  });

  describe('rpgWorldSchemas', () => {
    it('should validate valid rpg world data', async () => {
      // Arrange
      const schema = rpgWorldSchemas.create;
      const validData = {
        name: 'Test World',
        description: 'Test description'
      };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('campaignSchemas', () => {
    it('should validate valid campaign data', async () => {
      // Arrange
      const schema = campaignSchemas.create;
      const validData = {
        name: 'Test Campaign',
        description: 'Test description',
        rpg_world_id: '123e4567-e89b-12d3-a456-426614174000'
      };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('sessionSchemas', () => {
    it('should validate valid session data', async () => {
      // Arrange
      const schema = sessionSchemas.create;
      const validData = {
        name: 'Test Session',
        description: 'Test description',
        campaign_id: '123e4567-e89b-12d3-a456-426614174000',
        session_date: new Date()
      };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it('should allow null session date', async () => {
      // Arrange
      const schema = sessionSchemas.create;
      const validData = {
        name: 'Test Session',
        description: 'Test description',
        campaign_id: '123e4567-e89b-12d3-a456-426614174000',
        session_date: null
      };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('characterSchemas', () => {
    it('should validate valid character data', async () => {
      // Arrange
      const schema = characterSchemas.create;
      const validData = {
        name: 'Test Character',
        description: 'Test description',
        campaign_id: '123e4567-e89b-12d3-a456-426614174000',
        character_type: 'PC'
      };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('locationSchemas', () => {
    it('should validate valid location data', async () => {
      // Arrange
      const schema = locationSchemas.create;
      const validData = {
        name: 'Test Location',
        description: 'Test description',
        campaign_id: '123e4567-e89b-12d3-a456-426614174000',
        location_type: 'City'
      };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe('itemSchemas', () => {
    it('should validate valid item data', async () => {
      // Arrange
      const schema = itemSchemas.create;
      const validData = {
        name: 'Test Item',
        description: 'Test description',
        campaign_id: '123e4567-e89b-12d3-a456-426614174000',
        item_type: 'Weapon',
        value: 100,
        weight: 5
      };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject negative value', async () => {
      // Arrange
      const schema = itemSchemas.create;
      const invalidData = {
        name: 'Test Item',
        description: 'Test description',
        campaign_id: '123e4567-e89b-12d3-a456-426614174000',
        item_type: 'Weapon',
        value: -100,
        weight: 5
      };

      // Act & Assert
      await expect(schema.validate(invalidData)).rejects.toThrow('Value must be non-negative');
    });
  });

  describe('eventSchemas', () => {
    it('should validate valid event data', async () => {
      // Arrange
      const schema = eventSchemas.create;
      const validData = {
        name: 'Test Event',
        description: 'Test description',
        campaign_id: '123e4567-e89b-12d3-a456-426614174000',
        event_type: 'Battle',
        event_date: '2023-01-01',
        timeline_position: 1,
        location_id: '123e4567-e89b-12d3-a456-426614174000',
        session_id: '123e4567-e89b-12d3-a456-426614174000'
      };

      // Act & Assert
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject invalid location_id', async () => {
      // Arrange
      const schema = eventSchemas.create;
      const invalidData = {
        name: 'Test Event',
        description: 'Test description',
        campaign_id: '123e4567-e89b-12d3-a456-426614174000',
        event_type: 'Battle',
        location_id: 'invalid-id'
      };

      // Act & Assert
      await expect(schema.validate(invalidData)).rejects.toThrow('Invalid location ID');
    });
  });
});
