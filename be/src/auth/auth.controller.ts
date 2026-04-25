import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';

@Controller('auth') // Decorator định nghĩa route (route /auth)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}