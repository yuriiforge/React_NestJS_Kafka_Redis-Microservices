import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import prismaClient from '@ecommerce/shared/src/prisma';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor() {}

  async login(data: LoginDto) {
    try {
      const user = await prismaClient.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new NotFoundException('User is not found!');
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Incorrect password!');
      }
    } catch (err: unknown) {}
  }

  async register(data: RegisterDto) {}

  async logout() {}

  async refresh() {}

  async checkMe() {}
}
