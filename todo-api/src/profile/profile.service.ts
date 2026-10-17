import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Profile } from "./entities/profile.entity";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private repo: Repository<Profile>,
  ) {}

  async get() {
    const existing = await this.repo.find({ take: 1 });
    if (existing.length > 0) return existing[0];
    return this.repo.save(
      this.repo.create({
        username: "vi",
        displayName: "Vi",
        email: "vi@example.com",
      }),
    );
  }

  async update(dto: UpdateProfileDto) {
    const profile = await this.get();
    Object.assign(profile, dto);
    return this.repo.save(profile);
  }
}