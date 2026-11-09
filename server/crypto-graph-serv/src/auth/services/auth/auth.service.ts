import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from '../../dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import {
  ILogin,
  IMessage,
  IRegistrationResponse,
} from '../../../common/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import {
  JwtRefreshDocument,
  JwtRefreshToken,
} from '../../schemas/jwt-session-schema';
import { CreateUserDto } from '../../dto/auth.dto';
import { User, UserDocument } from '../../schemas/user-schema';
import { createHash, randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(JwtRefreshToken.name)
    private readonly jwtModel: Model<JwtRefreshDocument>,
  ) {}

  async register(registerData: RegisterDto): Promise<IRegistrationResponse> {
    const { nickname, password } = registerData;
    const email = registerData.email.trim().toLowerCase();
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    //TODO oAuth Google
    // try {
    //     await this.oktaClient.createUser({
    //         profile: {email, login: email, firstName, lastName, userType: role, },
    //         credentials: {password: {value: password}}
    //     });
    // } catch (e) {
    //     throw new BadRequestException([e.message]);
    // }

    try {
      //TODO
      // const {user:{id, profile:{firstName, lastName}, }} = await this.oktaAuthClient.signIn({username: email, password});

      const userExists = await this.userExists(email);
      if (userExists) {
        throw new UnauthorizedException({
          message: `User with this email exist. Pleas using different email.`,
        });
      } else {
        await this.create({
          _id: Types.ObjectId(),
          nickname,
          email,
          password: hash,
          watchlist: [],
          role: 'user',
        });
        const gotUser = await this.userService.findByEmail(email);
        const token = this.getCookieWithJwtRefreshToken(gotUser._id);
        const accessToken = this.getJwtAccessToken(
          gotUser._id,
        );
        const entityRefreshToken: JwtRefreshToken = {
          user: gotUser._id,
          email: gotUser.email,
          role: gotUser.role,
          refreshToken: token,
        };
        await this.checkUserByRefreshTokenAndUpdate(entityRefreshToken);

        return { receivedUser: gotUser, accessToken, refreshToken: token };
      }
    } catch (e) {
      throw new UnauthorizedException([e.message]);
    }
  }

  async login(loginData: LoginDto): Promise<ILogin> {
    const { email, password } = loginData;
    try {
      //TODO OAuth 2.0 wit google
      // let {sessionToken} = await this.oktaAuthClient.signIn({username: email, password});
      // const {
      //     id: sessionId,
      //     userId,
      //     createdAt,
      //     expiresAt,
      //     status
      // } = await this.oktaClient.createSession({sessionToken});
      // let {profile} = await this.oktaClient.getUser(userId)

      const user = await this.userService.findByEmail(email.trim().toLowerCase());
      if (!user) throw new UnauthorizedException('Invalid email or password');
      const isMatch = await this.isMatchPassword(password, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid email or password');
      return await this.createLoginSession(user);
    } catch (err) {
      throw new UnauthorizedException([err.message]);
    }
  }

  async loginWithGoogle(profile: {
    email: string;
    nickname: string;
  }): Promise<ILogin> {
    let user = await this.userService.findByEmail(profile.email);
    if (!user) {
      user = await this.create({
        _id: Types.ObjectId(),
        email: profile.email,
        nickname: profile.nickname,
        password: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
        watchlist: [],
        role: 'user',
      });
    }
    return this.createLoginSession(user);
  }

  private async createLoginSession(user: User): Promise<ILogin> {
    const tokenRefresh = this.getCookieWithJwtRefreshToken(user._id);
    await this.checkUserByRefreshTokenAndUpdate({
      user: user._id,
      email: user.email,
      role: user.role,
      refreshToken: tokenRefresh,
    });
    return { LoggedUser: user, tokenRefresh };
  }

  isGoogleOAuthConfigured(): boolean {
    return Boolean(
      this.configService.get('server.googleClientId') &&
        this.configService.get('server.googleClientSecret'),
    );
  }

  getFrontendUrl(): string {
    return this.configService.get('server.frontendUrl');
  }

  async requestPasswordReset(email: string): Promise<void> {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = Number(process.env.SMTP_PORT || 587);
      const smtpUser = process.env.SMTP_USER;
      const smtpPassword = process.env.SMTP_PASSWORD;
      const from = process.env.SMTP_FROM || smtpUser;
      if (!smtpHost || !smtpUser || !smtpPassword || !from) {
        throw new ServiceUnavailableException(
          'Password reset email is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.',
        );
      }

      const user = await this.userService.findByEmail(email.toLowerCase());
      if (!user) return;

      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await this.userModel.findByIdAndUpdate(user._id, {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      });

      const resetUrl = new URL(
        '/reset-password',
        process.env.FRONTEND_URL ||
          this.configService.get('server.frontendUrl') ||
          'http://localhost:4000',
      );
      resetUrl.searchParams.set('token', token);

      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: smtpUser, pass: smtpPassword },
        });
        await transporter.sendMail({
          from,
          to: user.email,
          subject: 'Reset your Crypto-Graph password',
          text: `Use this link within 30 minutes to reset your password: ${resetUrl.toString()}`,
          html: `<p>Use this link within 30 minutes to reset your password:</p><p><a href="${resetUrl.toString()}">Reset password</a></p>`,
        });
      } catch (error) {
        await this.userModel.findByIdAndUpdate(user._id, {
          $unset: {
            passwordResetTokenHash: 1,
            passwordResetExpiresAt: 1,
          },
        });
        throw new ServiceUnavailableException(
          'The password reset email could not be sent. Please try again later.',
        );
      }
  }

  async resetPassword(token: string, password: string): Promise<void> {
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const user = await this.userModel.findOneAndUpdate(
        {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: { $gt: new Date() },
        },
        {
          password: await bcrypt.hash(password, 10),
          $unset: {
            passwordResetTokenHash: 1,
            passwordResetExpiresAt: 1,
          },
        },
        { new: true },
      );
      if (!user) {
        throw new UnauthorizedException(
          'This password reset link is invalid or has expired.',
        );
      }
      await this.deleteRefreshToken(user._id.toString());
  }

  //TODO OAuth 2.0 wit google
  //   getSessionBySessionId(sessionId: string): Promise<any> {
  //     const session = this.oktaClient.getSession(sessionId);
  //     // const { login, id, userId } = session;  //
  //     return {};
  // }

  async create(CreateUser: CreateUserDto): Promise<User> {
    try {
      return await this.userModel.create(CreateUser);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async isMatchPassword(pass: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pass, hash);
  }

  public getJwtAccessToken(userId: Types.ObjectId) {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: `${this.configService.get('JWT_EXPIRESIN')}s`,
    });
  }

  public getCookieWithJwtRefreshToken(userId: Types.ObjectId) {
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRESIN')}s`,
    });
    return token;
  }

  async createRefreshJwt(CreateJwtRefreshToken: JwtRefreshToken): Promise<Object> {
    try {
      return await this.jwtModel.create(CreateJwtRefreshToken);
    } catch (err) {
      throw new ServiceUnavailableException([err.message]);
    }
  }

  async checkUserByRefreshTokenAndUpdate(jwtRefreshTokenDB: JwtRefreshToken) {
    try {
      const refreshTokenHash = await bcrypt.hash(
        jwtRefreshTokenDB.refreshToken,
        10,
      );
      const session = {
        ...jwtRefreshTokenDB,
        refreshToken: refreshTokenHash,
      };
      const existingSession = await this.jwtModel.findOneAndUpdate(
        { user: jwtRefreshTokenDB.user },
        session,
      );
      if (existingSession === null) await this.createRefreshJwt(session);
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async deleteRefreshToken(userIdForDel: string): Promise<JwtRefreshToken | IMessage> {
    try {
      const resultDeleting = await this.jwtModel.findOneAndDelete({ user: Types.ObjectId(userIdForDel) });
      if (resultDeleting !== null) {
        return resultDeleting;
      } else {
        return {
          message:
            'The refresh token not exist. May be a user isn`t login/register.',
        };
      }
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const refreshTokenOld = await this.jwtModel.findOne({ user: Types.ObjectId(userId) });
      if (!refreshTokenOld) return false;
      return bcrypt.compare(refreshToken, refreshTokenOld.refreshToken);
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async setCurrentRefreshToken(refreshToken: string, userId: Types.ObjectId) {
    try {
      const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.jwtModel.findOneAndUpdate(
        { user: userId },
        { refreshToken: currentHashedRefreshToken },
      );
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async userExists(userEmail?: string, id?: string): Promise<number> {
    try {
      if (userEmail) {
        return this.userModel.findOne({ email: userEmail }).count();
      } else {
        return this.userModel.findById(id).count();
      }
    } catch (err) {
      throw new NotFoundException(err);
    }
  }
}
