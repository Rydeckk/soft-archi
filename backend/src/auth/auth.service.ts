import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTPaylod } from 'lib/types/JwtPayload';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser({ sub }: JWTPaylod) {
    return this.usersService.findUnique({
      id: sub,
    });
  }

  async login({ email, password: userPassword }: LoginDto) {
    const user = await this.usersService.findUnique({
      email,
    });

    const isPasswordMatch = await compare(userPassword, user?.password ?? '');

    if (!user || !isPasswordMatch) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }
}
