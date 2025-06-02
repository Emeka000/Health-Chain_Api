import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ShiftsService } from "./shifts.service"
import { ShiftsController } from "./shifts.controller"
import { Shift } from "./entities/shift.entity"
import { ShiftHandoff } from "./entities/shift-handoff.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Shift, ShiftHandoff])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
