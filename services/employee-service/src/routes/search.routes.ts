import { Router } from 'express';
import { getAuthMiddleware } from '@hrm/common';
import { enrichEmployeeContext } from '../middleware/accessControl';
import { globalSearch } from '../controllers/search.controller';

const router = Router();
const { authenticate } = getAuthMiddleware();

router.use(authenticate);
router.use(enrichEmployeeContext);

router.get('/', globalSearch);

export default router;

