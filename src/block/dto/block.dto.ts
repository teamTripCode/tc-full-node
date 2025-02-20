export interface IBlock {
    index: number;
    timestamp: string;
    transactions: ITransaction[];
    previousHash: string;
    hash: string;
    nonce: number;
    signature: string;
    validator: string;
    calculateHash(): string;
    mineBlock(difficulty: number): void;
    forgeBlock(validator: string): void;
}

export interface BlockData {
    from: string;
    to: string;
    amount: number;
    currency?: string;
    description?: string;
}

export interface ITransaction {
    processId: string;
    description: string;
    data: string;
    timestamp: string;
    signature: string;
}