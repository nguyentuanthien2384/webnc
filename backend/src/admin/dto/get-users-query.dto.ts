import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../users/schemas/user.schema';

export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  // 'downloads' và 'totalDocDownloads' đều được AdminService.getUsers xử lý
  // (cái sau chạy qua nhánh aggregate), nên phải nằm trong whitelist.
  @IsIn([
    'joinedDate',
    'fullName',
    'email',
    'downloadsCount',
    'uploadsCount',
    'downloads',
    'totalDocDownloads',
  ])
  sortBy?: string = 'joinedDate';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
