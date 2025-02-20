import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { P2PService } from 'src/p2p/p2p.service';

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);
    private startupTime = Date.now();
  
    constructor(
      private readonly blockchain: BlockchainService,
      private readonly p2p: P2PService,
    ) {}
  
    async getHealthStatus() {
      return {
        uptime: Date.now() - this.startupTime,
        blockHeight: await this.blockchain.getBlockHeight(),
        peersConnected: this.p2p.isConnected() ? 1 : 0,
        status: this.p2p.isConnected() ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
      };
    }
}
