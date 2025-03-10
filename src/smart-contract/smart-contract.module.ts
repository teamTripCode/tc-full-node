import { Module } from '@nestjs/common';
import { SmartContractController } from './smart-contract.controller';
import { SmartContractService } from './smart-contract.service';
import { TripcoinModule } from 'src/tripcoin/tripcoin.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [TripcoinModule, RedisModule],
    controllers: [SmartContractController],
    providers: [SmartContractService],
    exports: [SmartContractService]
})
export class SmartContractModule { }
