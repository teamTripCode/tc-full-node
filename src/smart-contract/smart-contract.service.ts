import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { TripcoinService } from '../tripcoin/tripcoin.service';
import { DynamicPricingService } from 'src/pricing/pricing.service';

@Injectable()
export class SmartContractService {
  private readonly logger = new Logger(SmartContractService.name);
  private readonly CONTRACT_PREFIX = 'contract:';

  constructor(
    private readonly redis: RedisService,
    private readonly tripcoin: TripcoinService,
    private readonly pricing: DynamicPricingService
  ) {}

  async deployLoyaltyContract(businessAddress: string, initialSupply: number): Promise<void> {
    const contractData = {
      business: businessAddress,
      totalSupply: initialSupply,
      circulatingSupply: 0,
      tokenPrice: 500, // Precio inicial en COP
      rewardPercentage: 5, // 5% de recompensa por defecto
      transactions: []
    };

    await this.redis.hSet(`${this.CONTRACT_PREFIX}${businessAddress}`, contractData);
    await this.mintTokens(businessAddress, initialSupply);
  }

  private async mintTokens(businessAddress: string, amount: number): Promise<void> {
    const contract = await this.getContract(businessAddress);
    const newSupply = contract.circulatingSupply + amount;

    await this.redis.hSet(`${this.CONTRACT_PREFIX}${businessAddress}`, {
      circulatingSupply: newSupply
    });
  }

  async processLoyaltyReward(businessAddress: string, customerAddress: string, purchaseAmount: number): Promise<void> {
    const contract = await this.getContract(businessAddress);
    const rewardAmount = (purchaseAmount * contract.rewardPercentage) / 100;

    // Calcular gas fee
    const gasFee = this.tripcoin.calculateTransactionFee(rewardAmount);
    const netReward = rewardAmount - gasFee;

    // Actualizar precios dinámicos
    const newPrice = this.pricing.calculateNewPrice(contract, rewardAmount);

    await this.transferTokens(businessAddress, customerAddress, netReward);
    await this.updateContractState(businessAddress, newPrice, purchaseAmount);
  }

  private async transferTokens(from: string, to: string, amount: number): Promise<void> {
    // Lógica de transferencia de tokens
    await this.redis.hSet(`balances:${to}`, { 'loyaltyTokens': amount });
  }

  private async updateContractState(businessAddress: string, newPrice: number, purchaseAmount: number): Promise<void> {
    const contract = await this.getContract(businessAddress);

    await this.redis.hSet(`${this.CONTRACT_PREFIX}${businessAddress}`, {
      tokenPrice: newPrice,
      totalSales: contract.totalSales + purchaseAmount,
      transactions: [...contract.transactions, { timestamp: Date.now(), amount: purchaseAmount }]
    });
  }

  async getContract(businessAddress: string): Promise<any> {
    return this.redis.hGetAll(`${this.CONTRACT_PREFIX}${businessAddress}`);
  }
}