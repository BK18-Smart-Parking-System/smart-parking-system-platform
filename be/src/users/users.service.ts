import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { contains } from 'class-validator';
import { Role } from '../../generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Tìm người dùng theo username hoặc trả về tất cả người dùng nếu không có query
  async findUsers(username?: string) {
    // Nếu có query username, tìm user theo username
    if (username) {
      const user = await this.prisma.user.findUnique({
        where: { username },
        include: { cards: true },
      });

      if (!user) {
        throw new NotFoundException(`Không tìm thấy user với username '${username}'`);
      }

      return user;
    }
    // Nếu không có query username, trả về tất cả người dùng (có thể thêm phân trang sau)
    const users = await this.prisma.user.findMany({
      include: { cards: true },
    });

    if (users.length === 0) {
      throw new NotFoundException('Không tìm thấy user nào');
    }

    return users;
  }

  // Tìm người dùng theo MSSV
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
        where: { universityId : id },
        include: { cards: true } // Lấy kèm thông tin thẻ định danh nếu cần
      });
    
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id ${id}`);
    }

    return user;
  }

  // Lấy thông tin nợ của người dùng
  async getDebtStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { debtAmount: true, dueDate: true }
    });
    return user;
  }

  // Cập nhật role của người dùng
  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id ${id}`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
