import { IsString, IsDateString, IsEnum, IsOptional, IsObject, IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Priority } from "../../../common/enums"

export class CreatePatientDto {
  @ApiProperty({ example: "MRN123456" })
  @IsString()
  medicalRecordNumber: string

  @ApiProperty({ example: "John" })
  @IsString()
  firstName: string

  @ApiProperty({ example: "Doe" })
  @IsString()
  lastName: string

  @ApiProperty({ example: "1980-05-15" })
  @IsDateString()
  dateOfBirth: string

  @ApiProperty({ example: "Male" })
  @IsString()
  gender: string

  @ApiProperty({ example: "+1234567890", required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string

  @ApiProperty({ example: "2024-01-15T10:00:00Z" })
  @IsDateString()
  admissionDate: string

  @ApiProperty({ example: "2024-01-20T10:00:00Z", required: false })
  @IsOptional()
  @IsDateString()
  dischargeDate?: string

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM })
  @IsEnum(Priority)
  acuityLevel: Priority

  @ApiProperty({ example: "Pneumonia", required: false })
  @IsOptional()
  @IsString()
  primaryDiagnosis?: string

  @ApiProperty({ example: ["Diabetes", "Hypertension"], required: false })
  @IsOptional()
  @IsArray()
  secondaryDiagnoses?: string[]

  @ApiProperty({ example: ["Penicillin", "Latex"], required: false })
  @IsOptional()
  @IsArray()
  allergies?: string[]

  @ApiProperty({ example: "101A" })
  @IsString()
  roomNumber: string

  @ApiProperty({ example: "1" })
  @IsString()
  bedNumber: string

  @ApiProperty({ example: "Dr. Smith", required: false })
  @IsOptional()
  @IsString()
  attendingPhysician?: string

  @ApiProperty({ example: "nurse-uuid", required: false })
  @IsOptional()
  @IsString()
  primaryNurse?: string

  @ApiProperty({
    example: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
  }

  @ApiProperty({
    example: {
      name: "Jane Doe",
      relationship: "Spouse",
      phoneNumber: "+1987654321",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  emergencyContact?: {
    name: string
    relationship: string
    phoneNumber: string
  }

  @ApiProperty({
    example: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Daily",
        route: "Oral",
        prescribedBy: "Dr. Smith",
      },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  currentMedications?: {
    name: string
    dosage: string
    frequency: string
    route: string
    prescribedBy: string
  }[]
}
