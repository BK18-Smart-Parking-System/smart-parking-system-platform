import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  findAll(): User[] {
    return [{id: 100, username: "Alice", email: "alice@example.com", role: "user", createdAt: new Date()}, {id: 200, username: "Bob", email: "bob@example.com", role: "user", createdAt: new Date()}, {id: 300, username: "Charlie", email: "charlie@example.com", role: "admin", createdAt: new Date()}];
  }

  findOne(id: string): User {
    const user = this.findAll().find(user => user.id === parseInt(id));
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  create(createUserDto: any): User {
    // Giả sử service tạo một người dùng mới và trả về đối tượng User
    const newUser: User = {
      id: Math.floor(Math.random() * 1000), // Tạo ID ngẫu nhiên cho ví dụ
      username: createUserDto.username,
      email: createUserDto.email,
      role: createUserDto.role,
      createdAt: new Date(),
    };
    return newUser;
  }
}
