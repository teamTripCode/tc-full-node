import { RedisService } from "src/redis/redis.service";
import { DoubleSpendingError, InsufficientFundsError, InvalidSignatureError, InvalidTimestampError, ValidationError } from "./dto/create-validator.dto";
import { CryptoService } from "src/crypto/crypto.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ValidatorService {
  constructor(
    private readonly redis: RedisService,
    private readonly cryptoService: CryptoService,
  ) { }

  async validateTransaction(transaction: any): Promise<void> {
    await this.validateStructure(transaction);
    await this.validateTimestamp(transaction.timestamp);
    await this.validateSignature(transaction);
    await this.validateBalance(transaction.from, transaction.amount);
    await this.validateDoubleSpending(transaction.txId);
  }

  private async validateStructure(transaction: any): Promise<void> {
    const requiredFields = ['from', 'to', 'amount', 'timestamp', 'signature'];
    const missingFields = requiredFields.filter(field => !transaction[field]);

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing fields: ${missingFields.join(', ')}`);
    }
  }

  private async validateSignature(transaction: any): Promise<void> {
    const data = this.serializeTransaction(transaction);
    const isValid = await this.cryptoService.verifySignature(
      transaction.signature,
      data,
      transaction.from,
    );

    if (!isValid) {
      throw new InvalidSignatureError();
    }
  }

  private async validateBalance(
    senderAddress: string,
    amount: number,
  ): Promise<void> {
    const balance = await this.redis.get(`balances:${senderAddress}`);
    if (balance === null || parseFloat(balance) < amount) {
      throw new InsufficientFundsError();
    }
  }

  private async validateDoubleSpending(txId: string): Promise<void> {
    const exists = await this.redis.hExists('blockchain:tx-index', txId);
    if (exists) {
      throw new DoubleSpendingError();
    }
  }

  private async validateTimestamp(timestamp: number): Promise<void> {
    const now = Date.now();
    const futureThreshold = now + 60 * 1000; // 1 minute in future
    const pastThreshold = now - 60 * 60 * 1000; // 1 hour in past

    if (timestamp > futureThreshold || timestamp < pastThreshold) {
      throw new InvalidTimestampError();
    }
  }

  private serializeTransaction(transaction: any): string {
    return JSON.stringify({
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
    });
  }

  /**
   * Obtiene la lista de validadores activos
   * @returns Lista de direcciones de validadores activos
   */
  async getActiveValidators(): Promise<{ address: string }[]> {
    // Asumimos que los validadores activos se almacenan en un hash Redis con clave 'validators:active'
    const validators = await this.redis.hGetAll('validators:active');
    return Object.keys(validators)
      .filter(address => validators[address] === 'active')
      .map(address => ({ address }));
  }
}