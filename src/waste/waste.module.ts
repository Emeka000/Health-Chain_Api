import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waste } from './waste.entity';
import { WasteService } from './waste.service';
import { WasteController } from './waste.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Waste])],
  providers: [WasteService],
  controllers: [WasteController],
})
export class WasteModule {}
