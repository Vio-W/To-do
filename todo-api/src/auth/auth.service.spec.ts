import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let refreshTokens: {
    findOne: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let users: { findOneBy: jest.Mock };
  let jwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    refreshTokens = {
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn((token) => token),
      save: jest.fn((token) => token),
    };
    users = { findOneBy: jest.fn() };
    jwt = { signAsync: jest.fn().mockResolvedValue('access-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokens },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('only rotates a token when the active-token update succeeds', async () => {
    const token = {
      id: 'token-id',
      userId: 'user-id',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    };
    refreshTokens.findOne.mockResolvedValue(token);
    refreshTokens.update.mockResolvedValueOnce({ affected: 1 });
    users.findOneBy.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'user',
    });

    await service.rotate('refresh-token');

    expect(refreshTokens.update).toHaveBeenCalledWith(
      { id: 'token-id', revokedAt: IsNull() },
      { revokedAt: expect.any(Date) },
    );
    expect(refreshTokens.save).toHaveBeenCalledTimes(1);
    expect(jwt.signAsync).toHaveBeenCalledTimes(1);
  });

  it('rejects a concurrent rotation and revokes remaining active tokens', async () => {
    const token = {
      id: 'token-id',
      userId: 'user-id',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    };
    refreshTokens.findOne.mockResolvedValue(token);
    refreshTokens.update
      .mockResolvedValueOnce({ affected: 0 })
      .mockResolvedValueOnce({ affected: 1 });

    await expect(service.rotate('refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(refreshTokens.update).toHaveBeenNthCalledWith(
      2,
      { userId: 'user-id', revokedAt: IsNull() },
      { revokedAt: expect.any(Date) },
    );
    expect(refreshTokens.save).not.toHaveBeenCalled();
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
