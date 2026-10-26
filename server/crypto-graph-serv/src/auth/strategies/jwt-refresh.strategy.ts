import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IJwtRefreshToken } from '../../common/interfaces';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ (request: Request) => {
          return request?.cookies?.tokenRefresh;
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: IJwtRefreshToken) {
    const { userId } = payload;
    const refreshToken = request?.cookies?.tokenRefresh;
    if (!refreshToken) throw new UnauthorizedException();
    const refreshTokenValid = await this.authService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.userId,
    );
    if (!refreshTokenValid) throw new UnauthorizedException();
    return { userId, refreshToken };
  }
}
