import express from 'express';
import { param } from 'express-validator';
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const notificationIdValidation = [
  param('id').isMongoId().withMessage('Invalid notification ID format')
];

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, notificationIdValidation, markNotificationAsRead);
router.delete('/:id', protect, notificationIdValidation, deleteNotification);

export default router;