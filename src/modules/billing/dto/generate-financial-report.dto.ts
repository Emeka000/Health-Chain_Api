import { IsEnum, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '../enums/report-type.enum';
import { ReportPeriod } from '../enums/report-period.enum';

export class GenerateFinancialReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsEnum(ReportType, { each: true })
  includeMetrics?: ReportType[];
}
