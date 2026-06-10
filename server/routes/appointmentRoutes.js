const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById,
} = require('../controllers/appointmentController');

// Patient
router.post('/',                protect, upload.array('documents', 5), bookAppointment);
router.get('/my',               protect, getMyAppointments);
router.put('/:id/cancel',       protect, cancelAppointment);

// Doctor
router.get('/doctor-appointments', protect, authorize('doctor'), getDoctorAppointments);
router.put('/:id/status',          protect, authorize('doctor'), updateAppointmentStatus);

// Shared (patient or doctor)
router.get('/:id',              protect, getAppointmentById);

module.exports = router;