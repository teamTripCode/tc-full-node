import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { P2PService } from 'src/p2p/p2p.service';

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);

    constructor(
        private readonly blockchain: BlockchainService,
        private readonly p2p: P2PService,
    ) { }

    @Interval(30000) // Sincronizar cada 30 segundos
    async syncWithNetwork() {
        if (!this.p2p.isConnected()) return;

        const localHeight = await this.blockchain.getBlockHeight();
        this.p2p.emit('request_blocks', { from: localHeight + 1 });
    }

    async handleBlockResponse(blocks: any[]) {
        for (const block of blocks) {
            await this.blockchain.addBlock(block);
        }
        this.logger.log(`Synchronized ${blocks.length} new blocks`);
    }
}
