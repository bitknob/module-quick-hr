import { verifyAccessToken } from '../../auth-service/src/config/jwt';
import { createAuthMiddleware, setAuthMiddleware } from '@hrm/common';

const verifyToken = async (token: string) => {
  return verifyAccessToken(token);
};

const { authenticate, authorize } = createAuthMiddleware(verifyToken);

setAuthMiddleware({ authenticate, authorize });

export { authenticate, authorize };

