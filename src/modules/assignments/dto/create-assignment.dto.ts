import { IsString, IsEnum, IsDateString, IsOptional, IsObject, IsNumber } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { AssignmentType, Priority } from "../../../common/enums"

export class CreateAssignmentDto {
  @ApiProperty({ example: "nurse-uuid" })
  @IsString()
  nurseId: string

  @ApiProperty({ example: "patient-uuid", required: false })
  @IsOptional()
  @IsString()
  patientId?: string

  @ApiProperty({ example: "department-uuid", required: false })
  @IsOptional()
  @IsString()
  departmentId?: string

  @ApiProperty({ enum: AssignmentType, example: AssignmentType.PATIENT })
  @IsEnum(AssignmentType)
  assignmentType: AssignmentType

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM })
  @IsEnum(Priority)
  priority: Priority

  @ApiProperty({ example: "2024-01-15T07:00:00Z" })
  @IsDateString()
  startTime: string

  @ApiProperty({ example: "2024-01-15T19:00:00Z", required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string

  @ApiProperty({ example: "Special care instructions", required: false })
  @IsOptional()
  @IsString()
  assignmentNotes?: string

  @ApiProperty({ example: 1.5, description: "Workload complexity factor" })
  @IsNumber()
  workloadWeight: number

  @ApiProperty({
    example: {
      medicationAdministration: true,
      vitalSignsMonitoring: true,
      mobilityAssistance: false,
      woundCare: true,
      ivTherapy: false,
      specialDiet: false,
      isolationPrecautions: false,
      fallRisk: true,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  careRequirements?: {
    medicationAdministration: boolean
    vitalSignsMonitoring: boolean
    mobilityAssistance: boolean
    woundCare: boolean
    ivTherapy: boolean
    specialDiet: boolean
    isolationPrecautions: boolean
    fallRisk: boolean
    other?: string[]
  }
}
