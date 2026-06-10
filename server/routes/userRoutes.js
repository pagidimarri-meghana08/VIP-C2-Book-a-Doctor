const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const {
  getProfile,
  updateProfile,
  changePassword,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/userController');

router.get('/profile',                          protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/change-password',                  protect, changePassword);

router.get('/notifications',                    protect, getNotifications);
router.put('/notifications/read-all',           protect, markAllNotificationsRead);
router.put('/notifications/:id/read',           protect, markNotificationRead);

module.exports = router;