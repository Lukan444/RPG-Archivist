import { BaseRepository } from './base.repository';
import { User } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * Repository for User entities
 */
export class UserRepository extends BaseRepository {
  /**
   * Create a new User
   * @param user User to create
   * @returns Created User
   */
  async create(user: Omit<User, 'user_id'>): Promise<User> {
    try {
      // Generate ID if not provided
      const userId = uuidv4();

      // Hash password if provided
      let hashedPassword = user.password;
      if (hashedPassword) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(hashedPassword, salt);
      }

      const newUser: User = {
        ...user,
        user_id: userId,
        password: hashedPassword
      };

      const query = `
        CREATE (u:User $user)
        RETURN u {
          user_id: u.user_id,
          username: u.username,
          email: u.email,
          name: u.name,
          role: u.role,
          created_at: u.created_at,
          updated_at: u.updated_at
        } as user
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { user: newUser });
        return result.records[0].get('user');
      });

      return result;
    } catch (error) {
      console.error('Error creating User:', error);
      throw error;
    }
  }

  /**
   * Get User by ID
   * @param userId User ID
   * @returns User
   */
  async getById(userId: string): Promise<User | null> {
    try {
      const query = `
        MATCH (u:User {user_id: $userId})
        RETURN u {
          user_id: u.user_id,
          username: u.username,
          email: u.email,
          name: u.name,
          role: u.role,
          created_at: u.created_at,
          updated_at: u.updated_at
        } as user
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { userId });
        return result.records.length > 0 ? result.records[0].get('user') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting User by ID:', error);
      throw error;
    }
  }

  /**
   * Get User by username
   * @param username Username
   * @returns User
   */
  async getByUsername(username: string): Promise<User | null> {
    try {
      const query = `
        MATCH (u:User {username: $username})
        RETURN u {.*} as user
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { username });
        return result.records.length > 0 ? result.records[0].get('user') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting User by username:', error);
      throw error;
    }
  }

  /**
   * Get User by email
   * @param email Email
   * @returns User
   */
  async getByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        MATCH (u:User {email: $email})
        RETURN u {.*} as user
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { email });
        return result.records.length > 0 ? result.records[0].get('user') : null;
      });

      return result;
    } catch (error) {
      console.error('Error getting User by email:', error);
      throw error;
    }
  }

  /**
   * Get all Users
   * @param page Page number
   * @param limit Items per page
   * @param search Search term
   * @returns Users and total count
   */
  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ users: User[]; total: number }> {
    try {
      let query = `
        MATCH (u:User)
      `;

      // Add search filter if provided
      if (search) {
        query += `
          WHERE u.username CONTAINS $search OR u.email CONTAINS $search OR u.name CONTAINS $search
        `;
      }

      // Count total users
      const countQuery = query + `
        RETURN COUNT(u) as total
      `;

      const countResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(countQuery, { search });
        return result.records[0].get('total').toNumber();
      });

      // Get users with pagination
      query += `
        RETURN u {
          user_id: u.user_id,
          username: u.username,
          email: u.email,
          name: u.name,
          role: u.role,
          created_at: u.created_at,
          updated_at: u.updated_at
        } as user
        ORDER BY u.username
        SKIP $skip
        LIMIT $limit
      `;

      const skip = (page - 1) * limit;

      const usersResult = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, {
          search,
          skip,
          limit
        });
        return result.records.map(record => record.get('user'));
      });

      return {
        users: usersResult,
        total: countResult
      };
    } catch (error) {
      console.error('Error getting all Users:', error);
      throw error;
    }
  }

  /**
   * Update User
   * @param userId User ID
   * @param user User data to update
   * @returns Updated User
   */
  async update(userId: string, user: Partial<User>): Promise<User> {
    try {
      // Create a copy of the user object
      let userDataToUpdate = { ...user };

      // Handle password separately
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        // Update the password in the copy
        userDataToUpdate.password = await bcrypt.hash(user.password, salt);
      }

      const query = `
        MATCH (u:User {user_id: $userId})
        SET u += $user
        RETURN u {
          user_id: u.user_id,
          username: u.username,
          email: u.email,
          name: u.name,
          role: u.role,
          created_at: u.created_at,
          updated_at: u.updated_at
        } as user
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, {
          userId,
          user: userDataToUpdate
        });

        if (result.records.length === 0) {
          throw new Error(`User with ID ${userId} not found`);
        }

        return result.records[0].get('user');
      });

      return result;
    } catch (error) {
      console.error('Error updating User:', error);
      throw error;
    }
  }

  /**
   * Delete User
   * @param userId User ID
   * @returns True if deleted
   */
  async delete(userId: string): Promise<boolean> {
    try {
      const query = `
        MATCH (u:User {user_id: $userId})
        DETACH DELETE u
        RETURN count(u) as count
      `;

      const result = await this.dbService.writeTransaction(async (tx) => {
        const result = await tx.run(query, { userId });
        return result.records[0].get('count').toNumber() > 0;
      });

      return result;
    } catch (error) {
      console.error('Error deleting User:', error);
      throw error;
    }
  }

  /**
   * Verify password
   * @param userId User ID
   * @param password Password to verify
   * @returns True if password is correct
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const query = `
        MATCH (u:User {user_id: $userId})
        RETURN u.password as password
      `;

      const result = await this.dbService.readTransaction(async (tx) => {
        const result = await tx.run(query, { userId });
        return result.records.length > 0 ? result.records[0].get('password') : null;
      });

      if (!result) {
        return false;
      }

      return await bcrypt.compare(password, result);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param userId User ID
   * @returns User or null if not found
   */
  async findById(userId: string): Promise<User | null> {
    return this.getById(userId);
  }
}
