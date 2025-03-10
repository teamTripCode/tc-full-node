import { Module } from '@nestjs/common';
import { DynamicPricingService } from './pricing.service';

@Module({
  providers: [DynamicPricingService],
  exports: [DynamicPricingService] 
})
export class PricingModule {}
