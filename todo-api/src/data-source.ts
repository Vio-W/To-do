import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { validateEnvironment } from './config/environment';

dotenv.config();

const config = validateEnvironment(process.env);

export default new DataSource({
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
