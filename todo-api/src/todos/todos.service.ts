import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  constructor(@InjectRepository(Todo) private todos: Repository<Todo>) {}

  create(dto: CreateTodoDto, userId: string) {
    return this.todos.save(this.todos.create({ ...dto, ownerId: userId }));
  }

  findAll(userId: string) {
    return this.todos.find({ where: { ownerId: userId } });
  }

  async findOne(id: number, userId: string) {
    const todo = await this.todos.findOne({ where: { id, ownerId: userId } });
    if (!todo) throw new NotFoundException('Todo not found');
    return todo;
  }

  async update(id: number, dto: UpdateTodoDto, userId: string) {
    const todo = await this.findOne(id, userId);
    Object.assign(todo, dto);
    return this.todos.save(todo);
  }

  async remove(id: number, userId: string) {
    const todo = await this.findOne(id, userId);
    await this.todos.remove(todo);
    return { deleted: true };
  }
}