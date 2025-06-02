import { IsString, IsEnum, IsNumber, IsObject, IsOptional, IsEmail, IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { SpecialtyType } from "../../../common/enums"

export class CreateDepartmentDto {
  @ApiProperty({ example: "Intensive Care Unit" })
  @IsString()
  name: string

  @ApiProperty({ example: "ICU" })
  @IsString()
  code: string

  @ApiProperty({ example: "Critical care unit for intensive patient monitoring", required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: SpecialtyType, example: SpecialtyType.ICU })
  @IsEnum(SpecialtyType)
  specialty: SpecialtyType

  @ApiProperty({ example: 30 })
  @IsNumber()
  capacity: number

  @ApiProperty({ example: 25 })
  @IsNumber()
  currentCensus: number

  @ApiProperty({
    example: {
      dayShift: {
        registeredNurses: 8,
        licensedPracticalNurses: 4,
        certifiedNursingAssistants: 6,
        supportStaff: 2,
      },
      eveningShift: {
        registeredNurses: 6,
        licensedPracticalNurses: 3,
        certifiedNursingAssistants: 4,
        supportStaff: 1,
      },
      nightShift: {
        registeredNurses: 4,
        licensedPracticalNurses: 2,
        certifiedNursingAssistants: 3,
        supportStaff: 1,
      },
    },
  })
  @IsObject()
  staffingRequirements: {
    dayShift: {
      registeredNurses: number
      licensedPracticalNurses: number
      certifiedNursingAssistants: number
      supportStaff: number
    }
    eveningShift: {
      registeredNurses: number
      licensedPracticalNurses: number
      certifiedNursingAssistants: number
      supportStaff: number
    }
    nightShift: {
      registeredNurses: number
      licensedPracticalNurses: number
      certifiedNursingAssistants: number
      supportStaff: number
    }
  }

  @ApiProperty({ example: "Dr. Sarah Johnson" })
  @IsString()
  managerName: string

  @ApiProperty({ example: "sarah.johnson@hospital.com" })
  @IsEmail()
  managerEmail: string

  @ApiProperty({ example: "Floor 3, Wing A" })
  @IsString()
  location: string

  @ApiProperty({
    example: [
      {
        name: "Ventilator",
        quantity: 10,
        status: "available",
      },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  equipment?: {
    name: string
    quantity: number
    status: "available" | "in_use" | "maintenance" | "out_of_order"
  }[]
}
