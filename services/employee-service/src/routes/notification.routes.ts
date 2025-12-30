import { Router } from 'express';
import { getAuthMiddleware } from '@hrm/common';
import {
  createNotification,
  sendNotification,
  getNotifications,
  getCurrentEmployeeNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from '../controllers/notification.controller';

const { authenticate } = getAuthMiddleware();

const router = Router();

router.use(authenticate);

router.get('/me', getCurrentEmployeeNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/mark-all-read', markAllAsRead);
router.get('/:id', getNotification);
router.put('/:id/read', markAsRead);
router.post('/:id/send', sendNotification);
router.delete('/:id', deleteNotification);
router.get('/', getNotifications);
router.post('/', createNotification);

export default router;

