import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);
    private readonly BLOCKCHAIN_KEY = 'fullnode:blockchain';

    constructor(private readonly redis: RedisService) { }

    async addBlock(block: any) {
        const exists = await this.redis.hExists(this.BLOCKCHAIN_KEY, block.hash);
        if (!exists) {
            await this.redis.hSet(
                this.BLOCKCHAIN_KEY,
                block.hash,
                JSON.stringify(block)
            );
            this.logger.log(`Block ${block.hash} added to storage`);
        }
    }

    async getBlock(hash: string): Promise<any> {
        return this.redis.hGet(this.BLOCKCHAIN_KEY, hash);
    }

    async getBlockHeight(): Promise<number> {
        const blocks = await this.redis.hGetAll(this.BLOCKCHAIN_KEY);
        return Object.keys(blocks).length;
    }

    async getLatestBlocks(limit = 10): Promise<any[]> {
        const allBlocks = await this.redis.hGetAll(this.BLOCKCHAIN_KEY);
        return Object.values(allBlocks)
            .map(JSON.parse)
            .sort((a, b) => b.height - a.height)
            .slice(0, limit);
    }
}
