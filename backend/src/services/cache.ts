import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

// Initialize Redis client only when available
async function initializeRedis() {
  try {
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await client.connect();
    redisClient = client;
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.warn('⚠️  Redis connection failed. Cache will be disabled.');
    redisClient = null;
  }
}

// Initialize Redis connection
initializeRedis();

export class CacheService {
  async get(key: string): Promise<string | null> {
    if (!redisClient) {
      return null; // Cache disabled
    }
    
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    if (!redisClient) {
      return; // Cache disabled
    }
    
    try {
      await redisClient.setEx(key, ttl, value);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!redisClient) {
      return; // Cache disabled
    }
    
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!redisClient) {
      return false; // Cache disabled
    }
    
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }
}