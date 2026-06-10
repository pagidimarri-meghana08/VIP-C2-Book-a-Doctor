const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getAllDoctors,
  getDoctorById,
  applyAsDoctor,
  updateDoctorProfile,
  getMyDoctorProfile,
} = require('../controllers/doctorController');

router.get('/',              getAllDoctors);               // public
router.get('/my-profile',    protect, getMyDoctorProfile); // doctor
router.get('/:id',           getDoctorById);               // public

router.post('/apply',        protect, applyAsDoctor);
router.put('/profile',       protect, authorize('doctor'), updateDoctorProfile);

module.exports = router;