import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';
import { GetUploadsOverTimeQueryDto } from './dto/get-uploads-over-time-query.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Permissions(Permission.STATISTICS_VIEW)
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
