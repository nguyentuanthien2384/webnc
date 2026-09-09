import { IsEnum } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class UpdateUserRoleDto {
  @IsEnum([UserRole.USER, UserRole.MODERATOR], {
    message: 'Chỉ có thể thay đổi giữa vai trò USER và MODERATOR',
  })
  role: UserRole.USER | UserRole.MODERATOR;
}
