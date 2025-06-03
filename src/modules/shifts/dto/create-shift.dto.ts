import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShiftType } from '../../../common/enums';

export class CreateShiftDto {
  @ApiProperty({ example: 'nurse-uuid' })
  @IsString()
  nurseId: string;

  @ApiProperty({ example: 'department-uuid' })
  @IsString()
  departmentId: string;

  @ApiProperty({ example: '2024-01-15T07:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2024-01-15T19:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ enum: ShiftType, example: ShiftType.DAY })
  @IsEnum(ShiftType)
  shiftType: ShiftType;

  @ApiProperty({ example: 'Regular shift assignment', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
