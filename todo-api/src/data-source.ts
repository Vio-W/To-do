import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  host: "127.0.0.1",
  port: 5434,
  username: "postgres",
  password: "postgres",
  database: "todo",
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
});