import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { AccountType } from 'src/account/dto/create-account.dto';
import { SmartContractService } from 'src/smart-contract/smart-contract.service';

@Injectable()
export class TransactionService {
    private readonly logger = new Logger(TransactionService.name);

    constructor(
      private readonly account: AccountService,
      private readonly contract: SmartContractService
    ) {}
  
    async processBusinessTransaction(businessAddress: string, customerAddress: string, amount: number): Promise<void> {
      if (!(await this.account.validatePurchaseAmount(amount))) {
        throw new Error('El monto no alcanza el mínimo requerido para recompensa');
      }
  
      const customerAccount = await this.account.getAccount(customerAddress);
      if (!customerAccount || customerAccount.type !== AccountType.KYC) {
        throw new Error('Cliente no tiene cuenta válida en el sistema');
      }
  
      await this.contract.processLoyaltyReward(businessAddress, customerAddress, amount);
      this.logger.log(`Recompensa generada para ${customerAddress} en transacción de ${amount} COP`);
    }
}
