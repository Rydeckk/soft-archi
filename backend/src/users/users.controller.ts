import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import { Roles } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  @Roles([UserRole.SECRETARY])
  @SerializeOptions({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Delete(':id')
  @Roles([UserRole.SECRETARY])
  @SerializeOptions({ type: UserEntity })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.deleteOne(id);
  }
}
