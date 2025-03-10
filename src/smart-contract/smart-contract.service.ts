import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { TripcoinService } from '../tripcoin/tripcoin.service';

@Injectable()
export class SmartContractService {
  private readonly logger = new Logger(SmartContractService.name);
  private readonly CONTRACT_PREFIX = 'contract:';

  constructor(
    private readonly redis: RedisService,
    private readonly tripcoin: TripcoinService,
  ) { }

  async deployLoyaltyContract(businessAddress: string, initialSupply: number): Promise<void> {
    const contractData = {
      business: businessAddress,
      totalSupply: initialSupply,
      circulatingSupply: 0,
      tokenPrice: 500, // Precio inicial en COP
      rewardPercentage: 5, // 5% de recompensa por defecto
      transactions: [],
      state: 'active', // Estado inicial del contrato
      version: 1, // Versión inicial del contrato
    };

    await this.redis.hSet(`${this.CONTRACT_PREFIX}${businessAddress}`, contractData);
    await this.mintTokens(businessAddress, initialSupply);
  }

  async processLoyaltyReward(businessAddress: string, customerAddress: string, purchaseAmount: number): Promise<void> {
    const contract = await this.getContract(businessAddress);

    // Calcular recompensa basada en reglas dinámicas
    const rewardAmount = this.calculateDynamicReward(contract, purchaseAmount);

    // Calcular gas fee
    const gasFee = this.tripcoin.calculateTransactionFee(rewardAmount);
    const netReward = rewardAmount - gasFee;

    // Verificar saldo suficiente en el contrato
    if (contract.circulatingSupply < netReward) {
      throw new Error('Insufficient token supply in the contract');
    }

    // Transferir tokens al cliente
    await this.transferTokens(businessAddress, customerAddress, netReward);

    // Actualizar estado del contrato
    await this.updateContractPrice(businessAddress, purchaseAmount, netReward);

    this.logger.log(`Reward of ${netReward} tokens distributed to ${customerAddress}`);
  }

  async updateContractState(businessAddress: string, newState: string): Promise<void> {
    if (!['active', 'paused', 'finished'].includes(newState)) {
      throw new Error('Invalid contract state');
    }

    await this.redis.hSet(`${this.CONTRACT_PREFIX}${businessAddress}`, {
      state: newState,
    });
  }

  async getContract(businessAddress: string): Promise<any> {
    return this.redis.hGetAll(`${this.CONTRACT_PREFIX}${businessAddress}`);
  }

  async burnTokens(businessAddress: string, amount: number): Promise<void> {
    const contract = await this.getContract(businessAddress);

    if (contract.circulatingSupply < amount) {
      throw new Error('Insufficient circulating supply to burn tokens');
    }

    await this.redis.hSet(`${this.CONTRACT_PREFIX}${businessAddress}`, {
      circulatingSupply: contract.circulatingSupply - amount,
    });
  }

  async withdrawUnusedTokens(businessAddress: string): Promise<void> {
    const contract = await this.getContract(businessAddress);

    if (contract.state !== 'finished') {
      throw new Error('Cannot withdraw tokens from an active contract');
    }

    await this.burnTokens(businessAddress, contract.circulatingSupply);
  }

  private async mintTokens(businessAddress: string, amount: number): Promise<void> {
    const contract = await this.getContract(businessAddress);
    const newSupply = contract.circulatingSupply + amount;

    await this.redis.hSet(`${this.CONTRACT_PREFIX}${businessAddress}`, {
      circulatingSupply: newSupply
    });
  }

  private calculateDynamicReward(contract: any, purchaseAmount: number): number {
    // Lógica personalizada para calcular la recompensa
    if (purchaseAmount > 100000) {
      return (purchaseAmount * 10) / 100; // 10% para compras grandes
    } else {
      return (purchaseAmount * 5) / 100; // 5% para compras pequeñas
    }
  }

  private async transferTokens(from: string, to: string, amount: number): Promise<void> {
    // Lógica de transferencia de tokens
    await this.redis.hSet(`balances:${to}`, { 'loyaltyTokens': amount });
  }

  private async updateContractPrice(businessAddress: string, newPrice: number, purchaseAmount: number): Promise<void> {
    const contract = await this.getContract(businessAddress);

    await this.redis.hSet(`${this.CONTRACT_PREFIX}${businessAddress}`, {
      tokenPrice: newPrice,
      totalSales: contract.totalSales + purchaseAmount,
      transactions: [...contract.transactions, { timestamp: Date.now(), amount: purchaseAmount }]
    });
  }
}