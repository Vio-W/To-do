import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import { Profile } from './entities/profile.entity';

describe('ProfileService', () => {
  let service: ProfileService;
  let repo: {
    findOneBy: jest.Mock;
    findOneByOrFail: jest.Mock;
    create: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let query: {
    insert: jest.Mock;
    into: jest.Mock;
    values: jest.Mock;
    orUpdate: jest.Mock;
    orIgnore: jest.Mock;
    execute: jest.Mock;
  };

  beforeEach(async () => {
    query = {
      insert: jest.fn(),
      into: jest.fn(),
      values: jest.fn(),
      orUpdate: jest.fn(),
      orIgnore: jest.fn(),
      execute: jest.fn().mockResolvedValue(undefined),
    };
    Object.values(query).forEach((method) => {
      if (method !== query.execute) method.mockReturnValue(query);
    });

    repo = {
      findOneBy: jest.fn(),
      findOneByOrFail: jest.fn(),
      create: jest.fn((profile) => profile),
      createQueryBuilder: jest.fn(() => query),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('only reads the profile owned by the authenticated user', async () => {
    const profile = { userId: 'user-id' };
    repo.findOneBy.mockResolvedValue(profile);

    await expect(service.get('user-id', 'user@example.com')).resolves.toBe(
      profile,
    );
    expect(repo.findOneBy).toHaveBeenCalledWith({ userId: 'user-id' });
  });

  it('creates or updates only the authenticated user profile', async () => {
    const profile = { userId: 'user-id', username: 'updated' };
    repo.findOneByOrFail.mockResolvedValue(profile);

    await expect(
      service.update({ username: 'updated' }, 'user-id', 'user@example.com'),
    ).resolves.toBe(profile);

    expect(query.values).toHaveBeenCalledWith({
      userId: 'user-id',
      username: 'updated',
      displayName: 'user',
      email: 'user@example.com',
    });
    expect(query.orUpdate).toHaveBeenCalledWith(['username'], ['userId']);
    expect(repo.findOneByOrFail).toHaveBeenCalledWith({ userId: 'user-id' });
  });
});
