import jwt from 'jsonwebtoken';
import { UserRole } from '@hrm/common';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'hrm-auth-service',
    audience: 'hrm-app',
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'hrm-auth-service',
    audience: 'hrm-app',
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'hrm-auth-service',
      audience: 'hrm-app',
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'hrm-auth-service',
      audience: 'hrm-app',
    }) as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

