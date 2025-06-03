import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NursesService } from './nurses.service';
import { NursesController } from './nurses.controller';
import { Nurse } from './entities/nurse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nurse])],
  controllers: [NursesController],
  providers: [NursesService],
  exports: [NursesService],
})
export class NursesModule {}
