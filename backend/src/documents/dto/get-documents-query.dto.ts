import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
  IsArray,
  IsDateString,
  Max,
  IsMongoId,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetDocumentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(9999)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  subject?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value : value == null ? value : [value],
  )
  @IsMongoId({ each: true })
  subjects?: string[];

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  uploader?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsOptional()
  @IsIn(['uploadDate', 'downloadCount', 'downloads'])
  sortBy?: string = 'uploadDate';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
