import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TodosModule } from "./todos/todos.module";
import { ProfileModule } from "./profile/profile.module";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST"),
        port: Number(config.get("DB_PORT")),
        username: config.get<string>("DB_USER"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_NAME"),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    TodosModule,
    ProfileModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}