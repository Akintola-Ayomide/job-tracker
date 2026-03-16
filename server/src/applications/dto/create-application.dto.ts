import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { ApplicationStatus } from '../entities/job-application.entity';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  company: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsNotEmpty()
  @IsDateString()
  dateApplied: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
