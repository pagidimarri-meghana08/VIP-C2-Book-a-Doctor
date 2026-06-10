const Doctor       = require('../models/Doctor');
const User         = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/doctors  — list all approved doctors (public)
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialty, location, search } = req.query;
    const filter = { approvalStatus: 'approved', isAvailable: true };

    if (specialty) filter.specialty = new RegExp(specialty, 'i');
    if (location)  filter.location  = new RegExp(location, 'i');

    let doctors = await Doctor.find(filter).populate('user', 'name email phone profileImage');

    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');
    if (!doctor)
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctors/apply  — patient applies to become a doctor (protected)
exports.applyAsDoctor = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ user: req.user._id });
    if (existing)
      return res.status(400).json({ success: false, message: 'Application already submitted' });

    const { specialty, qualifications, experience, consultationFee, hospital, location, bio, availableSlots } = req.body;

    const doctor = await Doctor.create({
      user: req.user._id,
      specialty,
      qualifications,
      experience,
      consultationFee,
      hospital,
      location,
      bio,
      availableSlots: availableSlots || [],
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          recipient: admin._id,
          message: `New doctor application from ${req.user.name} (${specialty})`,
          type: 'approval',
          relatedId: doctor._id,
        })
      )
    );

    res.status(201).json({ success: true, message: 'Application submitted — awaiting admin approval', doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctors/profile  — doctor updates own profile (protected, doctor only)
exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!doctor)
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/my-profile  — doctor's own profile (protected)
exports.getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!doctor)
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};