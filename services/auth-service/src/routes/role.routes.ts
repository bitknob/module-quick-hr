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
  getCreateRoleForm,
  getCreateRoleHierarchy,
  getCreateRoleChildren,
  getCreateRoleParents,
  getAllRolesHierarchy,
  getHierarchyHierarchy,
  getHierarchyChildren,
  getHierarchyParents,
} from '../controllers/role.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Specific routes must come before parameterized routes
router.post('/', createRole);
router.post('/create', createRole); // POST alias for frontend compatibility
router.get('/create', getCreateRoleForm); // GET endpoint for form metadata
router.get('/create/hierarchy', getCreateRoleHierarchy); // GET endpoint for hierarchy in create form
router.get('/create/children', getCreateRoleChildren); // GET endpoint for children in create form
router.get('/create/parents', getCreateRoleParents); // GET endpoint for parents in create form
router.get('/', getAllRoles);
router.get('/hierarchy', getAllRolesHierarchy); // GET endpoint for full role hierarchy
router.get('/hierarchy/hierarchy', getHierarchyHierarchy); // GET endpoint for hierarchy/hierarchy (alias)
router.get('/hierarchy/children', getHierarchyChildren); // GET endpoint for hierarchy/children
router.get('/hierarchy/parents', getHierarchyParents); // GET endpoint for hierarchy/parents
router.get('/initialize', initializeSystemRoles);
router.get('/hierarchy-level/:level', getRolesByHierarchyLevel);

// Parameterized routes - these will match UUIDs
// Add UUID validation middleware to prevent matching non-UUID strings
const validateUUID = (req: any, res: any, next: any) => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (id && !uuidRegex.test(id)) {
    return res.status(400).json({
      header: {
        responseCode: 400,
        responseMessage: 'Invalid role ID format. Must be a valid UUID.',
        responseDetail: '',
      },
      response: null,
    });
  }
  next();
};

router.get('/:id/hierarchy', validateUUID, getRoleHierarchy);
router.get('/:id/children', validateUUID, getChildRoles);
router.get('/:id/parents', validateUUID, getParentRoles);
router.post('/:id/menu-access', validateUUID, assignMenuAccess);
router.put('/:id/permissions', validateUUID, updatePermissions);
router.get('/:id', validateUUID, getRoleById);
router.put('/:id', validateUUID, updateRole);
router.delete('/:id', validateUUID, deleteRole);

export default router;

