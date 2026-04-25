import { Controller, Get, Post, Put, Delete, Param, Query, Body, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';

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
}
