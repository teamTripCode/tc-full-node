import { Module } from '@nestjs/common';
import { ValidatorService } from './validator.service';
import { CryptoModule } from 'src/crypto/crypto.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [CryptoModule, RedisModule],
  providers: [ValidatorService],
  exports: [ValidatorService] 
})
export class ValidatorModule {}
