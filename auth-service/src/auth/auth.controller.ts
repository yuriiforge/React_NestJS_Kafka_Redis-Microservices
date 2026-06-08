import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, type RequestUser } from '@ecommerce/shared';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { TokenService } from './token/token.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Incorrect password' })
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Returns access and refresh tokens' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Returns new access and refresh tokens' })
  async refresh(@Body() data: RefreshDto) {
    return this.tokenService.refreshToken(data.userId, data.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  me(@CurrentUser() user: RequestUser) {
    return this.authService.getMe(user.userId);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Token revoked' })
  async logout(@CurrentUser() user: RequestUser) {
    return this.authService.logout(user.userId);
  }
}
