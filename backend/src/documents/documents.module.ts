import { BadRequestException, Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from './schemas/document.schema';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from '../users/users.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { LogsModule } from '../logs/logs.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { hasAllowedDocumentNameAndMime } from './validate-uploaded-document';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: './uploads',
          filename: (_req, file, callback) => {
            const randomName = randomBytes(16).toString('hex');
            const fileExtName = extname(file.originalname);
            callback(null, `${randomName}${fileExtName}`);
          },
        }),
        limits: { fileSize: 100 * 1024 * 1024 },
        fileFilter: (_req, file, callback) => {
          if (hasAllowedDocumentNameAndMime(file)) {
            callback(null, true);
          } else {
            callback(
              new BadRequestException(
                'Chỉ cho phép upload file PDF, DOC hoặc DOCX đúng định dạng',
              ),
              false,
            );
          }
        },
      }),
    }),
    UsersModule,
    StatisticsModule,
    LogsModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
