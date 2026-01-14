import { verifyAccessToken } from '@hrm/common';

export const verifyIdToken = async (token: string) => {
  return verifyAccessToken(token);
};
