import { validationResult } from 'express-validator';
import Notification from '../models/notificationModel.js';

const ensureAuthenticatedRecipient = (req, res) => {
  if (!req.user || !req.accountType) {
    res.status(401).json({ message: 'Not authorized' });
    return false;
  }

  return true;
};

export const getNotifications = async (req, res, next) => {
  try {
    if (!ensureAuthenticatedRecipient(req, res)) return;

    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    if (!ensureAuthenticatedRecipient(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    if (!ensureAuthenticatedRecipient(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};