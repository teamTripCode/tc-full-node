import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';
import { P2pGateway } from './p2p/p2p.gateway';
import { HealthService } from './health/health.service';
import { BlockchainService } from './blockchain/blockchain.service';
import { ConfigModule } from '@nestjs/config';
import { P2pModule } from './p2p/p2p.module';
import { BlockService } from './block/block.service';
import { AccountModule } from './account/account.module';
import { SmartContractService } from './smart-contract/smart-contract.service';
import { TransactionService } from './transaction/transaction.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), P2pModule, AccountModule],
  controllers: [AppController],
  providers: [AppService, RedisService, P2pGateway, HealthService, BlockchainService, BlockService, SmartContractService, TransactionService],
})
export class AppModule {}
