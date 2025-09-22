import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log('password::::', password);
    console.log('username::::', username);
    
    const user = await this.usersService.findOne(username);
    console.log('user:::::', user);
    if (password === user.pswd) {
      console.log('La contraseña coincide.');
      return user;
    } else {
      console.log('La contraseña no coincide.');
      return [];
    }
  }

  async login(user: any) {
    const payload = { username: user.login, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.login,
        email: user.email,
        name: user.name,
        codigo_empresa: user.codigo_empresa,
      },
    };
  }
}