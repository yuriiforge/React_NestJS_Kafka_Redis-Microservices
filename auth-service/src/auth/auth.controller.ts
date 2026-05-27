import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from './decorators/current-user.decorator';
import { type CustomJwtPayload } from '@ecommerce/shared/src/types/jwt-payload.type';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { TokenService } from './token/token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('register')
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('refresh')
  async refresh(@Body() data: RefreshDto) {
    return this.tokenService.refreshToken(data.userId, data.refreshToken);
  }

  @Get('me')
  me(@CurrentUser() user: CustomJwtPayload) {
    return this.authService.getMe(user.userId);
  }

  @Post('logout')
  async logout(@CurrentUser() user: CustomJwtPayload) {
    return this.authService.logout(user.userId);
  }
}
