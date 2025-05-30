import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

class RequirementsDto {
  @IsString()
  boardCertification: string

  @IsNumber()
  minimumExperience: number

  @IsArray()
  @IsString({ each: true })
  requiredTraining: string[]

  @IsNumber()
  continuingEducationCredits: number
}

export class CreateSpecialtyDto {
  @IsString()
  name: string

  @IsString()
  code: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => RequirementsDto)
  requirements?: RequirementsDto

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
