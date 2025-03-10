import { Module } from '@nestjs/common';
import { P2pGateway } from './p2p.gateway';
import { P2PService } from './p2p.service';

@Module({
    providers: [P2pGateway, P2PService],
    exports: [P2pGateway, P2PService],
})
export class P2pModule { }
