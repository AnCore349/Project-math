import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth/auth.service';
import { UserService } from '../../user/services/user.service';
import { LocalStrategy } from './local.strategy';
import { User } from '../schemas/user-schema';
import { Types } from 'mongoose';

const testUser = (password: string): User => ({
  _id: Types.ObjectId(),
  nickname: 'test-user',
  email: 'user@example.com',
  password,
  watchlist: [],
  role: 'user',
});

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(() => {
    authService = {
      isMatchPassword: jest.fn(),
    } as unknown as AuthService;
    userService = {
      findByEmail: jest.fn(),
    } as unknown as UserService;
    strategy = new LocalStrategy(authService, userService);
  });

  it('accepts a matching email and password', async () => {
    jest
      .spyOn(userService, 'findByEmail')
      .mockResolvedValue(testUser('stored-hash'));
    jest.spyOn(authService, 'isMatchPassword').mockResolvedValue(true);

    await expect(
      strategy.validate({ email: 'user@example.com', password: 'valid' }),
    ).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    jest
      .spyOn(userService, 'findByEmail')
      .mockResolvedValue(testUser('stored-hash'));
    jest.spyOn(authService, 'isMatchPassword').mockResolvedValue(false);

    await expect(
      strategy.validate({ email: 'user@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an unknown email', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

    await expect(
      strategy.validate({ email: 'missing@example.com', password: 'valid' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
