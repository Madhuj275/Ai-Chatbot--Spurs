"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const redis_1 = require("redis");
let redisClient = null;
// Initialize Redis client only when available
async function initializeRedis() {
    try {
        const client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
        await client.connect();
        redisClient = client;
        console.log('✅ Redis connected successfully');
    }
    catch (error) {
        console.warn('⚠️  Redis connection failed. Cache will be disabled.');
        redisClient = null;
    }
}
// Initialize Redis connection
initializeRedis();
class CacheService {
    async get(key) {
        if (!redisClient) {
            return null; // Cache disabled
        }
        try {
            return await redisClient.get(key);
        }
        catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }
    async set(key, value, ttl = 3600) {
        if (!redisClient) {
            return; // Cache disabled
        }
        try {
            await redisClient.setEx(key, ttl, value);
        }
        catch (error) {
            console.error('Redis set error:', error);
        }
    }
    async del(key) {
        if (!redisClient) {
            return; // Cache disabled
        }
        try {
            await redisClient.del(key);
        }
        catch (error) {
            console.error('Redis del error:', error);
        }
    }
    async exists(key) {
        if (!redisClient) {
            return false; // Cache disabled
        }
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Redis exists error:', error);
            return false;
        }
    }
}
exports.CacheService = CacheService;
//# sourceMappingURL=cache.js.map