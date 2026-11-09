import { registerAs } from '@nestjs/config';

export const serverConfig = registerAs('server', () => ({
  port: parseInt(process.env.PORT),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRESIN,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRESIN,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:4100/auth/google/callback',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4000',
}));
