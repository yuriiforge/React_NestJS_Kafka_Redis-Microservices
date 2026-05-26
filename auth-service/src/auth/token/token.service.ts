import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@ecommerce/shared/src/enums/role.enum';
import { CustomJwtPayload } from '@ecommerce/shared/src/types/jwt-payload.type';
import { REDIS_CLIENT } from '../../redis/redis.provider';
import { Redis } from 'ioredis';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async generateToken(user: {
    userId: string;
    email: string;
    username: string;
    role: Role;
  }) {
    const payload: CustomJwtPayload = {
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    await this.redis.set(
      `refresh:${user.userId}`,
      refreshToken,
      'EX',
      60 * 60 * 24 * 7,
    );

    return { accessToken, refreshToken };
  }

  async verifyToken() {}

  async refreshToken() {}

  async revokeToken() {}
}
