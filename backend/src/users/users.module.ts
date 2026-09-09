import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Document, DocumentSchema } from '../documents/schemas/document.schema';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';
import { LogsModule } from '../logs/logs.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Document.name, schema: DocumentSchema },
    ]),
    LogsModule,
    StatisticsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
