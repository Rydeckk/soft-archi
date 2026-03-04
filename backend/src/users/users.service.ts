import { Injectable } from '@nestjs/common';
import { UserWhereInput, UserWhereUniqueInput } from 'generated/prisma/models';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(where: UserWhereInput) {
    return this.prisma.user.findMany({
      where,
    });
  }

  async create({ password, ...data }: CreateUserDto) {
    const hashedPassword = await hash(password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findUnique(where: UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where,
    });
  }

  async deleteOne(id: string) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
