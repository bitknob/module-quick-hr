import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/register', DeviceController.registerDevice);
router.get('/', DeviceController.getDevices);
router.get('/:id', DeviceController.getDevice);
router.put('/:id', DeviceController.updateDevice);
router.post('/:id/deactivate', DeviceController.deactivateDevice);
router.delete('/:id', DeviceController.deleteDevice);

export default router;

