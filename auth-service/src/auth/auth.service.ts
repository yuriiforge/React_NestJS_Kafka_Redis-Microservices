import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcryptjs';
import prisma from '@ecommerce/shared/src/prisma';
import { TokenService } from './token/token.service';
import { Role } from '@ecommerce/shared/src/enums/role.enum';

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
      role: user.role as unknown as Role,
    });
  }

  logout(userId: string) {
    return this.tokenService.revokeToken(userId);
  }

  async register(data: RegisterDto) {
    // 1. check if email already taken
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    // 2. hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. create user in DB
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

    // 4. issue tokens same as login
    return this.tokenService.generateTokens({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role as unknown as Role,
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
