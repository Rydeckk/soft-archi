import { Reflector } from '@nestjs/core';
import { UserRole } from 'lib/enums/UserRole';

export const Roles = Reflector.createDecorator<UserRole[]>();
