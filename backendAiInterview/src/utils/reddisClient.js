import {Redis} from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const client = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  enableReadyCheck: true,
  enableOfflineQueue: false,
  connectTimeout: 10000,
  lazyConnect: false
});

client.on('connect', () => console.log('Redis connected'));
client.on('ready', () => console.log('Redis ready'));
client.on('error', err => {
  console.error('Redis error', err.message);
  // Don't crash on Redis errors - log and continue
});
client.on('close', () => console.log('Redis connection closed'));
client.on('reconnecting', () => console.log('Redis reconnecting...'));

export default client