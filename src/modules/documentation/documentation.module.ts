import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DocumentationService } from "./documentation.service"
import { DocumentationController } from "./documentation.controller"
import { Documentation } from "./entities/documentation.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Documentation])],
  controllers: [DocumentationController],
  providers: [DocumentationService],
  exports: [DocumentationService],
})
export class DocumentationModule {}
