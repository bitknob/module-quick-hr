import { verifyAccessToken } from '../../auth-service/src/config/jwt';

export const verifyIdToken = async (token: string) => {
  return verifyAccessToken(token);
};
