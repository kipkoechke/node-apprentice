import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from './app-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let error = exception;

    // Handle JWT errors
    if (exception.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again.', 401);
    }
    if (exception.name === 'TokenExpiredError') {
      error = new AppError('Token expired. Please log in again.', 401);
    }

    // Development error response
    if (process.env.NODE_ENV === 'development') {
      return response.status(error.statusCode || 500).json({
        status: error.status || 'error',
        message: error.message,
        stack: error.stack,
      });
    }

    // Production error response
    if (process.env.NODE_ENV === 'production') {
      if (error.isOperational) {
        return response.status(error.statusCode).json({
          status: error.status,
          message: error.message,
        });
      }

      console.error('ERROR:', error); // Log non-operational errors

      return response.status(500).json({
        status: 'error',
        message: 'Something went wrong, please try again later.',
      });
    }
  }
}
