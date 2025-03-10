import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';

@Controller('contracts')
export class SmartContractController {
    constructor(private readonly smartContractService: SmartContractService) { }

    @Post('deploy')
    async deployContract(@Body() body: { businessAddress: string; initialSupply: number }) {
        await this.smartContractService.deployLoyaltyContract(body.businessAddress, body.initialSupply);
        return { message: 'Contract deployed successfully' };
    }

    @Get(':businessAddress/stats')
    async getContractStats(@Param('businessAddress') businessAddress: string) {
        const contract = await this.smartContractService.getContract(businessAddress);
        return {
            totalSupply: contract.totalSupply,
            circulatingSupply: contract.circulatingSupply,
            tokenPrice: contract.tokenPrice,
            transactions: contract.transactions.length,
        };
    }

    @Post(':businessAddress/update-state')
    async updateContractState(@Param('businessAddress') businessAddress: string, @Body() body: { newState: string }) {
        await this.smartContractService.updateContractState(businessAddress, body.newState);
        return { message: 'Contract state updated successfully' };
    }
}