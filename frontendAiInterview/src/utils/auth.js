/**
 * Authentication utilities for localStorage management
 * Used by AuthContext to handle persistent storage
 */

/**
 * Clear all authentication-related data from localStorage
 */
export const clearAllUserData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('interviewSessionId');
  localStorage.removeItem('notifications'); // Clear 
  
  console.log('All user data cleared from localStorage');
};

/**
 * Get user data from localStorage
 * @returns {object|null} - user data object or null if not found
 */
export const getUserData = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Set user data in localStorage
 * @param {object} userData - user data object to store
 */
export const setUserData = (userData) => {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data in localStorage:', error);
  }
};

/**
 * Check if user has valid authentication data in localStorage
 * @returns {boolean} - true if user data exists and is valid
 */
export const hasValidUserData = () => {
  try {
    const user = getUserData();
    return user && user.email && user.fullName;
  } catch {
    return false;
  }
};

/**
 * Get access token from localStorage
 * @returns {string|null} - access token or null if not found
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Set access token in localStorage
 * @param {string} token - access token to store
 */
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} - refresh token or null if not found
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};
