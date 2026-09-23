import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, catchError, from, mergeMap, throwError } from 'rxjs';
import { deleteDocumentFiles } from '../common/document-storage';
import { join } from 'path';

type UploadRequest = Request & {
  file?: Express.Multer.File & { persisted?: boolean };
};

@Injectable()
export class CleanupFailedUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<UploadRequest>();
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (!req.file || req.file.persisted) return throwError(() => error);
        return from(
          deleteDocumentFiles({
            filePath: req.file.path,
            thumbnailPath: join(
              'uploads',
              'thumbnails',
              req.file.filename.replace(/\.[^.]+$/, '') + '.png',
            ),
          }),
        ).pipe(mergeMap(() => throwError(() => error)));
      }),
    );
  }
}
