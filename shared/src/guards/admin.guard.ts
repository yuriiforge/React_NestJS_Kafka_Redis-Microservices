import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();

    if (request.headers['x-user-role'] !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
