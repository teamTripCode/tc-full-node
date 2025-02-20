import { Injectable, Logger } from '@nestjs/common';
import { P2PService } from 'src/p2p/p2p.service';

@Injectable()
export class RelayService {
    private readonly logger = new Logger(RelayService.name);

    constructor(private readonly p2p: P2PService) { }

    async broadcastTransaction(tx: any): Promise<void> {
        if (this.p2p.isConnected()) {
            this.logger.log(`Broadcasting transaction: ${tx.id}`);
            this.p2p.emit('relay_transaction', tx);
        }
    }

    async broadcastBlock(block: any): Promise<void> {
        if (this.p2p.isConnected()) {
            this.logger.log(`Broadcasting block: ${block.hash}`);
            this.p2p.emit('relay_block', block);
        }
    }
}
