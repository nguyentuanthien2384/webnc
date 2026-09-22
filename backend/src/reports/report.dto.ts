import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsMongoId()
  documentId: string;

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;
}

export class ReportQueryDto {
  @IsOptional()
  @IsIn(['OPEN', 'RESOLVED', 'DISMISSED'])
  status?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  page: number = 1;
}

export class ResolveReportDto {
  @IsIn(['RESOLVED', 'DISMISSED'])
  status: string;
}
