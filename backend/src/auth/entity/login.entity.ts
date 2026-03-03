import { LoginResponse } from 'lib/types/api/Login';

export class LoginEntity implements LoginResponse {
  accessToken!: string;

  constructor(partial: Partial<LoginEntity>) {
    Object.assign(this, partial);
  }
}
