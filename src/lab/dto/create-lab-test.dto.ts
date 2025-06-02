import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateLabTestDto {
  @IsString()
  @IsNotEmpty()
  testCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  parameters: Record<string, { min: number; max: number }>;
}
