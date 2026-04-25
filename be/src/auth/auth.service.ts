import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Đăng ký tài khoản mới (Hỗ trợ giả lập SSO)
   */
  async register(dto: CreateUserDto) {
    // 1. Kiểm tra sự tồn tại của Email hoặc Username
    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username }
        ],
      },
    });

    if (userExists) {
      throw new ConflictException('Email hoặc Tên đăng nhập đã được sử dụng trong hệ thống');
    }

    // 2. Mã hóa mật khẩu (Bắt buộc cho tài khoản thông thường)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Tạo User trong Database (Prisma Generated Client)
    const newUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        universityId: dto.universityId || null, // Giả lập SSO: có thể không có universityId ban đầu
        role: dto.role,
        debtAmount: dto.debtAmount || 0,
        dueDate: dto.dueDate || null,
      },
    });

    // 4. Trả về thông tin an toàn (loại bỏ password)
    const { password, ...result } = newUser;
    return result;
  }

  /**
   * Đăng nhập và cấp Token
   */
  async login(dto: LoginDto) {
    // 1. Tìm User theo username
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    // 2. Kiểm tra sự tồn tại và tính hợp lệ của mật khẩu
    if (!user || !user.password) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    // 3. So sánh mật khẩu băm
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    // 4. Tạo Payload cho JWT (Chứa thông tin định danh và phân quyền)
    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role 
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        universityId: user.universityId,
      },
    };
  }
}