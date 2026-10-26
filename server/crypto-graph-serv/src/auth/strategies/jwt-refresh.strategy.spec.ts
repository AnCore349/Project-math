import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { JwtRefreshTokenStrategy } from './jwt-refresh.strategy';

describe('JwtRefreshTokenStrategy', () => {
  let strategy: JwtRefreshTokenStrategy;
  let authService: AuthService;

  beforeEach(() => {
    authService = {
      getUserIfRefreshTokenMatches: jest.fn(),
    } as unknown as AuthService;
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    strategy = new JwtRefreshTokenStrategy(configService, authService);
  });

  it('accepts a refresh token only when its stored hash matches', async () => {
    jest
      .spyOn(authService, 'getUserIfRefreshTokenMatches')
      .mockResolvedValue(true);
    const request = {
      cookies: { tokenRefresh: 'valid-token' },
    } as Request;

    await expect(
      strategy.validate(request, {
        userId: 'user-id',
        iat: 1,
        exp: 2,
      }),
    ).resolves.toEqual({ userId: 'user-id', refreshToken: 'valid-token' });
  });

  it('rejects a refresh token that does not match its stored hash', async () => {
    jest
      .spyOn(authService, 'getUserIfRefreshTokenMatches')
      .mockResolvedValue(false);
    const request = {
      cookies: { tokenRefresh: 'invalid-token' },
    } as Request;

    await expect(
      strategy.validate(request, {
        userId: 'user-id',
        iat: 1,
        exp: 2,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a missing refresh cookie', async () => {
    const request = { cookies: {} } as Request;

    await expect(
      strategy.validate(request, {
        userId: 'user-id',
        iat: 1,
        exp: 2,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
