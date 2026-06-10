const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getDashboardStats,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getAllUsers,
  toggleUserStatus,
  getAllAppointments,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard',            getDashboardStats);
router.get('/doctors/pending',      getPendingDoctors);
router.put('/doctors/:id/approve',  approveDoctor);
router.put('/doctors/:id/reject',   rejectDoctor);
router.get('/users',                getAllUsers);
router.put('/users/:id/toggle',     toggleUserStatus);
router.get('/appointments',         getAllAppointments);

module.exports = router;