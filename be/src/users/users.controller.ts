import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';

@Controller('users') // Decorator định nghĩa route (route /users)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
	
	/**
   * Sử dụng Interface làm kiểu trả về cho Promise hoặc mảng
   * Giúp đảm bảo hàm này luôn trả về đúng cấu trúc của User
  */ 
	@Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
	
	@Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  /*
  * Kết hợp: 
  * - Đầu vào: CreateUserDto (để validate)
  * - Đầu ra: User Interface (để định kiểu kết quả trả về)
  */
  @Post()
  create(@Body() createUserDto: CreateUserDto): User {
    // Giả sử service trả về một đối tượng User sau khi tạo thành công
    return this.usersService.create(createUserDto);
  }
}
