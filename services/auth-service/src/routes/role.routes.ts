import { Router } from 'express';
import {
  createRole,
  getRoleById,
  getAllRoles,
  updateRole,
  deleteRole,
  getRoleHierarchy,
  getRolesByHierarchyLevel,
  getChildRoles,
  getParentRoles,
  assignMenuAccess,
  updatePermissions,
  initializeSystemRoles,
} from '../controllers/role.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createRole);
router.get('/', getAllRoles);
router.get('/initialize', initializeSystemRoles);
router.get('/hierarchy-level/:level', getRolesByHierarchyLevel);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);
router.get('/:id/hierarchy', getRoleHierarchy);
router.get('/:id/children', getChildRoles);
router.get('/:id/parents', getParentRoles);
router.post('/:id/menu-access', assignMenuAccess);
router.put('/:id/permissions', updatePermissions);

export default router;

