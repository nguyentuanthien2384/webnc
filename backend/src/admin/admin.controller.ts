import {
  Controller,
  Post,
  Param,
  UseGuards,
  Patch,
  Body,
  Delete,
  Get,
  Query,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';
import { UserRole } from '../users/schemas/user.schema';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { GetDocumentsQueryDto } from '../documents/dto/get-documents-query.dto';
import { GetLogsQueryDto } from '../logs/dto/get-logs-query.dto';
import { LogsService } from '../logs/logs.service';
import { Request as ExpressRequest } from 'express';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: { userId: string; email: string; role: string };
}

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly logsService: LogsService,
  ) {}

  @Permissions(Permission.USERS_RESET_PASSWORD)
  @Post('users/:id/reset-password')
  resetPassword(
    @Param('id') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.resetPassword(userId, req.user.userId);
  }

  @Permissions(Permission.USERS_MODERATE)
  @Post('users/:id/block')
  blockUser(@Param('id') userId: string, @Request() req: AuthenticatedRequest) {
    return this.adminService.blockUser(
      userId,
      req.user.userId,
      req.user.role as UserRole,
    );
  }

  @Permissions(Permission.USERS_MODERATE)
  @Post('users/:id/unblock')
  unblockUser(
    @Param('id') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.unblockUser(
      userId,
      req.user.userId,
      req.user.role as UserRole,
    );
  }

  @Permissions(Permission.DOCUMENTS_MODERATE)
  @Post('documents/:id/block')
  blockDocument(
    @Param('id') docId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.blockDocument(docId, req.user.userId);
  }

  @Permissions(Permission.DOCUMENTS_MODERATE)
  @Post('documents/:id/unblock')
  unblockDocument(
    @Param('id') docId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.unblockDocument(docId, req.user.userId);
  }

  @Permissions(Permission.USERS_DELETE)
  @Delete('users/:id')
  deleteUser(
    @Param('id') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.deleteUser(userId, req.user.userId);
  }

  @Permissions(Permission.DOCUMENTS_REVIEW)
  @Get('documents')
  getDocumentsAdmin(@Query() queryDto: GetDocumentsQueryDto) {
    return this.adminService.getDocumentsAdmin(queryDto);
  }

  @Permissions(Permission.DOCUMENTS_DELETE_ANY)
  @Delete('documents/:id')
  deleteDocument(
    @Param('id') docId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.deleteDocument(docId, req.user.userId);
  }

  @Permissions(Permission.USERS_ASSIGN_ROLE)
  @Patch('users/:id/role')
  setUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.setUserRole(
      userId,
      updateUserRoleDto.role,
      req.user.userId,
    );
  }

  @Permissions(Permission.ADMIN_DELEGATE)
  @Post('delegate-admin/:id')
  delegateAdmin(
    @Param('id') targetUserId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.delegateAdmin(targetUserId, req.user.userId);
  }

  @Permissions(Permission.USERS_LIST)
  @Get('users')
  getUsers(@Query() queryDto: GetUsersQueryDto) {
    return this.adminService.getUsers(queryDto);
  }

  @Permissions(Permission.AUDIT_VIEW)
  @Get('logs')
  getLogs(@Query() queryDto: GetLogsQueryDto) {
    return this.logsService.findAll(queryDto);
  }

  @Permissions(Permission.CATALOG_MANAGE)
  @Post('subjects')
  createSubject(
    @Body() createSubjectDto: CreateSubjectDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.createSubject(createSubjectDto, req.user.userId);
  }

  @Permissions(Permission.CATALOG_MANAGE)
  @Get('subjects')
  findAllSubjects() {
    return this.adminService.findAllSubjects();
  }

  @Permissions(Permission.CATALOG_MANAGE)
  @Patch('subjects/:id')
  updateSubject(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.updateSubject(
      id,
      updateSubjectDto,
      req.user.userId,
    );
  }

  @Permissions(Permission.CATALOG_MANAGE)
  @Delete('subjects/:id')
  removeSubject(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.adminService.removeSubject(id, req.user.userId);
  }

  @Permissions(Permission.CATALOG_MANAGE)
  @Post('majors')
  createMajor(
    @Body() createMajorDto: CreateMajorDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.createMajor(createMajorDto, req.user.userId);
  }

  @Permissions(Permission.CATALOG_MANAGE)
  @Get('majors')
  findAllMajors() {
    return this.adminService.findAllMajors();
  }

  @Permissions(Permission.CATALOG_MANAGE)
  @Patch('majors/:id')
  updateMajor(
    @Param('id') id: string,
    @Body() updateMajorDto: UpdateMajorDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.updateMajor(id, updateMajorDto, req.user.userId);
  }

  @Permissions(Permission.CATALOG_MANAGE)
  @Delete('majors/:id')
  removeMajor(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.adminService.removeMajor(id, req.user.userId);
  }
}
