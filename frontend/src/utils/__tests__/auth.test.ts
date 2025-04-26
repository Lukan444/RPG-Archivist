import {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  getAuthHeader,
  parseToken,
  isTokenExpired
} from '../auth';

describe('Auth Utils', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue('test-token');

      // Act
      const result = getToken();

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith('token');
      expect(result).toBe('test-token');
    });

    it('should return null if token is not in localStorage', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      // Act
      const result = getToken();

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith('token');
      expect(result).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should set token in localStorage', () => {
      // Act
      setToken('test-token');

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    });
  });

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      // Act
      removeToken();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue('test-token');

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if token does not exist', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getAuthHeader', () => {
    it('should return authorization header with token', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue('test-token');

      // Act
      const result = getAuthHeader();

      // Assert
      expect(result).toEqual({ Authorization: 'Bearer test-token' });
    });

    it('should return empty object if token does not exist', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      // Act
      const result = getAuthHeader();

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('parseToken', () => {
    it('should parse valid JWT token', () => {
      // Arrange
      // Create a valid JWT token with payload { sub: 'user123', exp: 1234567890 }
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxMjM0NTY3ODkwfQ.kkJrEkYjzKPBYIQnVZyl5CtIzJlwmjBEbzHXMQRYYvA';

      // Act
      const result = parseToken(validToken);

      // Assert
      expect(result).toEqual({ sub: 'user123', exp: 1234567890 });
    });

    it('should return null for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid-token';

      // Act
      const result = parseToken(invalidToken);

      // Assert
      expect(console.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      // Arrange
      // Create a token with expiration in the past
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNTAwMDAwMDAwfQ.VZG-Je4Kg0HJgIlL-NQs5QO8Y7bOVPbvAGjwOvdFxMk';

      // Mock Date.now to return a time after the expiration
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1600000000000); // After expiration (1500000000 * 1000)

      // Act
      const result = isTokenExpired(expiredToken);

      // Assert
      expect(result).toBe(true);

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should return false for non-expired token', () => {
      // Arrange
      // Create a token with expiration in the future
      const nonExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzAwMDAwMDAwfQ.k6D9muUBrTRgRSZZzWcxXFxXgisiQjmjhv-O_8dHpxM';

      // Mock Date.now to return a time before the expiration
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1600000000000); // Before expiration (1700000000 * 1000)

      // Act
      const result = isTokenExpired(nonExpiredToken);

      // Assert
      expect(result).toBe(false);

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should return true for token without expiration', () => {
      // Arrange
      // Create a token without exp claim
      const tokenWithoutExp = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIn0.vx4xQnSsX-J8HAFcIcDaJffGXPVUBgkbmjeSLsYdv0M';

      // Act
      const result = isTokenExpired(tokenWithoutExp);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid-token';

      // Act
      const result = isTokenExpired(invalidToken);

      // Assert
      expect(result).toBe(true);
    });
  });
});
