import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { AppError } from './app-error';

@Catch()
export class UnifiedGlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnifiedGlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
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

    // Determine HTTP status code
    const httpStatus =
      error instanceof AppError
        ? error.statusCode
        : exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the exception
    this.logger.error(
      `Exception caught: ${exception instanceof Error ? exception.message : exception}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Development error response
    if (process.env.NODE_ENV === 'development') {
      response.status(httpStatus).json({
        status: error.status || 'error',
        message: error.message || 'An unexpected error occurred',
        stack: error.stack,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Production error response
    if (process.env.NODE_ENV === 'production') {
      if (error instanceof AppError && error.isOperational) {
        // Operational errors (e.g., AppError)
        response.status(httpStatus).json({
          status: error.status,
          message: error.message,
        });
      } else {
        // Log non-operational errors
        console.error('ERROR:', error);

        // Generic response for non-operational errors
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: 'Something went wrong, please try again later.',
        });
      }
      return;
    }

    // Fallback response (if environment is not set)
    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode: httpStatus,
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      },
      httpStatus,
    );
  }
}
