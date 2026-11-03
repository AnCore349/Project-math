import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('server.googleClientId') || 'not-configured',
      clientSecret:
        configService.get('server.googleClientSecret') || 'not-configured',
      callbackURL: configService.get('server.googleCallbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): { email: string; nickname: string } {
    const googleProfile = profile._json as {
      email?: string;
      email_verified?: boolean;
    };
    if (!googleProfile.email || !googleProfile.email_verified) {
      throw new UnauthorizedException('A verified Google email is required.');
    }

    return {
      email: googleProfile.email.toLowerCase(),
      nickname: profile.displayName || googleProfile.email.split('@')[0],
    };
  }
}
