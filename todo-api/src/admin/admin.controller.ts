import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../auth/roles.decorator';
import { Todo } from '../todos/entities/todo.entity';

@Controller('admin')
export class AdminController {
  constructor(@InjectRepository(Todo) private todos: Repository<Todo>) {}

  @Roles('admin')
  @Get('todos')
  findAll() {
    return this.todos.find();
  }
}