import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcryptjs';
import { Role, prisma } from '@ecommerce/shared';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
  constructor(private readonly tokenService: TokenService) {}

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    return this.tokenService.generateTokens({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  }

  logout(userId: string) {
    return this.tokenService.revokeToken(userId);
  }

  async register(data: RegisterDto) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    return this.tokenService.generateTokens({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
