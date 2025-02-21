import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';
import { P2pGateway } from './p2p/p2p.gateway';
import { RelayService } from './relay/relay.service';
import { HealthService } from './health/health.service';
import { SyncService } from './sync/sync.service';
import { BlockchainService } from './blockchain/blockchain.service';
import { ConfigModule } from '@nestjs/config';
import { P2pModule } from './p2p/p2p.module';
import { BlockService } from './block/block.service';
import { AccountModule } from './account/account.module';
import { SmartContractService } from './smart-contract/smart-contract.service';
import { PricingService } from './pricing/pricing.service';
import { TransactionService } from './transaction/transaction.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), P2pModule, AccountModule],
  controllers: [AppController],
  providers: [AppService, RedisService, P2pGateway, RelayService, HealthService, SyncService, BlockchainService, BlockService, SmartContractService, PricingService, TransactionService],
})
export class AppModule {}
