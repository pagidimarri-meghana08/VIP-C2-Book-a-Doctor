const Appointment  = require('../models/Appointment');
const Doctor       = require('../models/Doctor');
const Notification = require('../models/Notification');

// POST /api/appointments  — patient books appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, visitType, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.approvalStatus !== 'approved')
      return res.status(404).json({ success: false, message: 'Doctor not found or not approved' });

    // Prevent double-booking same slot
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict)
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });

    // Handle uploaded documents
    const documents = (req.files || []).map((f) => ({
      filename:     f.filename,
      originalName: f.originalname,
      mimetype:     f.mimetype,
    }));

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      visitType: visitType || 'In-Person',
      reason,
      documents,
    });

    // Notify doctor
    await Notification.create({
      recipient: doctor.user,
      message: `New appointment request from ${req.user.name} on ${new Date(appointmentDate).toDateString()} at ${timeSlot}`,
      type: 'appointment',
      relatedId: appointment._id,
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/my  — patient views own appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .sort({ appointmentDate: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/doctor-appointments  — doctor views appointments assigned to them
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor)
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'name email phone')
      .sort({ appointmentDate: 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/status  — doctor confirms/rejects/completes
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, doctorNotes, prescription } = req.body;

    const appointment = await Appointment.findById(req.params.id).populate('patient', 'name');
    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = status;
    if (doctorNotes)  appointment.doctorNotes  = doctorNotes;
    if (prescription) appointment.prescription = prescription;
    await appointment.save();

    // Notify patient
    const messages = {
      confirmed:  `Your appointment has been confirmed`,
      rejected:   `Your appointment request was declined by the doctor`,
      completed:  `Your consultation is marked as completed`,
    };
    if (messages[status]) {
      await Notification.create({
        recipient: appointment.patient._id,
        message: messages[status],
        type: 'appointment',
        relatedId: appointment._id,
      });
    }

    res.json({ success: true, message: `Appointment status updated to '${status}'`, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/cancel  — patient cancels
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment.patient.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorised to cancel this appointment' });

    if (['completed', 'cancelled'].includes(appointment.status))
      return res.status(400).json({ success: false, message: 'Appointment cannot be cancelled' });

    appointment.status = 'cancelled';
    appointment.cancelledBy = 'patient';
    appointment.cancellationReason = req.body.reason || '';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/:id  — get single appointment detail
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};