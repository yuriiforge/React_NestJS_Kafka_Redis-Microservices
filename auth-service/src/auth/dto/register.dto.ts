import { IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  username!: string;

  @IsString()
  email!: string;

  @IsString()
  password!: string;
}
