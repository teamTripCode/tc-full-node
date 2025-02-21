import { Injectable, Logger } from '@nestjs/common';
import * as Redis from 'redis';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis.RedisClientType;
    
    constructor() {
        const redisUrl = process.env.REDIS_URL;;
        this.client = Redis.createClient({ url: redisUrl });
        
        this.client.on('error', (err) => {
            this.logger.error(`Redis client error: ${err.message}`);
        });
    }
    
    async onModuleInit() {
        try {
            await this.client.connect();
            this.logger.log('Connected to Redis');
        } catch (error) {
            this.logger.error(`Failed to connect to Redis: ${error.message}`);
        }
    }
    
    async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            if (ttl) {
                await this.client.setEx(key, ttl, value);
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            this.logger.error(`Redis set error: ${error.message}`);
            throw error;
        }
    }
    
    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.error(`Redis get error: ${error.message}`);
            throw error;
        }
    }
    
    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            this.logger.error(`Redis del error: ${error.message}`);
            throw error;
        }
    }
    
    async hSet(key: string, data: Record<string, any>): Promise<void> {
        try {
            const flattenedData = Object.entries(data).flat();
            await this.client.hSet(key, flattenedData);
        } catch (error) {
            this.logger.error(`Redis hSet error: ${error.message}`);
            throw error;
        }
    }
    
    
    async hGet(key: string, field: string): Promise<string | null | undefined> {
        try {
            return await this.client.hGet(key, field);
        } catch (error) {
            this.logger.error(`Redis hGet error: ${error.message}`);
            throw error;
        }
    }
    
    async hGetAll(key: string): Promise<Record<string, string>> {
        try {
            return await this.client.hGetAll(key);
        } catch (error) {
            this.logger.error(`Redis hGetAll error: ${error.message}`);
            throw error;
        }
    }
    
    async hExists(key: string, field: string): Promise<boolean> {
        try {
            // The hExists method returns a boolean in the newer Redis client
            return await this.client.hExists(key, field);
        } catch (error) {
            this.logger.error(`Redis hExists error: ${error.message}`);
            throw error;
        }
    }
    
    async hDel(key: string, field: string): Promise<void> {
        try {
            await this.client.hDel(key, field);
        } catch (error) {
            this.logger.error(`Redis hDel error: ${error.message}`);
            throw error;
        }
    }
    
    async incr(key: string): Promise<number> {
        try {
            return await this.client.incr(key);
        } catch (error) {
            this.logger.error(`Redis incr error: ${error.message}`);
            throw error;
        }
    }
    
    async expire(key: string, seconds: number): Promise<void> {
        try {
            await this.client.expire(key, seconds);
        } catch (error) {
            this.logger.error(`Redis expire error: ${error.message}`);
            throw error;
        }
    }
    
    async ping(): Promise<string> {
        try {
            return await this.client.ping();
        } catch (error) {
            this.logger.error(`Redis ping error: ${error.message}`);
            throw error;
        }
    }
    
    async flushDb(): Promise<void> {
        try {
            if (process.env.NODE_ENV === 'test') {
                await this.client.flushDb();
            } else {
                this.logger.warn('Attempted to flush Redis database in non-test environment');
            }
        } catch (error) {
            this.logger.error(`Redis flushDb error: ${error.message}`);
            throw error;
        }
    }
}
