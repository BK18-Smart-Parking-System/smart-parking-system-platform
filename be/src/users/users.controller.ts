import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, ParseUUIDPipe, UseGuards, Request, Response } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '../../generated/prisma';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users') // Decorator định nghĩa route (route /users)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
	
	// Tìm tất cả người dùng hoặc tìm người dùng theo username (query parameter)
	@Get()
  async findUsers(@Query('username') username?: string) {
    return this.usersService.findUsers(username);
  }
	
  // Tìm người dùng theo ID
	@Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // Xóa user (Chỉ Dành cho ADMIN và OPERATOR)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  async deleteUser(@Param('id') id: string) {
    // Gọi hàm this.usersService.deleteUser(id) nếu có
    return { message: `Đã xóa user với id ${id}` };
  }

  // Cập nhật quyền người dùng (Chỉ ADMIN)
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateRole(@Param('id') id: string, @Body('role') role: Role) {
    const updatedUser = await this.usersService.updateRole(id, role);
    return { message: 'Cập nhật phân quyền thành công', user: updatedUser };
  }
}
