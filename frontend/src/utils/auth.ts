/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from local storage
 * @returns The authentication token or null if not found
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in local storage
 * @param token The authentication token
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from local storage
 */
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Get the authentication header for API requests
 * @returns The authentication header object or an empty object if not authenticated
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Parse the JWT token to get the payload
 * @param token The JWT token
 * @returns The decoded payload or null if invalid
 */
export const parseToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if the token is expired
 * @param token The JWT token
 * @returns True if the token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseToken(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
};
