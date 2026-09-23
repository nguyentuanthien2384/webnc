import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { GetUploadsOverTimeQueryDto } from './dto/get-uploads-over-time-query.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('platform')
  getPlatformStats() {
    return this.statisticsService.getPlatformStats();
  }

  @Get('uploads-over-time')
  getUploadsOverTime(@Query() query: GetUploadsOverTimeQueryDto) {
    return this.statisticsService.getUploadsOverTime(query.days ?? 30);
  }
}
