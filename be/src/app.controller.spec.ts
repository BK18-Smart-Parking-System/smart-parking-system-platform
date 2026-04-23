import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { describe } from 'node:test';

// File này dùng test các controller với service
// Optional - dùng để test api (có thể hiện thực tiếp nếu muốn test)
// Mấy file trong /test cũng dùng để test, không cần để ý

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

// Test mẫu cho UsersController và UsersService
describe('UsersController', () => {
  // Similar setup and tests for UsersController can be added here
  let usersController: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();
    usersController = app.get<UsersController>(UsersController);
  });

  describe('getAllUsers', () => {
    it('should return an array of users', () => {
      expect(usersController.getAllUsers()).toEqual(['John','Jane','Bob']);
    });
  });
});