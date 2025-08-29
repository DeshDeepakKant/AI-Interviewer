export const clearAllUserData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('interviewSessionId');
  
  console.log('All user data cleared from localStorage');
};

/**
 * Check if user data exists in localStorage
 * @returns {boolean} - true if user data exists, false otherwise
 */
export const hasUserData = () => {
  const user = localStorage.getItem('user');
  try {
    const userData = JSON.parse(user);
    return userData && userData.email;
  } catch {
    return false;
  }
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
