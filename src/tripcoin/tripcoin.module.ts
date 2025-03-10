import { Module } from '@nestjs/common';
import { TripcoinService } from './tripcoin.service';
import { RedisModule } from 'src/redis/redis.module';
import { StateModule } from 'src/state/state.module';
import { ValidatorModule } from 'src/validator/validator.module';

@Module({
    imports: [RedisModule, StateModule, ValidatorModule],
    providers: [TripcoinService],
    exports: [TripcoinService],
})
export class TripcoinModule { }
