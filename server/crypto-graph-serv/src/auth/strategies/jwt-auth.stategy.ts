import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtUser, IResponseJWTStrategy } from '../../common/interfaces';
import { UserService } from '../../user/services/user.service';
import { Request } from 'express';
/**
 * Passport JWT Strategy
 */

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.headers.authorization;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('server.jwtSecret'),
    });
  }

  async validate(payload: IJwtUser): Promise<IResponseJWTStrategy> {
    const user = await this.userService.findUser(payload.userId);
    if (!user) throw new UnauthorizedException();
    return { id: payload.userId, nickname: user.nickname };
  }
}
