import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  /**
   * Làm mới access token bằng refresh token
   */
  async refreshToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Không có refresh token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      return {
        access_token: await this.jwtService.signAsync({
          sub: payload.sub,
          username: payload.username,
          role: payload.role,
        }),
      };
    } catch (err) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  /**
   * Đăng ký tài khoản mới
   */
  async register(dto: CreateUserDto) {
    // 1. Kiểm tra sự tồn tại của Email hoặc Username
    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username },
          { universityId: dto.universityId }
        ],
      },
    });

    if (userExists) {
      throw new ConflictException('Email hoặc Tên đăng nhập hoặc MSSV/MSCB đã được sử dụng trong hệ thống');
    }

    // 2. Chỉ được là role STUDENT/STAFF (sinh viên hoặc cán bộ)
    const allowedRoles: Role[] = [Role.STUDENT, Role.STAFF];

    if (!allowedRoles.includes(dto.role)) {
      throw new BadRequestException('Role không hợp lệ');
    }

    // 3. Băm mật khẩu
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 4. Tạo User trong Database
    const newUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        universityId: dto.universityId || null,
        role: dto.role,
        debtAmount: dto.debtAmount || 0,
        dueDate: dto.dueDate || null,
      },
    });

    // 5. Trả về thông tin an toàn (bỏ password)
    const { password, ...result } = newUser;

    // Thêm message để frontend biết đăng ký thành công
    result['message'] = 'Đăng ký thành công';

    return result;
  }

  /**
   * Đăng nhập và cấp Token
   */
  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    // refresh lưu trong cookie, access token trả về cho client
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET ?? 'dev-jwt-secret',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET ?? 'dev-jwt-secret',
    });

    // set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // khi nào deploy thì để secure: true
      sameSite: 'lax',
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        universityId: user.universityId,
      },
    };
  }
}