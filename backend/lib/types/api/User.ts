import { UserRole } from 'lib/enums/UserRole';

export type CreateUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};
