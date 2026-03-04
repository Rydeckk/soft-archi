import { Body, Controller, Post, SerializeOptions } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './constants';
import { LoginEntity } from './entity/login.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @SerializeOptions({ type: LoginEntity })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
