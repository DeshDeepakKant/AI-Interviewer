import {Redis} from "ioredis";
import dotenv from "dotenv";
dotenv.config();

// Create Redis client with improved connection handling
const client = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1, // Reduce retries to avoid spam
  retryStrategy: (times) => {
    // Exponential backoff with max delay
    const delay = Math.min(times * 100, 5000);
    // Stop retrying after 10 attempts
    if (times > 10) {
      console.warn('Redis: Max retry attempts reached, giving up');
      return null; // Stop retrying
    }
    return delay;
  },
  reconnectOnError: (err) => {
    // Only reconnect on specific errors
    const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
    if (targetErrors.some(error => err.message.includes(error))) {
      return true;
    }
    return false;
  },
  enableReadyCheck: false, // Disable ready check to reduce connection attempts
  enableOfflineQueue: true, // Queue commands when offline
  connectTimeout: 15000, // Increase timeout
  lazyConnect: false,
  keepAlive: 30000, // Keep connection alive
  family: 4, // Use IPv4
  showFriendlyErrorStack: true
});

let isConnected = false;
let connectionAttempts = 0;

client.on('connect', () => {
  isConnected = true;
  connectionAttempts = 0;
  console.log('Redis connected');
});

client.on('ready', () => {
  isConnected = true;
  console.log('Redis ready');
});

client.on('error', err => {
  // Only log errors, don't spam
  if (!err.message.includes('ECONNRESET') || connectionAttempts % 10 === 0) {
    console.error('Redis error:', err.message);
  }
  connectionAttempts++;
});

client.on('close', () => {
  isConnected = false;
  // Only log occasionally to reduce spam
  if (connectionAttempts % 20 === 0) {
    console.log('Redis connection closed');
  }
});

client.on('reconnecting', (delay) => {
  // Only log occasionally
  if (connectionAttempts % 10 === 0) {
    console.log(`Redis reconnecting... (attempt ${connectionAttempts}, delay: ${delay}ms)`);
  }
});

// Handle connection end
client.on('end', () => {
  isConnected = false;
  console.log('Redis connection ended');
});

// Graceful shutdown
process.on('SIGINT', () => {
  client.quit();
});

process.on('SIGTERM', () => {
  client.quit();
});

export default client