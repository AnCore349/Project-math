import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { JwtStrategy } from './jwt-auth.stategy';
import { User } from '../schemas/user-schema';
import { Types } from 'mongoose';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userService: UserService;

  beforeEach(() => {
    userService = {
      findUser: jest.fn(),
    } as unknown as UserService;
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    strategy = new JwtStrategy(configService, userService);
  });

  it('loads the user identity from a valid access-token payload', async () => {
    jest.spyOn(userService, 'findUser').mockResolvedValue({
      _id: Types.ObjectId(),
      email: 'user@example.com',
      nickname: 'test-user',
      password: 'stored-hash',
      watchlist: [],
      role: 'user',
    } as User);

    await expect(strategy.validate({ userId: 'user-id' })).resolves.toEqual({
      id: 'user-id',
      nickname: 'test-user',
    });
  });

  it('rejects an access token for a missing user', async () => {
    jest.spyOn(userService, 'findUser').mockResolvedValue(null);

    await expect(
      strategy.validate({ userId: 'missing-user' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
