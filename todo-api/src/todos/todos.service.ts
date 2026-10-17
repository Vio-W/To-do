import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Todo } from "./entities/todo.entity";
import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: "ASC" } });
  }

  create(dto: CreateTodoDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateTodoDto) {
    const todo = await this.repo.findOneBy({ id });
    if (!todo) throw new NotFoundException(`Todo ${id} not found`);
    Object.assign(todo, dto);
    return this.repo.save(todo);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
  }
}