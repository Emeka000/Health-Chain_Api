import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consent } from '../consent/entities/consent.entity';
import { ConsentService } from './consent.service';
import { ConsentController } from './consent.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Consent])],
  providers: [ConsentService],
  controllers: [ConsentController],
})
export class ConsentModule {}
