import { ObjectValues } from './ObjectValues';

export const USER_ROLE = {
  EMPLOYEE: 'EMPLOYEE',
  SECRETARY: 'SECRETARY',
  MANAGER: 'MANAGER',
} as const;

export type UserRole = ObjectValues<typeof USER_ROLE>;
