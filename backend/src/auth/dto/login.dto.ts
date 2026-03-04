import { IsEmail, IsString } from 'class-validator';
import { LoginRequest } from 'lib/types/api/Login';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
