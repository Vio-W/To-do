import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TodosModule } from "./todos/todos.module";
import { ProfileModule } from "./profile/profile.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "127.0.0.1",
      port: 5434,
      username: "postgres",
      password: "postgres",
      database: "todo",
      autoLoadEntities: true,
      synchronize: false,
    }),
    TodosModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}