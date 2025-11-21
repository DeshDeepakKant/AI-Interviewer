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
let errorCount = 0;
let lastErrorLog = 0;
const ERROR_LOG_INTERVAL = 50; // Log every 50th error to reduce spam

// Suppress common network errors that are expected with free tier Redis
const SUPPRESSED_ERRORS = ['ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNREFUSED'];

client.on('connect', () => {
  isConnected = true;
  connectionAttempts = 0;
  errorCount = 0;
  // Only log first connection
  if (connectionAttempts === 0) {
    console.log('Redis connected');
  }
});

client.on('ready', () => {
  isConnected = true;
  // Only log first ready state
  if (connectionAttempts === 0) {
    console.log('Redis ready');
  }
});

client.on('error', err => {
  errorCount++;
  const errorMsg = err.message || err.code || 'Unknown error';
  const isSuppressed = SUPPRESSED_ERRORS.some(code => errorMsg.includes(code));
  
  // Only log non-suppressed errors or log suppressed errors every N times
  if (!isSuppressed) {
    console.error('Redis error:', errorMsg);
  } else if (errorCount % ERROR_LOG_INTERVAL === 0) {
    const now = Date.now();
    // Log at most once per 30 seconds
    if (now - lastErrorLog > 30000) {
      console.warn(`Redis connection issues (${errorCount} errors suppressed): ${errorMsg}`);
      lastErrorLog = now;
    }
  }
  connectionAttempts++;
});

client.on('close', () => {
  isConnected = false;
  // Suppress close logs - they're too frequent
});

client.on('reconnecting', (delay) => {
  // Suppress reconnecting logs - they're too frequent
});

// Handle connection end
client.on('end', () => {
  isConnected = false;
  // Suppress end logs
});

// Graceful shutdown
process.on('SIGINT', () => {
  client.quit();
});

process.on('SIGTERM', () => {
  client.quit();
});

export default client