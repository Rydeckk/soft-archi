import { Exclude, Expose } from 'class-transformer';
import { UserRole } from 'lib/enums/UserRole';
import { User } from 'lib/types/api/User';

@Exclude()
export class UserEntity implements User {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  password!: string;

  @Expose()
  role!: UserRole;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
