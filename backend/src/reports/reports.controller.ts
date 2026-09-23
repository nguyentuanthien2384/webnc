import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';
import {
  CreateReportDto,
  ReportQueryDto,
  ResolveReportDto,
} from './report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Post()
  @Permissions(Permission.REPORTS_CREATE)
  create(
    @Body() dto: CreateReportDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @Permissions(Permission.REPORTS_REVIEW)
  list(@Query() query: ReportQueryDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  @Permissions(Permission.REPORTS_REVIEW)
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @Req() req: { user: { userId: string } },
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID báo cáo không hợp lệ.');
    }
    return this.service.resolve(id, dto, req.user.userId);
  }
}
