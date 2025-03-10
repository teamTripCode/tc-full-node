import { Module } from '@nestjs/common';
import { TripcoinModule } from 'src/tripcoin/tripcoin.module';
import { RedisModule } from 'src/redis/redis.module';
import { SmartContractModule } from 'src/smart-contract/smart-contract.module';
import { AccountModule } from 'src/account/account.module';
import { TransactionService } from './transaction.service';

@Module({
    imports: [SmartContractModule, AccountModule],
    providers: [TransactionService],
    exports: [TransactionService]
})
export class TransactionModule { }
