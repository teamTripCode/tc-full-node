import { BadRequestException } from "@nestjs/common";

export class CreateValidatorDto { }

export class ValidationError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class InsufficientFundsError extends ValidationError {
    constructor() {
        super('Insufficient funds for transaction');
    }
}

export class InvalidSignatureError extends ValidationError {
    constructor() {
        super('Invalid transaction signature');
    }
}

export class DoubleSpendingError extends ValidationError {
    constructor() {
        super('Transaction already exists in blockchain');
    }
}

export class InvalidTimestampError extends ValidationError {
    constructor() {
        super('Invalid transaction timestamp');
    }
}