import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from 'generated/prisma/enums';
import { CreateUser } from 'lib/types/api/User';

export class CreateUserDto implements CreateUser {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
