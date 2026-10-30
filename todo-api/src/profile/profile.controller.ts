import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.profile.get(user.id, user.email);
  }

  @Patch()
  update(@Body() dto: UpdateProfileDto, @CurrentUser() user: AuthUser) {
    return this.profile.update(dto, user.id, user.email);
  }
}
