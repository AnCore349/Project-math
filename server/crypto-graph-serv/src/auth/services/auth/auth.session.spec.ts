import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../../../user/services/user.service';
import { JwtRefreshDocument, JwtRefreshToken } from '../../schemas/jwt-session-schema';
import { User, UserDocument } from '../../schemas/user-schema';

describe('AuthService sessions', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtModel: Model<JwtRefreshDocument>;

  beforeEach(() => {
    userService = {
      findByEmail: jest.fn(),
    } as unknown as UserService;
    jwtModel = {
      findOneAndUpdate: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    } as unknown as Model<JwtRefreshDocument>;

    service = new AuthService(
      { get: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService,
      userService,
      { sign: jest.fn().mockReturnValue('refresh-token') } as unknown as JwtService,
      {} as Model<UserDocument>,
      jwtModel,
    );
  });

  it('rejects login for an unknown email', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: 'password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login when the password does not match', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue({
      _id: Types.ObjectId(),
      nickname: 'test-user',
      email: 'user@example.com',
      password: 'stored-hash',
      watchlist: [],
      role: 'user',
    } as User);
    jest.spyOn(service, 'isMatchPassword').mockResolvedValue(false);

    await expect(
      service.login({ email: 'user@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('stores only a hash of the refresh token', async () => {
    const userId = Types.ObjectId();
    jest.spyOn(userService, 'findByEmail').mockResolvedValue({
      _id: userId,
      nickname: 'test-user',
      email: 'user@example.com',
      password: 'stored-hash',
      watchlist: [],
      role: 'user',
    } as User);
    jest.spyOn(service, 'isMatchPassword').mockResolvedValue(true);

    const result = await service.login({
      email: 'user@example.com',
      password: 'correct',
    });
    const createSession = jwtModel.create as jest.Mock;
    const savedSession = createSession.mock.calls[0][0] as JwtRefreshToken;

    expect(result.tokenRefresh).toBe('refresh-token');
    expect(savedSession.refreshToken).not.toBe(result.tokenRefresh);
    await expect(
      bcrypt.compare(result.tokenRefresh, savedSession.refreshToken),
    ).resolves.toBe(true);
  });
});
