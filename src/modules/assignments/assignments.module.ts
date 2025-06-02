import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AssignmentsService } from "./assignments.service"
import { AssignmentsController } from "./assignments.controller"
import { Assignment } from "./entities/assignment.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Assignment])],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
