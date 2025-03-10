import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [AccountService],
  exports: [AccountService]
})
export class AccountModule {}
