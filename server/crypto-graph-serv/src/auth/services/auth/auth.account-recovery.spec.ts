import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { AuthService } from './auth.service';
import { UserService } from '../../../user/services/user.service';
import { JwtRefreshDocument, JwtRefreshToken } from '../../schemas/jwt-session-schema';
import { User, UserDocument } from '../../schemas/user-schema';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));
jest.setTimeout(30000);

describe('AuthService Google login and password recovery', () => {
  let service: AuthService;
  let userService: UserService;
  let userModel: Model<UserDocument>;
  let jwtModel: Model<JwtRefreshDocument>;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    userService = {
      findByEmail: jest.fn(),
    } as unknown as UserService;
    userModel = {
      create: jest.fn(),
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      findOneAndUpdate: jest.fn(),
    } as unknown as Model<UserDocument>;
    jwtModel = {
      findOneAndUpdate: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      findOneAndDelete: jest.fn().mockResolvedValue({}),
    } as unknown as Model<JwtRefreshDocument>;
    service = new AuthService(
      {
        get: jest.fn((key: string) =>
          key === 'server.frontendUrl' ? 'http://localhost:4000' : 'test-secret',
        ),
      } as unknown as ConfigService,
      userService,
      { sign: jest.fn().mockReturnValue('refresh-token') } as unknown as JwtService,
      userModel,
      jwtModel,
    );
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates a Google user and establishes a refresh session', async () => {
    const newUser = {
      _id: Types.ObjectId(),
      email: 'google@example.com',
      nickname: 'Google User',
      role: 'user',
    } as User;
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(service, 'create').mockResolvedValue(newUser);

    await expect(
      service.loginWithGoogle({
        email: newUser.email,
        nickname: newUser.nickname,
      }),
    ).resolves.toEqual({ LoggedUser: newUser, tokenRefresh: 'refresh-token' });
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: newUser.email,
        nickname: newUser.nickname,
        watchlist: [],
        role: 'user',
      }),
    );
    expect(jwtModel.create).toHaveBeenCalled();
  });

  it('sends a single-use reset token without storing the raw token', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASSWORD = 'smtp-password';
    process.env.SMTP_FROM = 'user@example.com';
    const user = { _id: Types.ObjectId(), email: 'person@example.com' } as User;
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
    const sendMail = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    await service.requestPasswordReset(user.email);

    const savedReset = (userModel.findByIdAndUpdate as jest.Mock).mock.calls[0][1];
    expect(savedReset.passwordResetTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(savedReset.passwordResetTokenHash).not.toBe(
      sendMail.mock.calls[0][0].text.match(/token=([a-f0-9]+)/)[1],
    );
    expect(savedReset.passwordResetExpiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(sendMail.mock.calls[0][0].to).toBe(user.email);
  });

  it('fails explicitly when SMTP settings are missing', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_FROM;

    await expect(
      service.requestPasswordReset('person@example.com'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(userService.findByEmail).not.toHaveBeenCalled();
  });

  it('rejects invalid reset tokens', async () => {
    (userModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

    await expect(
      service.resetPassword('invalid-token', 'new-password-123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('stores the new password hash and revokes refresh sessions on reset', async () => {
    const user = { _id: Types.ObjectId() } as User;
    (userModel.findOneAndUpdate as jest.Mock).mockResolvedValue(user);

    await service.resetPassword('valid-token', 'new-password-123');

    const update = (userModel.findOneAndUpdate as jest.Mock).mock.calls[0][1];
    expect(await bcrypt.compare('new-password-123', update.password)).toBe(true);
    expect(update.$unset).toEqual({
      passwordResetTokenHash: 1,
      passwordResetExpiresAt: 1,
    });
    expect(jwtModel.findOneAndDelete).toHaveBeenCalledWith({ user: user._id });
  });
});
