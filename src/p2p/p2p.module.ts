import { Module } from '@nestjs/common';
import { P2pGateway } from './p2p.gateway';

@Module({
    exports: [P2pGateway],
})
export class P2pModule { }
