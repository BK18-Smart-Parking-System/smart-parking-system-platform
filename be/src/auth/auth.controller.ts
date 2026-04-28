import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpStatus, HttpCode, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';

@Controller('auth') // Decorator định nghĩa route (route /auth)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const token = req.cookies?.refreshToken;
    return this.authService.refreshToken(token);
  }

  @Post('register')
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Xóa cookie refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, // true nếu trong môi trường production
      sameSite: 'lax',
    });
    return { message: 'Đăng xuất thành công' };
  }
}