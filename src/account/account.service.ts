import { Injectable, Logger } from '@nestjs/common';
import { UpdateAccountDto } from './dto/update-account.dto';
import { RedisService } from 'src/redis/redis.service';
import { AccountType, KYBData, KYCData } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  private readonly ACCOUNT_PREFIX = 'account:';
  private readonly MIN_PURCHASE = 10000; // Mínimo 10.000 COP para generar recompensa

  constructor(private readonly redis: RedisService) { }

  async createAccount(address: string, type: AccountType, data: KYCData | KYBData): Promise<void> {
    const accountData = {
      type,
      verified: false,
      createdAt: new Date().toISOString(),
      ...data
    };

    await this.redis.hSet(`${this.ACCOUNT_PREFIX}${address}`, accountData);

    if (type === AccountType.KYB) {
      await this.initializeBusinessWallet(address);
    }
  }

  private async initializeBusinessWallet(address: string): Promise<void> {
    await this.redis.hSet(`${this.ACCOUNT_PREFIX}${address}`, {
      loyaltyContract: null,
      totalSales: 0,
      totalRewards: 0
    });
  }

  async verifyAccount(address: string): Promise<void> {
    const account = await this.getAccount(address);
    if (account.type === AccountType.KYB && !account.verified) {
      throw new Error('Business account is not verified');
    }

    await this.redis.hSet(`${this.ACCOUNT_PREFIX}${address}`, {
      verified: true,
      verificationDate: new Date().toISOString(),
    });
  }

  async getAccount(address: string): Promise<any> {
    return this.redis.hGetAll(`${this.ACCOUNT_PREFIX}${address}`);
  }

  async validatePurchaseAmount(amount: number): Promise<boolean> {
    return amount >= this.MIN_PURCHASE;
  }
}
