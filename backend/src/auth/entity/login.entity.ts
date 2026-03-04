import { Type } from 'class-transformer';
import { LoginResponse } from 'lib/types/api/Login';
import { UserEntity } from 'src/users/entity/user.entity';

export class LoginEntity implements LoginResponse {
  accessToken!: string;

  @Type(() => UserEntity)
  user!: UserEntity;

  constructor(partial: Partial<LoginEntity>) {
    Object.assign(this, partial);
  }
}
