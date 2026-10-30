import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(72)
  password: string;
}