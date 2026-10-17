import {
  Body, Controller, Delete, Get, HttpCode, Param,
  ParseIntPipe, Patch, Post,
} from "@nestjs/common";
import { TodosService } from "./todos.service";
import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";

@Controller("todos")
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  findAll() {
    return this.todos.findAll();
  }

  @Post()
  create(@Body() dto: CreateTodoDto) {
    return this.todos.create(dto); // 201 by default
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateTodoDto) {
    return this.todos.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.todos.remove(id); // the return is the slide gap
  }
}