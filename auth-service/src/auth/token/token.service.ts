import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, CustomJwtPayload } from '@ecommerce/shared';
import { REDIS_CLIENT } from '../../redis/redis.provider';
import { Redis } from 'ioredis';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async generateTokens(user: {
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

  verifyToken(token: string): CustomJwtPayload {
    try {
      return this.jwtService.verify<CustomJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    // check if refresh token exists in Redis
    const stored = await this.redis.get(`refresh:${userId}`);

    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // get user data from the token payload
    const payload = this.jwtService.decode<CustomJwtPayload>(refreshToken);

    // issue new token pair
    return this.generateTokens({
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    });
  }

  async revokeToken(userId: string): Promise<void> {
    await this.redis.del(`refresh:${userId}`);
  }
}
