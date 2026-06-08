import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  userId: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string> }>();

    return {
      userId: request.headers['x-user-id'],
      email:  request.headers['x-user-email'],
      role:   request.headers['x-user-role'],
    };
  },
);
