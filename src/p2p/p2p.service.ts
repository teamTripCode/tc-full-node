import { Injectable, Logger } from "@nestjs/common";
import { Socket, io } from 'socket.io-client'

@Injectable()
export class P2PService {
    private readonly logger = new Logger(P2PService.name);
    private socket: Socket;
    private seedNodes: string[];
    private connected = false;

    constructor() {
        this.seedNodes = process.env.SEED_NODES ? process.env.SEED_NODES.split(',') : [];
        this.connectToSeedNode();
    }

    private connectToSeedNode() {
        for (const seedNode of this.seedNodes) {
            try {
                this.socket = io(seedNode, {
                    transports: ['websocket'],
                    query: {
                        role: 'full-node',
                        version: '1.0.0',
                    },
                });

                this.setupEventHandlers();
                this.connected = true;
                this.logger.log(`Connected to seed node: ${seedNode}`);
                break;
            } catch (error) {
                this.logger.error(`Failed to connect to ${seedNode}: ${error.message}`);
            }
        }
    }

    private setupEventHandlers() {
        this.socket.on('connect', () => {
            this.logger.log('WebSocket connection established');
            this.socket.emit('register_full_node');
        });

        this.socket.on('new_block', (block) => this.handleNewBlock(block));
        this.socket.on('new_transaction', (tx) => this.handleNewTransaction(tx));
        this.socket.on('disconnect', () => this.handleDisconnect());
    }

    private handleNewBlock(block: any) {
        this.logger.log(`Received new block: ${block.hash}`);
        // Lógica para procesar el bloque
    }

    private handleNewTransaction(tx: any) {
        this.logger.log(`Received new transaction: ${tx.id}`);
        // Lógica para procesar la transacción
    }

    private handleDisconnect() {
        this.logger.warn('Disconnected from seed node');
        this.connected = false;
        setTimeout(() => this.connectToSeedNode(), 5000);
    }

    isConnected(): boolean {
        return this.connected;
    }
}