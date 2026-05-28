import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface RequestUser {
  userId: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return {
      userId: request.headers['x-user-id'] as string,
      email:  request.headers['x-user-email'] as string,
      role:   request.headers['x-user-role'] as string,
    };
  },
);
