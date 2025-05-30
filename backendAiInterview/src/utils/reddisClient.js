import {Redis} from "ioredis";
import dotenv from "dotenv";
dotenv.config();

console.log("Connecting to Redis...", process.env.REDIS_URL);
const client = new Redis(process.env.REDIS_URL);
client.on('connect', () => console.log('✅ Redis connected'));
client.on('error', err => console.error('🔴 Redis error', err));
export default client