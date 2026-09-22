import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './report.schema';
import { Document, DocumentSchema } from '../documents/schemas/document.schema';
import { LogsModule } from '../logs/logs.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Report.name, schema: ReportSchema },
    { name: Document.name, schema: DocumentSchema },
  ]), LogsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
