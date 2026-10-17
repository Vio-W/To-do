import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("profile")
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get() {
    return this.profile.get();
  }

  @Patch()
  update(@Body() dto: UpdateProfileDto) {
    return this.profile.update(dto);
  }
}