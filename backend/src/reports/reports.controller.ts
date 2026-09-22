import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateReportDto, ReportQueryDto, ResolveReportDto } from './report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Post()
  create(@Body() dto: CreateReportDto, @Req() req: { user: { userId: string } }) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  list(@Query() query: ReportQueryDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  resolve(@Param('id') id: string, @Body() dto: ResolveReportDto, @Req() req: { user: { userId: string } }) {
    return this.service.resolve(id, dto, req.user.userId);
  }
}
