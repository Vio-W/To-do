import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/user.entity";

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ default: "TODO" })
  status: string;

  @Column({ default: false })
  starred: boolean;

  @ManyToOne(() => User, (u) => u.todos)
  owner: User;

  @Column()
  ownerId: string;
}