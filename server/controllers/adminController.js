const User         = require('../models/User');
const Doctor       = require('../models/Doctor');
const Appointment  = require('../models/Appointment');
const Notification = require('../models/Notification');

// GET /api/admin/dashboard  — platform stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalDoctors, pendingDoctors, totalAppointments, completedAppointments] =
      await Promise.all([
        User.countDocuments({ role: 'patient' }),
        Doctor.countDocuments({ approvalStatus: 'approved' }),
        Doctor.countDocuments({ approvalStatus: 'pending' }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'completed' }),
      ]);

    res.json({
      success: true,
      stats: { totalUsers, totalDoctors, pendingDoctors, totalAppointments, completedAppointments },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/doctors/pending  — all pending doctor applications
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ approvalStatus: 'pending' })
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/approve  — approve doctor
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved' },
      { new: true }
    ).populate('user', 'name email');

    if (!doctor)
      return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Update user role to 'doctor'
    await User.findByIdAndUpdate(doctor.user._id, { role: 'doctor' });

    // Notify doctor
    await Notification.create({
      recipient: doctor.user._id,
      message: 'Congratulations! Your doctor application has been approved. You can now receive appointments.',
      type: 'approval',
      relatedId: doctor._id,
    });

    res.json({ success: true, message: 'Doctor approved successfully', doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/reject  — reject doctor
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected' },
      { new: true }
    ).populate('user', 'name email');

    if (!doctor)
      return res.status(404).json({ success: false, message: 'Doctor not found' });

    await Notification.create({
      recipient: doctor.user._id,
      message: `Your doctor application has been reviewed. Unfortunately, it was not approved at this time. ${req.body.reason ? 'Reason: ' + req.body.reason : ''}`,
      type: 'approval',
      relatedId: doctor._id,
    });

    res.json({ success: true, message: 'Doctor application rejected', doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users  — all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle  — activate / deactivate user
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/appointments  — all appointments on the platform
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};