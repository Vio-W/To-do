import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../users/user.entity';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async signup(dto: SignupDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.existsBy({ email }))
      throw new ConflictException('Email taken');
    const hash = await argon2.hash(dto.password);
    const user = await this.users.save({ email, passwordHash: hash });
    return { id: user.id, email: user.email };
  }

  async validate(email: string, pw: string) {
    const user = await this.users.findOne({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, role: true, passwordHash: true },
    });
    if (!user || !(await argon2.verify(user.passwordHash, pw)))
      throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}