import { IsIn, IsOptional, Matches } from 'class-validator';

export class GetMyUploadStatsQueryDto {
  @IsOptional()
  @IsIn(['day', 'month', 'year', 'all', 'custom'])
  period?: 'day' | 'month' | 'year' | 'all' | 'custom';

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fromDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  toDate?: string;
}
