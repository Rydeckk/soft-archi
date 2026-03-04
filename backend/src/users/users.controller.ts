import {
  Body,
  Controller,
  Delete,
  Get,
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
import { GetUserPayload } from 'decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @Roles([UserRole.SECRETARY])
  @SerializeOptions({ type: UserEntity })
  async getAll(@GetUserPayload('id') userId: string) {
    return this.userService.findAll({
      id: { not: userId },
    });
  }

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
