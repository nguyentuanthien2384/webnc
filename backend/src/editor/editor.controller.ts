import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateEditorDraftDto,
  ListEditorDraftsDto,
  UpdateEditorDraftDto,
} from './editor-draft.dto';
import { EditorService } from './editor.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';

@Controller('editor/drafts')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Permissions(Permission.DRAFTS_MANAGE_OWN)
export class EditorController {
  constructor(private readonly service: EditorService) {}

  @Get()
  list(
    @Req() req: { user: { userId: string } },
    @Query() query: ListEditorDraftsDto,
  ) {
    return this.service.list(req.user.userId, query.page);
  }

  @Get('for-document/:documentId')
  forDocument(
    @Req() req: { user: { userId: string } },
    @Param('documentId') documentId: string,
  ) {
    return this.service.forDocument(req.user.userId, documentId);
  }

  @Get(':id')
  findOne(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.findOne(req.user.userId, id);
  }

  @Post()
  create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateEditorDraftDto,
  ) {
    return this.service.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateEditorDraftDto,
  ) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
