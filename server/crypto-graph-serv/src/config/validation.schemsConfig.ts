import { object, string, number } from 'joi';
/**
 * Envs validation schema
 * @returns object typeof joi object
 */
export const createValidationSchema = () =>
  object({
    PORT: number().required(),
    JWT_SECRET: string().required(),
    JWT_REFRESH_SECRET: string().required(),
    JWT_REFRESH_EXPIRESIN: number().required(),
    DB_USER: string().required(),
    DB_PASS: string().required(),
    DB_NAME: string().required(),
    DB_HOST: string().required(),
    GOOGLE_CLIENT_ID: string().allow('').optional(),
    GOOGLE_CLIENT_SECRET: string().allow('').optional(),
    GOOGLE_CALLBACK_URL: string().uri().allow('').optional(),
    FRONTEND_URL: string().uri().allow('').optional(),
    SMTP_HOST: string().allow('').optional(),
    SMTP_PORT: number().optional(),
    SMTP_SECURE: string().valid('true', 'false').allow('').optional(),
    SMTP_USER: string().allow('').optional(),
    SMTP_PASSWORD: string().allow('').optional(),
    SMTP_FROM: string().email().allow('').optional(),
  });
