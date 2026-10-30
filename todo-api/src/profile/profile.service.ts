import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private repo: Repository<Profile>,
  ) {}

  private defaultProfile(userId: string, email: string) {
    const username = email.split('@')[0];
    return {
      userId,
      username,
      displayName: username,
      email,
    };
  }

  async get(userId: string, email: string) {
    const profile = await this.repo.findOneBy({ userId });
    return profile ?? this.repo.create(this.defaultProfile(userId, email));
  }

  async update(dto: UpdateProfileDto, userId: string, email: string) {
    const query = this.repo
      .createQueryBuilder()
      .insert()
      .into(Profile)
      .values({ ...this.defaultProfile(userId, email), ...dto });

    const fieldsToUpdate = Object.keys(dto);
    if (fieldsToUpdate.length > 0) {
      query.orUpdate(fieldsToUpdate, ['userId']);
    } else {
      query.orIgnore();
    }

    await query.execute();
    return this.repo.findOneByOrFail({ userId });
  }
}
