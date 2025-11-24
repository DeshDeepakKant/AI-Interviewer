import axios from 'axios';
import { getAccessToken, setAccessToken, getRefreshToken, clearAllUserData } from './auth';

// Configure default axios instance
axios.defaults.withCredentials = true;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add token
axios.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh token endpoint itself
      if (originalRequest.url?.includes('/refresh-token')) {
        clearAllUserData();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        
        // Try to refresh the token
        const refreshResponse = await axios.post(
          '/api/v1/user/refresh-token',
          { refreshToken },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (refreshResponse.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          
          // Update tokens
          if (accessToken) {
            setAccessToken(accessToken);
          }
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Process queued requests
          processQueue(null, accessToken);

          // Retry the original request
          return axios(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        processQueue(refreshError, null);
        clearAllUserData();
        
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Export axios (now with interceptors configured)
export default axios;

