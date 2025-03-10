import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    verifySignature(
        signature: string,
        data: string,
        publicKey: string,
    ): boolean {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        return verify.verify(publicKey, signature, 'hex');
    }
}