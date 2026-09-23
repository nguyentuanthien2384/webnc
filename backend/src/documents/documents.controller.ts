import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  Param,
  Res,
  Get,
  Query,
  Delete,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDocumentDto } from './dto/upload-document.dto';
import type { Response } from 'express';
import { Request as ExpressRequest } from 'express';
import { GetDocumentsQueryDto } from './dto/get-documents-query.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Types } from 'mongoose';
import { extname } from 'path';
import { CleanupFailedUploadInterceptor } from './cleanup-failed-upload.interceptor';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';

interface AuthenticatedRequest extends ExpressRequest {
  user: { userId: string; email: string; role: string };
}

function setFileHeaders(
  res: Response,
  doc: {
    fileType: string;
    fileUrl: string;
    title: string;
    originalFileName?: string;
  },
  disposition: 'attachment' | 'inline',
) {
  const extension = extname(doc.fileUrl.split(/[?#]/)[0]);
  const filename =
    doc.originalFileName || `${doc.title}${extension}` || 'document';
  const safeFallbackName = filename
    .replace(/["\\\r\n]/g, '_')
    .replace(/[^\x20-\x7E]/g, '_');

  res.set({
    'Content-Type': doc.fileType,
    'Content-Disposition': `${disposition}; filename="${safeFallbackName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  });
}

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.DOCUMENTS_UPLOAD)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'), CleanupFailedUploadInterceptor)
  uploadDocument(
    @Request() req: AuthenticatedRequest,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploaderId = req.user.userId;
    return this.documentsService.create(uploadDocumentDto, file, uploaderId);
  }

  @Get()
  findAll(@Query() queryDto: GetDocumentsQueryDto) {
    return this.documentsService.findAll(queryDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-uploads')
  getMyUploads(
    @Request() req: AuthenticatedRequest,
    @Query() queryDto: GetDocumentsQueryDto,
  ) {
    const userId = req.user.userId;
    return this.documentsService.findMyDocuments(userId, queryDto);
  }

  @Get('user/:userId/uploads')
  getUserUploads(
    @Param('userId') userId: string,
    @Query() queryDto: GetDocumentsQueryDto,
  ) {
    // Service dựng thẳng `new Types.ObjectId(userId)` nên id sai định dạng sẽ
    // ném BSONError (=> 500) thay vì CastError của Mongoose.
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    return this.documentsService.findUserDocuments(userId, queryDto);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.DOCUMENTS_GENERATE_THUMBNAILS)
  @Post('generate-thumbnails')
  generateThumbnails() {
    return this.documentsService.generateMissingThumbnails();
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.DOCUMENTS_DOWNLOAD)
  @Get(':id/download')
  async downloadDocument(
    @Param('id') docId: string,
    @Res({ passthrough: true }) res: Response,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!Types.ObjectId.isValid(docId)) {
      throw new BadRequestException('Invalid document ID format');
    }
    const { streamableFile, doc } = await this.documentsService.download(
      docId,
      req.user.userId,
      req.user.role,
    );
    setFileHeaders(res, doc, 'attachment');

    return streamableFile;
  }

  @Get(':id/preview')
  async previewDocument(
    @Param('id') docId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!Types.ObjectId.isValid(docId)) {
      throw new BadRequestException('Invalid document ID format');
    }
    const { streamableFile, doc } = await this.documentsService.preview(docId);
    setFileHeaders(res, doc, 'inline');

    return streamableFile;
  }

  @Get(':id/thumbnail')
  async thumbnail(
    @Param('id') docId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!Types.ObjectId.isValid(docId))
      throw new BadRequestException('Invalid document ID format');
    const file = await this.documentsService.thumbnail(docId);
    res.set('Content-Type', 'image/png');
    return file;
  }

  @Get(':id')
  findOne(@Param('id') docId: string) {
    if (!Types.ObjectId.isValid(docId)) {
      throw new BadRequestException('Invalid document ID format');
    }
    return this.documentsService.findOne(docId);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.DOCUMENTS_UPDATE_OWN)
  @Patch(':id')
  update(
    @Param('id') docId: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentsService.update(
      docId,
      updateDocumentDto,
      req.user.userId,
    );
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.DOCUMENTS_DELETE_OWN)
  @Delete(':id')
  remove(@Param('id') docId: string, @Request() req: AuthenticatedRequest) {
    return this.documentsService.remove(docId, req.user.userId);
  }
}
