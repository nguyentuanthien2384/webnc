import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from '../documents/schemas/document.schema';
import { EditorController } from './editor.controller';
import { EditorDraft, EditorDraftSchema } from './editor-draft.schema';
import { EditorService } from './editor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EditorDraft.name, schema: EditorDraftSchema },
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [EditorController],
  providers: [EditorService],
})
export class EditorModule {}
