import { Injectable } from '@nestjs/common';

@Injectable()
export class DynamicPricingService {
  private readonly VOLATILITY_FACTOR = 0.05; // 5% de volatilidad

  calculateNewPrice(contract: any, transactionAmount: number): number {
    const supplyRatio = transactionAmount / contract.circulatingSupply;
    const priceChange = supplyRatio * this.VOLATILITY_FACTOR;
    
    return contract.tokenPrice * (1 + priceChange);
  }

  calculateSalesImpact(totalSales: number): number {
    return Math.log10(totalSales + 1) * 0.1;
  }
}