import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'

@WebSocketGateway()
export class P2pGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(P2pGateway.name);

  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Socket> = new Map();

  afterInit(server: any) {
    this.logger.log('P2P Gateway initialized');
  }

  handleConnection(client: Socket) {
    const id = client.id;
    this.connectedClients.set(id, client);
    this.logger.log(`Client connected: ${id}`);

    // Send welcome message
    client.emit('welcome', {
      message: 'Connected to blockchain full node',
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnect(client: Socket) {
    const id = client.id;
    this.connectedClients.delete(id);
    this.logger.log(`Client disconnected: ${id}`);
  }

  @SubscribeMessage('subscribe_blocks')
  handleSubscribeBlocks(client: Socket): void {
    client.join('block_subscribers');
    this.logger.log(`Client ${client.id} subscribed to new blocks`);
    client.emit('subscription_confirmation', { topic: 'blocks', status: 'subscribed' });
  }

  @SubscribeMessage('subscribe_transactions')
  handleSubscribeTransactions(client: Socket): void {
    client.join('transaction_subscribers');
    this.logger.log(`Client ${client.id} subscribed to new transactions`);
    client.emit('subscription_confirmation', { topic: 'transactions', status: 'subscribed' });
  }

  broadcastBlock(block: any): void {
    this.server.to('block_subscribers').emit('new_block', block);
    this.logger.debug(`Broadcasted new block to ${this.getSubscribersCount('block_subscribers')} subscribers`);
  }

  broadcastTransaction(transaction: any): void {
    this.server.to('transaction_subscribers').emit('new_transaction', transaction);
    this.logger.debug(`Broadcasted new transaction to ${this.getSubscribersCount('transaction_subscribers')} subscribers`);
  }

  private getSubscribersCount(room: string): number {
    const adapter = this.server.sockets.adapter;
    return adapter.rooms.get(room)?.size || 0;
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
