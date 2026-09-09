import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';
import type { Response } from 'express';

/**
 * Mongoose ném CastError khi một giá trị không ép kiểu được sang kiểu của
 * schema — hay gặp nhất là ObjectId sai định dạng trên route param
 * (vd: /api/users/notanid/profile). Nếu không bắt, Nest trả về 500 dù đây là
 * lỗi từ phía client. Filter này quy về 400 cho toàn bộ route.
 */
@Catch(MongooseError.CastError)
export class CastErrorFilter implements ExceptionFilter {
  catch(exception: MongooseError.CastError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: `Giá trị "${String(exception.value)}" không hợp lệ cho trường "${exception.path}"`,
    });
  }
}
