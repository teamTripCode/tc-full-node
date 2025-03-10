import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [RedisModule],
  providers: [BlockchainService],
  exports: [BlockchainService]
})
export class BlockchainModule {}
