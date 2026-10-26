import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth/auth.service';
import { IUser } from '../../common/interfaces';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async validate(userReq: IUser): Promise<boolean> {
    const { email, password } = userReq;
    const user = await this.userService.findByEmail(email);
    if (!user || !(await this.authService.isMatchPassword(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return true;
  }
}
