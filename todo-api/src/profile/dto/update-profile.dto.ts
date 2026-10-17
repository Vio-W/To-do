import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsOptional() @IsString() @IsNotEmpty()
  username?: string;

  @IsOptional() @IsString() @IsNotEmpty()
  displayName?: string;

  @IsOptional() @IsEmail()
  email?: string;
}