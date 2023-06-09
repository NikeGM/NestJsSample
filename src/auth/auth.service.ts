import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, UserLoginData } from './auth.interface';
import { UserService } from '../user/user.service';
import { Logger } from '@nestjs/common';

// AuthService handles user authentication, including JWT creation
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService
  ) {
  }

  // login function validates user credentials and issues a JWT
  async login(userLoginData: UserLoginData) {
    try {
      const user = await this.usersService.validateUser(userLoginData);
      if (!user) {
        this.logger.warn(`Failed login attempt for username: ${userLoginData.username}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = { userId: user.userId };
      const accessToken = this.jwtService.sign(payload);

      return {
        expiresIn: process.env.TOKEN_EXPIRATION_TIME,
        accessToken
      };
    } catch (error) {
      this.logger.error('Error in login', error.stack);
      throw error;
    }
  }
}
