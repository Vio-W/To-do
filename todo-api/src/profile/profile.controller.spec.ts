import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;
  const profileService = {
    get: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: profileService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the authenticated identity to profile operations', () => {
    const user = { id: 'user-id', email: 'user@example.com', role: 'user' };
    const dto = { username: 'updated' };

    controller.get(user);
    controller.update(dto, user);

    expect(profileService.get).toHaveBeenCalledWith(user.id, user.email);
    expect(profileService.update).toHaveBeenCalledWith(
      dto,
      user.id,
      user.email,
    );
  });
});
