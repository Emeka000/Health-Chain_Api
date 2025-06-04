import { IsEmail, IsString, IsEnum, IsOptional, IsArray, MinLength, IsDateString, IsPhoneNumber } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}
