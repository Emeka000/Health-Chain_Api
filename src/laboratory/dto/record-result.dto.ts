import { IsNumber, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class TestResultItem {
  @ApiProperty()
  @IsNumber()
  testId: number;

  @ApiProperty()
  @IsString()
  result: string;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsString()
  referenceRange: string;
}

export class RecordResultDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ type: [TestResultItem] })
  @IsArray()
  results: TestResultItem[];
}
