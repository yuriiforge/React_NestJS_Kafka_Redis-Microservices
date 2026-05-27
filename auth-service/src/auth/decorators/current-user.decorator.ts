import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CustomJwtPayload } from '@ecommerce/shared/src/types/jwt-payload.type';
import * as jwt from 'jsonwebtoken';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CustomJwtPayload | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return null;

    return jwt.decode(token) as CustomJwtPayload;
  },
);
