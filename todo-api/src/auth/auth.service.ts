import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../users/user.entity';
import { SignupDto } from './dto/signup.dto';
import { RefreshToken } from './refresh-token.entity';

export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokens: Repository<RefreshToken>,
    private jwt: JwtService,
  ) {}

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

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = randomBytes(48).toString('hex');
    await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        revokedAt: null,
      }),
    );
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async rotate(rawToken: string) {
    const row = await this.refreshTokens.findOne({
      where: { tokenHash: this.hashToken(rawToken) },
    });
    if (!row) throw new UnauthorizedException('Invalid refresh token');

    if (row.revokedAt) {
      // an already-used token came back: treat it as stolen, revoke everything
      await this.refreshTokens.update(
        { userId: row.userId, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (row.expiresAt < new Date())
      throw new UnauthorizedException('Invalid refresh token');

    row.revokedAt = new Date();
    await this.refreshTokens.save(row);

    const user = await this.users.findOneBy({ id: row.userId });
    if (!user) throw new UnauthorizedException('Invalid refresh token');
    return this.issueTokens(user);
  }

  async revoke(rawToken: string) {
    await this.refreshTokens.update(
      { tokenHash: this.hashToken(rawToken), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}